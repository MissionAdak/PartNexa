import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { vehiclesService } from '../services';
import toast from 'react-hot-toast';

export const ACTIVE_VEHICLE_STORAGE_KEY = 'partnexa_active_vehicle_id';

const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [primaryVehicle, setPrimaryVehicleState] = useState(null);
  const [activeVehicle, setActiveVehicleState] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const { data } = await vehiclesService.getGarage();
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setVehicles(list);

        // 1. Persistent Primary Vehicle in Database
        const primary = list.find((v) => v.isPrimary) || list[0] || null;
        setPrimaryVehicleState(primary);

        // 2. Persistent Active / Fitment Vehicle in LocalStorage
        // Does NOT reset to Primary if a valid active vehicle ID is saved
        const savedActiveId = localStorage.getItem(ACTIVE_VEHICLE_STORAGE_KEY);
        let resolvedActive = null;

        if (savedActiveId && list.length > 0) {
          resolvedActive = list.find(
            (v) =>
              v.id === savedActiveId ||
              v.variantId === savedActiveId ||
              v.variant?.id === savedActiveId
          );
        }

        // 3. Fallback to Primary vehicle
        if (!resolvedActive && primary) {
          resolvedActive = primary;
        }

        // 4. Fallback to first garage vehicle
        if (!resolvedActive && list.length > 0) {
          resolvedActive = list[0];
        }

        setActiveVehicleState(resolvedActive);

        if (resolvedActive?.id) {
          localStorage.setItem(ACTIVE_VEHICLE_STORAGE_KEY, resolvedActive.id);
        } else {
          localStorage.removeItem(ACTIVE_VEHICLE_STORAGE_KEY);
        }
      } catch (err) {
        console.error('Failed to load garage vehicles:', err);
        setVehicles([]);
        setPrimaryVehicleState(null);
        setActiveVehicleState(null);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest local active vehicle fallback
      const saved = localStorage.getItem('partsphere_guest_vehicle');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setVehicles([parsed]);
          setPrimaryVehicleState(parsed);
          setActiveVehicleState(parsed);
        } catch {
          setVehicles([]);
          setPrimaryVehicleState(null);
          setActiveVehicleState(null);
        }
      } else {
        setVehicles([]);
        setPrimaryVehicleState(null);
        setActiveVehicleState(null);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  /**
   * Switch Active Fitment Vehicle (Catalog / Navbar / Compatibility)
   * Does NOT alter the persistent Primary vehicle in database
   */
  const switchActiveVehicle = (vehicle) => {
    if (!vehicle) return;

    let target = vehicle;
    if (typeof vehicle === 'string') {
      target = vehicles.find((v) => v.id === vehicle || v.variantId === vehicle) || { id: vehicle };
    }

    setActiveVehicleState(target);

    if (target.id) {
      localStorage.setItem(ACTIVE_VEHICLE_STORAGE_KEY, target.id);
    } else if (target.variantId) {
      localStorage.setItem(ACTIVE_VEHICLE_STORAGE_KEY, target.variantId);
    }

    const name =
      target.nickname ||
      `${target.variant?.model?.make?.name || ''} ${target.variant?.model?.name || ''}`.trim() ||
      'Selected Vehicle';

    toast.success(`Active fitment switched to ${name}!`);
    return target;
  };

  const selectVehicleForFitment = (vehicle) => {
    return switchActiveVehicle(vehicle);
  };

  const addVehicle = async (vehicleData) => {
    if (user) {
      try {
        const { data } = await vehiclesService.addVehicle(vehicleData);
        const created = data.data;

        // Automatically set newly added vehicle as active
        if (created?.id) {
          localStorage.setItem(ACTIVE_VEHICLE_STORAGE_KEY, created.id);
        }

        await fetchVehicles();
        toast.success('Vehicle added to your garage!');
        return created;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add vehicle.';
        toast.error(msg);
        throw err;
      }
    } else {
      // Guest vehicle fallback
      const guestVehicle = {
        id: `guest_veh_${Date.now()}`,
        nickname: vehicleData.nickname || 'My Vehicle',
        regNumber: vehicleData.regNumber || '',
        isPrimary: true,
        variant: vehicleData.variant || {
          id: vehicleData.variantId,
          name: 'Standard Variant',
          year: 2022,
          model: { name: 'Vehicle', make: { name: 'Brand' } },
        },
      };
      setVehicles([guestVehicle]);
      setPrimaryVehicleState(guestVehicle);
      setActiveVehicleState(guestVehicle);
      localStorage.setItem('partnexa_guest_vehicle', JSON.stringify(guestVehicle));
      localStorage.setItem(ACTIVE_VEHICLE_STORAGE_KEY, guestVehicle.id);
      toast.success('Vehicle added to active session!');
      return guestVehicle;
    }
  };

  const updateVehicle = async (id, updateData) => {
    if (user) {
      try {
        const { data } = await vehiclesService.updateVehicle(id, updateData);
        await fetchVehicles();
        toast.success('Vehicle details updated!');
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updateData } : v))
      );
      toast.success('Vehicle updated!');
    }
  };

  /**
   * Make Persistent Primary Vehicle in Database
   * Keeps current Active Vehicle selection intact!
   */
  const setPrimaryVehicle = async (id) => {
    if (user) {
      try {
        const { data } = await vehiclesService.setPrimaryVehicle(id);
        // fetchVehicles preserves partnexa_active_vehicle_id, keeping active vehicle unchanged!
        await fetchVehicles();
        toast.success('Primary vehicle updated in database!');
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to set primary vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, isPrimary: v.id === id }))
      );
      const sel = vehicles.find((v) => v.id === id);
      if (sel) {
        setPrimaryVehicleState(sel);
      }
      toast.success('Primary vehicle updated!');
    }
  };

  const deleteVehicle = async (id) => {
    if (user) {
      try {
        const savedActiveId = localStorage.getItem(ACTIVE_VEHICLE_STORAGE_KEY);
        if (savedActiveId === id) {
          localStorage.removeItem(ACTIVE_VEHICLE_STORAGE_KEY);
        }
        await vehiclesService.removeVehicle(id);
        await fetchVehicles();
        toast.success('Vehicle removed from garage.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setPrimaryVehicleState(null);
      setActiveVehicleState(null);
      localStorage.removeItem('partsphere_guest_vehicle');
      localStorage.removeItem(ACTIVE_VEHICLE_STORAGE_KEY);
      toast.success('Vehicle removed.');
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        primaryVehicle,
        activeVehicle: activeVehicle || primaryVehicle,
        loading,
        fetchVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setPrimaryVehicle,
        switchActiveVehicle,
        selectVehicleForFitment,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

export const useVehicle = useVehicles;

export default VehicleContext;
