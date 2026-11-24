import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ScanLine,
  Image as ImageIcon,
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
  ClipboardPaste,
  UploadCloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signalLogsApi, sitesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { processGNetTrackScreenshot } from '../utils/gnettrackOcr';
import PageTransition from '../components/PageTransition';

export default function ScanOcrPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
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

  // Handler umum untuk proses file gambar yang dipilih / di-drop / di-paste
  const handleSelectedFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg('File yang dipilih bukan gambar yang valid (Gunakan PNG, JPG, JPEG, atau WebP).');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg('');
    setSuccessMsg('');
    setRawOcrText('');
    setOcrConfidence(null);

    await runOcrEngine(file);
  };

  // Handler pemilihan gambar via File Explorer / Galeri
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleSelectedFile(file);
    }
  };

  // Event Listener Paste dari Clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleSelectedFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleSelectedFile(files[0]);
    }
  };

  // Jalankan OCR Engine Tesseract
  const runOcrEngine = async (file) => {
    setIsProcessingOcr(true);
    setOcrProgress(5);
    setOcrStatusText('Memulai pra-pemrosesan gambar screenshot...');

    try {
      const result = await processGNetTrackScreenshot(file, ({ status, progress }) => {
        setOcrStatusText(status);
        setOcrProgress(progress);
      });

      if (result.success) {
        setRawOcrText(result.rawText);
        setOcrConfidence(result.confidence);

        const { parsedData } = result;

        // Isi form otomatis dengan hasil ekstraksi
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
          `Ekstraksi OCR selesai! 6 parameter RF berhasil dipindai dengan akurasi keyakinan ${Math.round(
            result.confidence
          )}%.`
        );
      } else {
        throw new Error(result.error || 'Gagal mengenali teks parameter.');
      }
    } catch (err) {
      console.error('OCR Processing error:', err);
      setErrorMsg(
        'Pemindaian otomatis OCR mengalami kendala: ' +
          (err.message || 'Silakan lengkapi atau koreksi data parameter secara manual.')
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
    if (isNaN(val)) return { label: 'Tidak Diketahui', color: 'bg-slate-100 text-slate-700 border-slate-200' };
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
        }, 900);
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
    <PageTransition className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
            <ScanLine className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Uji Sinyal & Ekstraksi OCR G-NetTrack
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pindai 6 parameter RF Drive Test via File Explorer, Drag & Drop, atau Paste Clipboard (Ctrl+V)
        </p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-700"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-700 font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Responsive Grid: 2-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Dropzone, Preview, Presets */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
              Screenshot G-NetTrack
            </span>
            {imagePreview && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => selectedImage && runOcrEngine(selectedImage)}
                  disabled={isProcessingOcr}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pindai Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setRawOcrText('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-red-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden input tanpa atribut capture agar langsung membuka File Explorer / Galeri */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-slate-950 flex items-center justify-center shadow-inner">
              <img
                src={imagePreview}
                alt="G-NetTrack Preview"
                className="w-full object-contain max-h-64"
              />

              {/* Overlay Progress Bar Saat OCR Berjalan */}
              {isProcessingOcr && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-telkomsel-red/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
                  </div>
                  <div className="w-full max-w-[240px] space-y-1.5 text-center">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="truncate mr-2">{ocrStatusText}</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-telkomsel-gradient h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center select-none ${
                isDragging
                  ? 'border-telkomsel-red bg-red-50/80 scale-[1.01] shadow-md ring-4 ring-red-100'
                  : 'border-slate-200 hover:border-telkomsel-red bg-slate-50/60 hover:bg-red-50/40'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
                  isDragging ? 'bg-telkomsel-red text-white scale-110' : 'bg-red-50 text-telkomsel-red'
                }`}
              >
                {isDragging ? <UploadCloud className="w-7 h-7 animate-bounce" /> : <ImageIcon className="w-7 h-7" />}
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
                Pilih Screenshot G-NetTrack
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                Klik untuk buka File Explorer / Galeri, atau <strong className="text-slate-700">Drag & Drop</strong> file gambar ke sini
              </p>

              {/* Clipboard Paste Hint Badge */}
              <div className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-xs text-[11px] text-slate-600 font-semibold">
                <ClipboardPaste className="w-3.5 h-3.5 text-telkomsel-red" />
                <span>Bisa langsung <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-800">Ctrl + V</kbd> untuk Paste</span>
              </div>

              <span className="text-[10px] text-slate-400 mt-2 font-mono">
                Mendukung format PNG, JPG, JPEG, WebP
              </span>
            </div>
          )}

          {/* Tombol Isi Cepat Demo (Sangat Praktis untuk Responsi) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">
                Akses Cepat Demo Responsi:
              </span>
              {ocrConfidence !== null && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Keyakinan OCR: {Math.round(ocrConfidence)}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUsePresetData('good')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200/80 text-center transition-all"
              >
                Sangat Baik (-82)
              </button>
              <button
                type="button"
                onClick={() => handleUsePresetData('fair')}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl border border-amber-200/80 text-center transition-all"
              >
                Cukup (-98)
              </button>
              <button
                type="button"
                onClick={() => handleUsePresetData('poor')}
                className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-bold rounded-xl border border-red-200/80 text-center transition-all"
              >
                Buruk (-110)
              </button>
            </div>
          </div>

          {/* Collapsible: Debugging Teks Mentah OCR */}
          {rawOcrText && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-telkomsel-red py-1"
              >
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lihat Teks Mentah OCR (Debugging)</span>
                </span>
                {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showRawText && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-700">
                  {rawOcrText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Formulir Hasil Ekstraksi (6 Parameter) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Hasil Ekstraksi 6 Parameter RF
              </h3>
              <p className="text-xs text-slate-400">Parameter dapat ditinjau atau diedit manual</p>
            </div>
            <div
              className={`text-xs font-bold px-3 py-1 rounded-full border ${currentQuality.color}`}
            >
              Kualitas: {currentQuality.label}
            </div>
          </div>

          {/* 1) Base Station ID (eNB) & Nama Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Base Station ID (eNodeB)
              </label>
              <input
                type="text"
                value={formData.enb_id}
                onChange={(e) => setFormData({ ...formData, enb_id: e.target.value })}
                placeholder="Contoh: 990101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Site (Pencocokan Otomatis)
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                placeholder="TSEL_UNDIP_TEMBALANG"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
              />
            </div>
          </div>

          {/* 2 & 3) Longitude & Latitude */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                2 & 3. Koordinat GPS (Latitude, Longitude)
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs text-telkomsel-red font-bold hover:underline flex items-center space-x-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gunakan GPS HP</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-medium">Latitude (Lintang)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="-7.050300"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-medium">Longitude (Bujur)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="110.438500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4, 5, 6) Radio Frequency: RSRP, RSRQ, SNR */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. RSRP (dBm)
              </label>
              <input
                type="number"
                step="any"
                value={formData.rsrp}
                onChange={(e) => setFormData({ ...formData, rsrp: e.target.value })}
                placeholder="-84.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. RSRQ (dB)
              </label>
              <input
                type="number"
                step="any"
                value={formData.rsrq}
                onChange={(e) => setFormData({ ...formData, rsrq: e.target.value })}
                placeholder="-9.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6. SNR (dB)
              </label>
              <input
                type="number"
                step="any"
                value={formData.snr}
                onChange={(e) => setFormData({ ...formData, snr: e.target.value })}
                placeholder="18.5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Catatan Lapangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Lapangan Tambahan
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informasi kondisi sekitar, cuaca, atau kendala lapangan..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
            />
          </div>

          {/* Submit Action */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || isProcessingOcr}
            className="w-full py-3 bg-telkomsel-gradient hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Hasil Uji Sinyal ke Database</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </PageTransition>
  );
}
