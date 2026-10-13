import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AppError from '../../utils/AppError';
import config from '../../config/env';

const BUCKET_NAME = 'delivery-kyc';
const LOCAL_SECURE_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'secure-kyc', BUCKET_NAME);

// Ensure local secure directory exists
if (!fs.existsSync(LOCAL_SECURE_DIR)) {
  fs.mkdirSync(LOCAL_SECURE_DIR, { recursive: true });
}

// In-memory buffer store for test/mock offline execution
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
 * Checks if Supabase object storage is configured with live credentials.
 */
const isSupabaseConfigured = (): boolean => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return (
    Boolean(url) &&
    !url.includes('[PROJECT_REF]') &&
    !url.includes('your_supabase') &&
    Boolean(key) &&
    !key.includes('your_supabase')
  );
};

/**
 * Stores uploaded KYC document securely into persistent object storage (Supabase or protected disk).
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
  const objectKey = `${BUCKET_NAME}/${userId}/${safeFilename}`;

  // 5. Store in Supabase Storage if configured
  if (isSupabaseConfigured()) {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/+$/, '');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${userId}/${safeFilename}`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': normalizedMime,
          'x-upsert': 'true',
        },
        body: file.buffer,
      });

      if (response.ok) {
        // Generate pre-signed URL via Supabase Storage
        const signUrl = `${supabaseUrl}/storage/v1/object/sign/${BUCKET_NAME}/${userId}/${safeFilename}`;
        const signRes = await fetch(signUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expiresIn: 900 }), // 15 minutes
        });

        if (signRes.ok) {
          const signData: any = await signRes.json();
          const signedUrl = signData.signedURL
            ? `${supabaseUrl}/storage/v1${signData.signedURL}`
            : uploadUrl;

          return {
            objectKey,
            fileUrl: signedUrl,
            mimeType: normalizedMime,
            fileSize: file.size,
          };
        }
      }
    } catch (err: any) {
      console.warn('[StorageService] Supabase upload failed, falling back to secure local store:', err.message);
    }
  }

  // 6. Secure local storage fallback (Never exposed to anonymous public web)
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

  // Generate safe proxy access path (requiring authenticated session or signature token)
  const proxyUrl = `/api/delivery/kyc/files/${encodeURIComponent(objectKey)}`;

  return {
    objectKey,
    fileUrl: proxyUrl,
    mimeType: normalizedMime,
    fileSize: file.size,
  };
};

/**
 * Creates a signed short-lived URL with HMAC signature for private document review.
 */
export const createSignedKycUrl = (objectKey: string, expiresInSeconds: number = 900): string => {
  const secret = config.jwt.accessSecret || 'partsphere_secure_kyc_signing_salt_2024';
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = `${objectKey}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return `/api/delivery/kyc/secure-file?key=${encodeURIComponent(objectKey)}&expires=${expiresAt}&sig=${hmac}`;
};

/**
 * Verifies signed KYC file URL HMAC signature and expiration.
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
 * Resolves file buffer from memory store or secure disk.
 */
export const retrieveKycFileBuffer = (
  objectKey: string
): { buffer: Buffer; mimeType: string } | null => {
  // Check memory store
  const mem = memoryStore.get(objectKey);
  if (mem) {
    return { buffer: mem.buffer, mimeType: mem.mimeType };
  }

  // Check secure local directory
  const relativeParts = objectKey.replace(/^delivery-kyc\//, '').split('/');
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
