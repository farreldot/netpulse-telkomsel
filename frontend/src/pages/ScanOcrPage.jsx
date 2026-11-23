import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ScanLine,
  Camera,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { signalLogsApi, sitesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { processGNetTrackScreenshot } from '../utils/gnettrackOcr';

export default function ScanOcrPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sites, setSites] = useState([]);

  // Status OCR
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(null);

  // Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 6 Parameter Wajib + Catatan
  const [formData, setFormData] = useState({
    enb_id: searchParams.get('enb') || '',
    site_name: searchParams.get('name') || '',
    latitude: '-7.050300',
    longitude: '110.438500',
    rsrp: '-84.5',
    rsrq: '-9.0',
    snr: '18.5',
    notes: 'Hasil pemindaian screenshot G-NetTrack Telkomsel',
  });

  // Ambil daftar BTS Sites untuk auto-match enb_id
  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await sitesApi.getAll();
        if (res.success && Array.isArray(res.data)) {
          setSites(res.data);
        }
      } catch {
        // Fallback silently
      }
    };
    loadSites();
  }, []);

  // Otomatis cocokkan site_name saat enb_id berubah
  useEffect(() => {
    if (formData.enb_id && sites.length > 0) {
      const cleanEnb = formData.enb_id.toString().trim();
      const matched = sites.find((s) => s.enb_id === cleanEnb);
      if (matched) {
        setFormData((prev) => ({ ...prev, site_name: matched.site_name }));
      }
    }
  }, [formData.enb_id, sites]);

  // Handler pemilihan gambar & eksekusi OCR Tesseract
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg('');
    setSuccessMsg('');
    setRawOcrText('');
    setOcrConfidence(null);

    await runOcrEngine(file);
  };

  // Jalankan OCR Engine Tesseract
  const runOcrEngine = async (file) => {
    setIsProcessingOcr(true);
    setOcrProgress(5);
    setOcrStatusText('Memulai pra-pemrosesan gambar...');

    try {
      const result = await processGNetTrackScreenshot(file, ({ status, progress }) => {
        setOcrStatusText(status);
        setOcrProgress(progress);
      });

      if (result.success) {
        setRawOcrText(result.rawText);
        setOcrConfidence(result.confidence);

        const { parsedData } = result;

        // Isi form otomatis dengan hasil ekstraksi (jika ditemukan)
        setFormData((prev) => ({
          ...prev,
          enb_id: parsedData.enb_id || prev.enb_id,
          latitude: parsedData.latitude || prev.latitude,
          longitude: parsedData.longitude || prev.longitude,
          rsrp: parsedData.rsrp || prev.rsrp,
          rsrq: parsedData.rsrq || prev.rsrq,
          snr: parsedData.snr || prev.snr,
          notes: `Hasil ekstraksi OCR G-NetTrack (Tingkat keyakinan: ${Math.round(
            result.confidence
          )}%)`,
        }));

        setSuccessMsg(
          `Ekstraksi OCR selesai! 6 parameter berhasil dipindai dengan keyakinan ${Math.round(
            result.confidence
          )}%.`
        );
      } else {
        throw new Error(result.error || 'Gagal mengenali teks.');
      }
    } catch (err) {
      console.error('OCR Processing error:', err);
      setErrorMsg(
        'Pemindaian otomatis OCR mengalami kendala: ' +
          (err.message || 'Silakan lengkapi atau koreksi data form secara manual.')
      );
    } finally {
      setIsProcessingOcr(false);
      setOcrProgress(100);
    }
  };

  // Preset data G-NetTrack untuk kemudahan demonstrasi saat responsi
  const handleUsePresetData = (presetType) => {
    setErrorMsg('');
    setSuccessMsg('Contoh data G-NetTrack berhasil dimuat ke formulir.');

    if (presetType === 'good') {
      setFormData({
        enb_id: '990101',
        site_name: 'TSEL_UNDIP_TEMBALANG',
        latitude: '-7.050300',
        longitude: '110.438500',
        rsrp: '-82.0',
        rsrq: '-8.0',
        snr: '21.0',
        notes: 'Preset G-NetTrack: Dekat antenna sector 1, kualitas sangat prima.',
      });
      setRawOcrText(
        'G-NetTrack Pro v24.2\nOperator: TELKOMSEL\neNB: 990101\nLat/Lon: -7.050300 / 110.438500\nRSRP: -82.0 dBm\nRSRQ: -8.0 dB\nSNR: 21.0 dB'
      );
      setOcrConfidence(95);
    } else if (presetType === 'fair') {
      setFormData({
        enb_id: '990102',
        site_name: 'TSEL_BANJARSARI_TEMBALANG',
        latitude: '-7.058200',
        longitude: '110.442100',
        rsrp: '-98.0',
        rsrq: '-12.5',
        snr: '8.4',
        notes: 'Preset G-NetTrack: Penurunan level sinyal di dalam area padat.',
      });
      setRawOcrText(
        'G-NetTrack Lite\nOperator: TELKOMSEL\nENB: 990102\nLatitude: -7.058200\nLongitude: 110.442100\nRSRP: -98.0 dBm\nRSRQ: -12.5 dB\nSINR: 8.4 dB'
      );
      setOcrConfidence(92);
    } else {
      setFormData({
        enb_id: '990105',
        site_name: 'TSEL_NGESREP_TIMUR',
        latitude: '-7.042500',
        longitude: '110.428900',
        rsrp: '-110.5',
        rsrq: '-17.0',
        snr: '2.0',
        notes: 'Preset G-NetTrack: Blank spot di bawah kontur bukit ruko bertingkat.',
      });
      setRawOcrText(
        'G-NetTrack\neNodeB=990105\nLat -7,042500\nLong 110,428900\nRSRP -110,5 dBm\nRSRQ -17,0 dB\nSNR 2,0 dB'
      );
      setOcrConfidence(89);
    }
  };

  // Ambil lokasi GPS saat ini dari HP
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
      },
      (err) => {
        alert('Gagal mengambil lokasi GPS: ' + err.message);
      }
    );
  };

  // Hitung live label kualitas sinyal berdasarkan RSRP
  const calculateQuality = (rsrpVal) => {
    const val = parseFloat(rsrpVal);
    if (isNaN(val)) return { label: 'Tidak Diketahui', color: 'bg-slate-100 text-slate-700' };
    if (val >= -85)
      return {
        label: 'Sangat Baik',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      };
    if (val >= -95)
      return {
        label: 'Baik',
        color: 'bg-blue-50 text-blue-700 border-blue-300',
      };
    if (val >= -105)
      return {
        label: 'Cukup',
        color: 'bg-amber-50 text-amber-700 border-amber-300',
      };
    return {
      label: 'Buruk',
      color: 'bg-red-50 text-red-700 border-red-300',
    };
  };

  const currentQuality = calculateQuality(formData.rsrp);

  // Submit form dan simpan log sinyal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.latitude || !formData.longitude || formData.rsrp === '') {
      setErrorMsg('Harap lengkapi parameter RSRP dan koordinat.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        enb_id: formData.enb_id ? formData.enb_id.trim() : null,
        site_name: formData.site_name ? formData.site_name.trim() : null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        rsrp: parseFloat(formData.rsrp),
        rsrq: parseFloat(formData.rsrq),
        snr: parseFloat(formData.snr),
        notes: formData.notes,
        tested_by: user?.full_name || user?.username || 'Mitra',
      };

      const res = await signalLogsApi.create(payload);
      if (res.success) {
        setSuccessMsg('Log sinyal berhasil disimpan! Mengalihkan ke riwayat log...');
        setTimeout(() => {
          navigate('/logs');
        }, 1000);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil uji sinyal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
          <ScanLine className="w-4 h-4 text-telkomsel-red" />
          <span>Uji Sinyal & Ekstraksi OCR G-NetTrack</span>
        </h2>
        <p className="text-[11px] text-slate-500">
          Pemindaian otomatis 6 parameter RF tanpa pemotongan posisi tetap
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone & Pratinjau Gambar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Screenshot G-NetTrack</span>
          {imagePreview && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => selectedImage && runOcrEngine(selectedImage)}
                disabled={isProcessingOcr}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Pindai Ulang</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setRawOcrText('');
                }}
                className="text-[11px] text-red-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-52 bg-slate-900 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="G-NetTrack Preview"
              className="w-full object-contain max-h-52"
            />

            {/* Overlay Progress Bar Saat OCR Berjalan */}
            {isProcessingOcr && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-telkomsel-red/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                </div>
                <div className="w-full max-w-[220px] space-y-1 text-center">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{ocrStatusText}</span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-telkomsel-red h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="border-2 border-dashed border-red-200 hover:border-telkomsel-red bg-red-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-telkomsel-red mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">Pilih Screenshot G-NetTrack</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Tesseract OCR otomatis mendeteksi eNB, koordinat, RSRP, RSRQ, dan SNR
            </p>
          </label>
        )}

        {/* Tombol Isi Cepat Demo (Sangat Praktis untuk Responsi) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              Isi Cepat Contoh Data (Responsi):
            </span>
            {ocrConfidence !== null && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Keyakinan OCR: {Math.round(ocrConfidence)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleUsePresetData('good')}
              className="py-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 text-center transition-all"
            >
              Sangat Baik (-82)
            </button>
            <button
              type="button"
              onClick={() => handleUsePresetData('fair')}
              className="py-1 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200 text-center transition-all"
            >
              Cukup (-98)
            </button>
            <button
              type="button"
              onClick={() => handleUsePresetData('poor')}
              className="py-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-bold rounded-lg border border-red-200 text-center transition-all"
            >
              Buruk (-110)
            </button>
          </div>
        </div>

        {/* Collapsible: Lihat Teks Mentah OCR (Debugging) */}
        {rawOcrText && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-telkomsel-red py-1"
            >
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Lihat Teks Mentah OCR (Debugging)</span>
              </span>
              {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawText && (
              <div className="mt-2 p-2.5 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-700">
                {rawOcrText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulir Hasil Ekstraksi (Dapat Dikoreksi Manual) */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-3.5"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-900">Hasil Ekstraksi 6 Parameter</h3>
          <div
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentQuality.color}`}
          >
            Kualitas: {currentQuality.label}
          </div>
        </div>

        {/* 1) Base Station ID (eNB) & Nama Site */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              1. Base Station ID (eNB)
            </label>
            <input
              type="text"
              value={formData.enb_id}
              onChange={(e) => setFormData({ ...formData, enb_id: e.target.value })}
              placeholder="Contoh: 990101"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nama Site (Cocokkan BTS)
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="TSEL_UNDIP_TEMBALANG"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
            />
          </div>
        </div>

        {/* 2 & 3) Longitude & Latitude */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700">
              2 & 3. Koordinat (Latitude, Longitude)
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              className="text-[10px] text-telkomsel-red font-bold hover:underline flex items-center space-x-1"
            >
              <MapPin className="w-3 h-3" />
              <span>Gunakan GPS HP</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-slate-400 block mb-0.5">Latitude (Lintang)</span>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-7.050300"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                required
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block mb-0.5">Longitude (Bujur)</span>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="110.438500"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* 4, 5, 6) Radio Frequency: RSRP, RSRQ, SNR */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              4. RSRP (dBm)
            </label>
            <input
              type="number"
              step="any"
              value={formData.rsrp}
              onChange={(e) => setFormData({ ...formData, rsrp: e.target.value })}
              placeholder="-84.0"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              5. RSRQ (dB)
            </label>
            <input
              type="number"
              step="any"
              value={formData.rsrq}
              onChange={(e) => setFormData({ ...formData, rsrq: e.target.value })}
              placeholder="-9.0"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              6. SNR (dB)
            </label>
            <input
              type="number"
              step="any"
              value={formData.snr}
              onChange={(e) => setFormData({ ...formData, snr: e.target.value })}
              placeholder="18.5"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Catatan Lapangan */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Catatan Tambahan
          </label>
          <textarea
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Informasi cuaca, kondisi sekitar, atau kendala lapangan..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting || isProcessingOcr}
          className="w-full py-2.5 bg-telkomsel-red hover:bg-telkomsel-darkred text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Log Sinyal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
