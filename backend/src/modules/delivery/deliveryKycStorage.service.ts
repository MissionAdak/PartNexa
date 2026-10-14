import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AppError from '../../utils/AppError';
import config from '../../config/env';

export const BUCKET_NAME = 'delivery-kyc';
const LOCAL_SECURE_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'secure-kyc', BUCKET_NAME);

// Ensure local secure directory exists for local/test development
if (!fs.existsSync(LOCAL_SECURE_DIR)) {
  fs.mkdirSync(LOCAL_SECURE_DIR, { recursive: true });
}

// In-memory buffer store for offline unit tests
const memoryStore = new Map<string, { buffer: Buffer; mimeType: string; originalName: string; size: number }>();

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Validates binary magic bytes to prevent spoofed extensions or malicious executables.
 */
export const validateMagicBytes = (buffer: Buffer, declaredMime: string): boolean => {
  if (!buffer || buffer.length < 4) return false;

  // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return declaredMime.toLowerCase().includes('pdf');
  }

  // JPEG magic bytes: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return declaredMime.toLowerCase().includes('jpeg') || declaredMime.toLowerCase().includes('jpg');
  }

  // PNG magic bytes: 0x89 0x50 0x4E 0x47 (‰PNG)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return declaredMime.toLowerCase().includes('png');
  }

  // WebP magic bytes: 'RIFF' .... 'WEBP'
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return declaredMime.toLowerCase().includes('webp');
  }

  return false;
};

/**
 * Returns an authenticated Supabase server client using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Never exposes service role key to clients.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const isConfigured =
    Boolean(url) &&
    !url.includes('[PROJECT_REF]') &&
    !url.includes('your_supabase') &&
    Boolean(key) &&
    !key.includes('your_supabase');

  if (!isConfigured) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Ensures the private delivery-kyc bucket exists in Supabase.
 */
let bucketEnsured = false;
export const ensureBucketExists = async (supabase: SupabaseClient): Promise<void> => {
  if (bucketEnsured) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('[StorageService] Could not list Supabase buckets:', error.message);
      return;
    }
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Strict private bucket for sensitive KYC data
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
      if (createErr) {
        console.warn('[StorageService] Error creating private delivery-kyc bucket:', createErr.message);
      }
    }
    bucketEnsured = true;
  } catch (err: any) {
    console.warn('[StorageService] Bucket check exception:', err?.message || err);
  }
};

/**
 * Stores uploaded KYC document securely into persistent object storage (Supabase private bucket).
 * In production: Supabase Storage is mandatory. If it fails, throw a clear upload failure.
 * Local disk fallback exists ONLY for local development or offline test mode.
 */
export const saveKycDocumentFile = async ({
  userId,
  documentType,
  file,
}: {
  userId: string;
  documentType: string;
  file: Express.Multer.File;
}): Promise<{
  objectKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}> => {
  if (!file) {
    throw AppError.badRequest('No file uploaded.');
  }

  // 1. File size enforcement
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw AppError.badRequest('File must be less than 10 MB');
  }

  // 2. MIME type validation
  const normalizedMime = file.mimetype.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    throw AppError.badRequest(
      'Invalid file format. Only JPEG, PNG, WebP images and PDF documents are allowed.'
    );
  }

  // 3. Magic bytes inspection
  if (file.buffer && !validateMagicBytes(file.buffer, normalizedMime)) {
    throw AppError.badRequest(
      'File signature mismatch. The file content does not match its declared format.'
    );
  }

  // 4. Safe filename generation
  const ext = normalizedMime === 'application/pdf'
    ? '.pdf'
    : normalizedMime === 'image/png'
    ? '.png'
    : normalizedMime === 'image/webp'
    ? '.webp'
    : '.jpg';

  const cleanDocType = documentType.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase() || 'DOCUMENT';
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const safeFilename = `kyc_${cleanDocType}_${Date.now()}_${uniqueId}${ext}`;
  // Authoritative storage path: delivery-kyc/{userId}/{safeFileName}
  const storagePath = `${userId}/${safeFilename}`;
  const objectKey = `${BUCKET_NAME}/${storagePath}`;

  const supabase = getSupabaseClient();
  const isProduction = process.env.NODE_ENV === 'production' || (!config.useInMemoryDb && Boolean(process.env.SUPABASE_URL));

  // 5. Store in Supabase Storage if configured
  if (supabase) {
    try {
      await ensureBucketExists(supabase);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
          contentType: normalizedMime,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Generate initial short-lived signed URL (15 minutes) for immediate frontend preview
      const { data: signedData, error: signError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 900);

      const signedUrl = !signError && signedData?.signedUrl
        ? signedData.signedUrl
        : `/api/delivery/kyc/files/${encodeURIComponent(objectKey)}`;

      return {
        objectKey,
        fileUrl: signedUrl,
        mimeType: normalizedMime,
        fileSize: file.size,
      };
    } catch (err: any) {
      console.error('[StorageService] Supabase upload failed:', err.message);
      // In production: DO NOT silently fall back to ephemeral Render disk!
      if (isProduction) {
        throw AppError.internal(
          `KYC secure upload failed: Supabase Storage error (${err.message}). Upload not saved to ephemeral disk.`
        );
      }
      console.warn('[StorageService] Development mode: falling back to local secure disk store.');
    }
  } else if (isProduction && !config.useInMemoryDb) {
    // Production environment without Supabase credentials must not silently pretend it worked
    throw AppError.internal(
      'Production storage error: Supabase Storage credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.'
    );
  }

  // 6. Secure local storage fallback for local development / offline test mode
  const userDir = path.join(LOCAL_SECURE_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, safeFilename);
  if (file.buffer) {
    fs.writeFileSync(filePath, file.buffer);
    memoryStore.set(objectKey, {
      buffer: file.buffer,
      mimeType: normalizedMime,
      originalName: file.originalname,
      size: file.size,
    });
  }

  const proxyUrl = `/api/delivery/kyc/files/${encodeURIComponent(objectKey)}`;

  return {
    objectKey,
    fileUrl: proxyUrl,
    mimeType: normalizedMime,
    fileSize: file.size,
  };
};

/**
 * Creates a short-lived signed URL for private KYC document preview.
 * Uses official Supabase client createSignedUrl when configured.
 * Falls back to local HMAC signed URL only for offline/test mode.
 */
export const createSignedKycUrl = async (
  objectKey: string,
  expiresInSeconds: number = 900
): Promise<string> => {
  if (!objectKey) return '';

  const cleanPath = objectKey.startsWith(`${BUCKET_NAME}/`)
    ? objectKey.slice(BUCKET_NAME.length + 1)
    : objectKey;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(cleanPath, expiresInSeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err: any) {
      console.warn('[StorageService] Error creating Supabase signed URL:', err.message);
    }
  }

  // Local signed HMAC URL fallback
  const secret = config.jwt.accessSecret || 'partsphere_secure_kyc_signing_salt_2024';
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = `${objectKey}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return `/api/delivery/kyc/secure-file?key=${encodeURIComponent(objectKey)}&expires=${expiresAt}&sig=${hmac}`;
};

/**
 * Synchronous fallback generator for legacy callers requiring immediate string return.
 */
export const createSignedKycUrlSync = (
  objectKey: string,
  expiresInSeconds: number = 900
): string => {
  const secret = config.jwt.accessSecret || 'partsphere_secure_kyc_signing_salt_2024';
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = `${objectKey}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return `/api/delivery/kyc/secure-file?key=${encodeURIComponent(objectKey)}&expires=${expiresAt}&sig=${hmac}`;
};

/**
 * Verifies signed KYC file URL HMAC signature and expiration for proxy requests.
 */
export const verifySignedKycToken = (
  objectKey: string,
  expiresAtStr: string,
  providedSignature: string
): boolean => {
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false; // Expired
  }

  const secret = config.jwt.accessSecret || 'partsphere_secure_kyc_signing_salt_2024';
  const payload = `${objectKey}:${expiresAt}`;
  const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const providedBuf = Buffer.from(providedSignature || '', 'utf8');
  const expectedBuf = Buffer.from(expectedHmac, 'utf8');
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
};

/**
 * Resolves file buffer from Supabase Storage, memory store, or secure local disk.
 * Production files stored in Supabase are safely downloaded so preview/download NEVER fails.
 */
export const retrieveKycFileBuffer = async (
  objectKey: string
): Promise<{ buffer: Buffer; mimeType: string } | null> => {
  if (!objectKey) return null;

  // 1. Check in-memory test store
  const mem = memoryStore.get(objectKey);
  if (mem) {
    return { buffer: mem.buffer, mimeType: mem.mimeType };
  }

  const cleanPath = objectKey.startsWith(`${BUCKET_NAME}/`)
    ? objectKey.slice(BUCKET_NAME.length + 1)
    : objectKey;

  // 2. Fetch from authoritative Supabase Storage
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(cleanPath);
      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(cleanPath).toLowerCase();
        const mimeType = ext === '.pdf'
          ? 'application/pdf'
          : ext === '.png'
          ? 'image/png'
          : ext === '.webp'
          ? 'image/webp'
          : 'image/jpeg';
        return { buffer, mimeType };
      }
    } catch (err: any) {
      console.warn('[StorageService] Error downloading from Supabase Storage:', err.message);
    }
  }

  // 3. Check secure local directory
  const relativeParts = cleanPath.split('/');
  const filePath = path.join(LOCAL_SECURE_DIR, ...relativeParts);

  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.pdf'
      ? 'application/pdf'
      : ext === '.png'
      ? 'image/png'
      : ext === '.webp'
      ? 'image/webp'
      : 'image/jpeg';
    return { buffer, mimeType };
  }

  return null;
};

/**
 * Deletes a KYC document from private Supabase Storage and local disk/memory.
 * Prevents orphaned sensitive identity documents when documents are replaced or removed.
 */
export const deleteKycDocumentFile = async (objectKey: string): Promise<boolean> => {
  if (!objectKey) return false;

  const cleanPath = objectKey.startsWith(`${BUCKET_NAME}/`)
    ? objectKey.slice(BUCKET_NAME.length + 1)
    : objectKey;

  // 1. Delete from Supabase Storage
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([cleanPath]);
      if (error) {
        console.warn('[StorageService] Failed to delete object from Supabase:', error.message);
      }
    } catch (err: any) {
      console.warn('[StorageService] Exception deleting object from Supabase:', err.message);
    }
  }

  // 2. Delete from memory store
  memoryStore.delete(objectKey);

  // 3. Delete from local disk
  try {
    const relativeParts = cleanPath.split('/');
    const filePath = path.join(LOCAL_SECURE_DIR, ...relativeParts);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore if not present locally
  }

  return true;
};
