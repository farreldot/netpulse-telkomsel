import { cleanAndNormalizeOcrText, parseGNetTrackData } from './src/utils/gnettrackOcr.js';

console.log('=== TEST SUITE: G-NetTrack OCR Parser ===\n');

// Test 1: Format Standar G-NetTrack Pro
const text1 = `
G-NetTrack Pro 24.5
eNodeB: 990101
Cell ID: 990101-1
Latitude: -7.050300
Longitude: 110.438500
RSRP: -84.5 dBm
RSRQ: -9.0 dB
SNR: 18.5 dB
`;
const res1 = parseGNetTrackData(text1);
console.log('Test 1 (Standard):', res1);
const pass1 =
  res1.enb_id === '990101' &&
  res1.latitude === '-7.050300' &&
  res1.longitude === '110.438500' &&
  res1.rsrp === '-84.5' &&
  res1.rsrq === '-9.0' &&
  res1.snr === '18.5';
console.log('Test 1 Result:', pass1 ? 'PASSED' : 'FAILED');

// Test 2: Format Kombinasi Lat/Lon & Dash Panjang (—)
const text2 = `
G-NetTrack Lite
Lat/Lon: -7.058200 / 110.442100
ENB: 990102
RSRP1: —91.5 dBm
RSRQ1: —11.0 dB
SINR: 12.4 dB
`;
const res2 = parseGNetTrackData(text2);
console.log('\nTest 2 (Combined Coords & Long Dash):', res2);
const pass2 =
  res2.enb_id === '990102' &&
  res2.latitude === '-7.058200' &&
  res2.longitude === '110.442100' &&
  res2.rsrp === '-91.5' &&
  res2.rsrq === '-11.0' &&
  res2.snr === '12.4';
console.log('Test 2 Result:', pass2 ? 'PASSED' : 'FAILED');

// Test 3: Koma desimal & tanda sama dengan
const text3 = `
eNodeB=990105
Lat -7,042500
Long 110,428900
RSRP -108,0 dBm
RSRQ -16,5 dB
SNR 3,1 dB
`;
const res3 = parseGNetTrackData(text3);
console.log('\nTest 3 (Comma decimals & equals sign):', res3);
const pass3 =
  res3.enb_id === '990105' &&
  res3.latitude === '-7.042500' &&
  res3.longitude === '110.428900' &&
  res3.rsrp === '-108.0' &&
  res3.rsrq === '-16.5' &&
  res3.snr === '3.1';
console.log('Test 3 Result:', pass3 ? 'PASSED' : 'FAILED');

if (pass1 && pass2 && pass3) {
  console.log('\n>>> ALL 3 OCR PARSER TESTS PASSED SUCCESSFULLY! <<<');
} else {
  console.error('\n>>> SOME TESTS FAILED! <<<');
  process.exit(1);
}
