import { createWorker } from 'tesseract.js';

/**
 * 1. Pra-pemrosesan gambar menggunakan HTML5 Canvas
 * Mengubah ukuran secara proporsional jika lebar > 1280px,
 * konversi ke grayscale, dan meningkatkan kontras teks agar OCR cepat dan akurat (~1-2 detik).
 * 
 * @param {File|Blob|string} imageSource - File gambar, Blob, atau Data URL
 * @returns {Promise<HTMLCanvasElement>} Canvas hasil pra-pemrosesan
 */
export async function preprocessImage(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const maxDimension = 1280;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Skala proporsional jika lebih besar dari 1280px
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Gambar ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Ambil data piksel untuk grayscale & kontras
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Kontras factor (+50 level kontras)
        const contrast = 55;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Terapkan kontras
          let enhanced = factor * (gray - 128) + 128;
          if (enhanced < 0) enhanced = 0;
          if (enhanced > 255) enhanced = 255;

          data[i] = enhanced;     // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(new Error('Gagal memuat gambar untuk pra-pemrosesan: ' + err.message));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      reject(new Error('Format imageSource tidak didukung'));
    }
  });
}

/**
 * 2. Normalisasi Teks Mentah Hasil OCR
 * Mengoreksi karakter umum yang sering salah terbaca (dash, koma desimal, dll)
 * 
 * @param {string} rawText - Teks mentah dari Tesseract
 * @returns {string} Teks ternormalisasi
 */
export function cleanAndNormalizeOcrText(rawText) {
  if (!rawText) return '';
  return rawText
    // Ganti dash panjang, en-dash, minus unicode dengan minus biasa
    .replace(/[—–−]/g, '-')
    // Ganti underscore sebelum angka dengan minus
    .replace(/_(\d+)/g, '-$1')
    // Ganti koma desimal antara angka menjadi titik desimal (misal -7,0512 -> -7.0512)
    .replace(/(\d+),(\d+)/g, '$1.$2')
    // Normalisasi baris baru dan spasi
    .replace(/\r\n/g, '\n');
}

/**
 * 3. Position-Independent Regex Parser untuk Screenshot G-NetTrack
 * Mengekstrak 6 parameter wajib tanpa bergantung pada posisi bounding-box koordinat.
 * 
 * @param {string} text - Teks dari OCR
 * @returns {Object} { enb_id, latitude, longitude, rsrp, rsrq, snr }
 */
export function parseGNetTrackData(text) {
  const normalized = cleanAndNormalizeOcrText(text);

  const result = {
    enb_id: '',
    latitude: '',
    longitude: '',
    rsrp: '',
    rsrq: '',
    snr: '',
  };

  // 1) Base Station ID (eNB)
  // Menangkap label eNB, eNodeB, ENB, NodeB, Cell ID diikuti 4-9 digit angka
  const enbPatterns = [
    /(?:eNB|eNodeB|ENB|NodeB|Cell\s*ID|CellID|CID|LCID)[:\s=]*([0-9]{4,9})/i,
    /eNB[:\s=]*([0-9]{1,4})\s+([0-9]{2,5})/i, // terpisah spasi OCR
  ];

  for (const regex of enbPatterns) {
    const match = normalized.match(regex);
    if (match) {
      result.enb_id = match[2] ? `${match[1]}${match[2]}` : match[1];
      break;
    }
  }

  // 2 & 3) Latitude & Longitude
  // A. Pola kombinasi Lat/Lon dalam satu baris (misal: "Lat/Lon: -7.050300 / 110.438500")
  const combinedCoords = normalized.match(
    /(?:Lat(?:itude)?\s*[\/,|]\s*Lon(?:g(?:itude)?)?|Lat\s*Long)[:\s=]*([+-]?\d{1,2}\.\d{3,8})[\s\/,|;]+([+-]?\d{2,3}\.\d{3,8})/i
  );

  if (combinedCoords) {
    let lat = parseFloat(combinedCoords[1]);
    // Koordinat Jawa Tengah/Indonesia berada di selatan khatulistiwa (negatif)
    if (lat > 0 && lat < 12) lat = -lat;
    result.latitude = lat.toFixed(6);
    result.longitude = parseFloat(combinedCoords[2]).toFixed(6);
  } else {
    // B. Pola individual Latitude
    const latMatch = normalized.match(/(?:Latitude|Lat)[:\s=]*([+-]?\d{1,2}\.\d{3,8})/i);
    if (latMatch) {
      let lat = parseFloat(latMatch[1]);
      if (lat > 0 && lat < 12) lat = -lat;
      result.latitude = lat.toFixed(6);
    }

    // C. Pola individual Longitude
    const lonMatch = normalized.match(/(?:Longitude|Long|Lon|Lng)[:\s=]*([+-]?\d{2,3}\.\d{3,8})/i);
    if (lonMatch) {
      result.longitude = parseFloat(lonMatch[1]).toFixed(6);
    }

    // D. Fallback koordinat wilayah Jawa Tengah / Semarang (Lat: -6.x s.d. -8.x, Lon: 108.x s.d. 112.x)
    if (!result.latitude || !result.longitude) {
      const geoMatch = normalized.match(/(-?[6-8]\.\d{4,8})[\s\/,|;]+(11[0-2]\.\d{4,8})/);
      if (geoMatch) {
        let lat = parseFloat(geoMatch[1]);
        if (lat > 0) lat = -lat;
        if (!result.latitude) result.latitude = lat.toFixed(6);
        if (!result.longitude) result.longitude = parseFloat(geoMatch[2]).toFixed(6);
      }
    }
  }

  // 4) RSRP (Reference Signal Received Power)
  // Menangkap label RSRP atau RSRP1 diikuti angka dBm (rentang wajar: -140 sampai -44 dBm)
  const rsrpMatch = normalized.match(/(?:RSRP\d?|RSRP_?\d?)[:\s=]*([+-]?\d{1,3}(?:\.\d{1,2})?)\s*(?:dBm)?/i);
  if (rsrpMatch) {
    let val = parseFloat(rsrpMatch[1]);
    if (!isNaN(val)) {
      // Jika positif tapi nilainya wajar untuk RSRP (misal 84 atau 92), berikan tanda minus otomatis
      if (val > 40 && val <= 140) val = -val;
      result.rsrp = val.toFixed(1);
    }
  }

  // 5) RSRQ (Reference Signal Received Quality)
  // Menangkap label RSRQ diikuti angka dB (rentang wajar: -20 sampai -3 dB)
  const rsrqMatch = normalized.match(/(?:RSRQ\d?|RSRQ_?\d?)[:\s=]*([+-]?\d{1,2}(?:\.\d{1,2})?)\s*(?:dB)?/i);
  if (rsrqMatch) {
    let val = parseFloat(rsrqMatch[1]);
    if (!isNaN(val)) {
      if (val > 3 && val <= 30) val = -val;
      result.rsrq = val.toFixed(1);
    }
  }

  // 6) SNR / SINR (Signal-to-Noise Ratio)
  // Menangkap label SNR atau SINR diikuti angka dB (rentang wajar: -10 sampai 35 dB)
  const snrMatch = normalized.match(/(?:SNR|SINR)[:\s=]*([+-]?\d{1,2}(?:\.\d{1,2})?)\s*(?:dB)?/i);
  if (snrMatch) {
    const val = parseFloat(snrMatch[1]);
    if (!isNaN(val)) {
      result.snr = val.toFixed(1);
    }
  }

  return result;
}

/**
 * 4. Fungsi Utama Pemrosesan Screenshot G-NetTrack Menggunakan Tesseract.js
 * 
 * @param {File|Blob|string} imageFile - File gambar screenshot
 * @param {Function} onProgress - Callback status dan progres { status: string, progress: number }
 * @returns {Promise<Object>} { success, rawText, parsedData, confidence, preprocessedCanvas }
 */
export async function processGNetTrackScreenshot(imageFile, onProgress = () => {}) {
  let worker = null;

  try {
    // Langkah 1: Pra-pemrosesan Canvas (10%)
    onProgress({ status: 'Mengoptimasi dan mempertajam gambar (Canvas)...', progress: 10 });
    const preprocessedCanvas = await preprocessImage(imageFile);

    // Langkah 2: Inisialisasi Tesseract Worker (25%)
    onProgress({ status: 'Memuat mesin Tesseract OCR...', progress: 25 });
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          // Petakan progress 0.0 - 1.0 ke rentang 30% - 90%
          const mappedProgress = Math.round(30 + m.progress * 60);
          onProgress({
            status: `Memindai teks screenshot G-NetTrack (${mappedProgress}%)...`,
            progress: mappedProgress,
          });
        }
      },
    });

    // Langkah 3: Eksekusi Pengenalan Teks (30% - 90%)
    const { data } = await worker.recognize(preprocessedCanvas);
    const rawText = data.text || '';
    const confidence = data.confidence || 0;

    // Langkah 4: Parsing Parameter (95%)
    onProgress({ status: 'Mengekstrak 6 parameter sinyal G-NetTrack...', progress: 95 });
    const parsedData = parseGNetTrackData(rawText);

    // Langkah 5: Bersihkan Worker (100%)
    await worker.terminate();
    worker = null;

    onProgress({ status: 'Pemindaian OCR selesai!', progress: 100 });

    return {
      success: true,
      rawText,
      parsedData,
      confidence,
      preprocessedCanvas,
    };
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Abaikan error saat terminate
      }
    }

    console.error('[GNetTrack OCR Error]', error);
    onProgress({ status: 'Gagal memproses OCR: ' + error.message, progress: 0 });

    return {
      success: false,
      error: error.message,
      rawText: '',
      parsedData: {
        enb_id: '',
        latitude: '',
        longitude: '',
        rsrp: '',
        rsrq: '',
        snr: '',
      },
    };
  }
}

export default {
  preprocessImage,
  cleanAndNormalizeOcrText,
  parseGNetTrackData,
  processGNetTrackScreenshot,
};
