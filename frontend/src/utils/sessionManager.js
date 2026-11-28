/**
 * Sistem Manajemen Sesi & Auto-Logout Inaktivitas NetPulse Log
 * Konfigurasi batas waktu mudah disesuaikan melalui konstanta berikut:
 */
export const MAX_SESSION_MS = 2 * 60 * 60 * 1000; // Batas maksimal sesi login: 2 jam
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;    // Batas diam / inaktivitas: 15 menit

export const STORAGE_KEYS = {
  TOKEN: 'netpulse_token',
  USER: 'netpulse_user',
  LOGIN_AT: 'netpulse_login_at',
  LAST_ACTIVITY_AT: 'netpulse_last_activity_at',
};

/**
 * Catat waktu login awal dan waktu aktivitas pertama saat login berhasil
 */
export function recordLoginSession() {
  const now = Date.now().toString();
  localStorage.setItem(STORAGE_KEYS.LOGIN_AT, now);
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, now);
}

/**
 * Perbarui lastActivityAt saat pengguna berinteraksi (dibatasi throttle 2 detik)
 */
let lastSavedActivity = 0;
export function updateLastActivity() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return;

  const now = Date.now();
  if (now - lastSavedActivity > 2000) {
    lastSavedActivity = now;
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, now.toString());
  }
}

/**
 * Hapus seluruh data sesi di localStorage
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.LOGIN_AT);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY_AT);
}

/**
 * Cek apakah sesi login telah kadaluarsa:
 * - Melewati batas MAX_SESSION_MS (2 jam) sejak waktu login
 * - Melewati batas IDLE_TIMEOUT_MS (15 menit) sejak aktivitas terakhir
 */
export function isSessionExpired() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return false;

  const rawLoginAt = localStorage.getItem(STORAGE_KEYS.LOGIN_AT);
  const rawLastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY_AT);

  // Jika token ada namun belum tercatat timestamp, inisialisasi sekarang
  if (!rawLoginAt || !rawLastActivity) {
    recordLoginSession();
    return false;
  }

  const now = Date.now();
  const loginAt = parseInt(rawLoginAt, 10);
  const lastActivityAt = parseInt(rawLastActivity, 10);

  // 1. Batas maksimal sesi sejak login (2 jam)
  if (now - loginAt > MAX_SESSION_MS) {
    return true;
  }

  // 2. Batas waktu diam / inaktivitas (15 menit)
  if (now - lastActivityAt > IDLE_TIMEOUT_MS) {
    return true;
  }

  return false;
}

/**
 * Hapus data sesi di localStorage dan arahkan pengguna ke /login?reason=expired
 */
export function handleExpiredSession(reason = 'expired') {
  clearSession();
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    if (!currentPath.startsWith('/login') || !currentSearch.includes(`reason=${reason}`)) {
      window.location.href = `/login?reason=${reason}`;
    }
  }
}

/**
 * Pasang monitor aktivitas pengguna dan interval pengecekan berkala
 * @param {Function} onSessionExpired - Callback opsional saat sesi kadaluarsa
 * @returns {Function} Teardown cleanup function
 */
export function initSessionMonitor(onSessionExpired) {
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

  const handleActivity = () => {
    updateLastActivity();
  };

  activityEvents.forEach((evt) => {
    window.addEventListener(evt, handleActivity, { passive: true });
  });

  const checkStatus = () => {
    if (isSessionExpired()) {
      if (typeof onSessionExpired === 'function') {
        onSessionExpired();
      }
      handleExpiredSession('expired');
    }
  };

  // Cek saat monitor baru dipasang
  checkStatus();

  // Pengecekan berkala setiap 10 detik
  const intervalId = setInterval(checkStatus, 10000);

  // Pengecekan saat tab browser kembali aktif
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkStatus();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    activityEvents.forEach((evt) => {
      window.removeEventListener(evt, handleActivity);
    });
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
