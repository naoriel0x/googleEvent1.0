import type { LBH } from '@/types';
import LBHData from '@/data/lbh.json';

/**
 * Haversine formula untuk menghitung jarak antara dua koordinat GPS
 * @param lat1 Latitude titik 1
 * @param lng1 Longitude titik 1
 * @param lat2 Latitude titik 2
 * @param lng2 Longitude titik 2
 * @returns Jarak dalam kilometer
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Mendapatkan LBH terdekat berdasarkan koordinat
 * @param lat Latitude
 * @param lng Longitude
 * @param maxDistance Jarak maksimal dalam km (default 50)
 * @returns Array LBH yang diurutkan berdasarkan jarak
 */
export function getNearbyLBH(lat: number, lng: number, maxDistance: number = 50): LBH[] {
  const lbhWithDistance = (LBHData as LBH[]).map((lbh) => ({
    ...lbh,
    distance: calculateDistance(lat, lng, lbh.lat, lbh.lng),
  }));

  return lbhWithDistance
    .filter((lbh) => lbh.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map((lbh): LBH => {
      const { distance: _, ...rest } = lbh; void _;
      return rest;
    });
}

/**
 * Format jarak untuk ditampilkan ke user
 * @param km Jarak dalam kilometer
 * @returns String format jarak
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Mendapatkan semua LBH
 * @returns Array semua LBH
 */
export function getAllLBH(): LBH[] {
  return LBHData as LBH[];
}

/**
 * Filter LBH berdasarkan spesialisasi
 * @param specialization Jenis pelanggaran yang ingin difilter
 * @returns Array LBH yang sesuai
 */
export function filterLBHBySpecialization(specialization: string): LBH[] {
  return (LBHData as LBH[]).filter((lbh) =>
    (lbh.specialization as string[]).includes(specialization)
  );
}
