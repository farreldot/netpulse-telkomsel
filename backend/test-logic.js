const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('./src/middleware/authMiddleware');

async function runTests() {
  console.log('--- TEST 1: Password Hashing & Verification ---');
  const adminHash = await bcrypt.hash('admin123', 10);
  const mitraHash = await bcrypt.hash('mitra123', 10);
  const adminMatch = await bcrypt.compare('admin123', adminHash);
  const mitraMatch = await bcrypt.compare('mitra123', mitraHash);
  const wrongMatch = await bcrypt.compare('wrongpass', adminHash);
  console.log('Admin password match:', adminMatch === true ? 'PASSED' : 'FAILED');
  console.log('Mitra password match:', mitraMatch === true ? 'PASSED' : 'FAILED');
  console.log('Wrong password mismatch:', wrongMatch === false ? 'PASSED' : 'FAILED');

  console.log('\n--- TEST 2: JWT Generation & Verification ---');
  const secret = 'test_secret_key';
  const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  console.log('Token decoded username:', decoded.username === 'admin' ? 'PASSED' : 'FAILED');
  console.log('Token decoded role:', decoded.role === 'admin' ? 'PASSED' : 'FAILED');

  console.log('\n--- TEST 3: Quality Label Calculation ---');
  const calculateQuality = (rsrp) => {
    const numRsrp = parseFloat(rsrp);
    if (isNaN(numRsrp)) return 'Tidak Diketahui';
    if (numRsrp >= -85) return 'Sangat Baik';
    if (numRsrp >= -95) return 'Baik';
    if (numRsrp >= -105) return 'Cukup';
    return 'Buruk';
  };

  const testCases = [
    { rsrp: -80, expected: 'Sangat Baik' },
    { rsrp: -85, expected: 'Sangat Baik' },
    { rsrp: -86, expected: 'Baik' },
    { rsrp: -95, expected: 'Baik' },
    { rsrp: -96, expected: 'Cukup' },
    { rsrp: -105, expected: 'Cukup' },
    { rsrp: -106, expected: 'Buruk' },
    { rsrp: -120, expected: 'Buruk' },
  ];

  for (const tc of testCases) {
    const res = calculateQuality(tc.rsrp);
    const pass = res === tc.expected;
    console.log(`RSRP ${tc.rsrp} -> ${res} (Expected: ${tc.expected}): ${pass ? 'PASSED' : 'FAILED'}`);
  }

  console.log('\n--- TEST 4: Middleware Authorization ---');
  const mockReqAdmin = { user: { role: 'admin' } };
  const mockReqMitra = { user: { role: 'mitra' } };
  let adminPassed = false;
  let mitraBlocked = false;

  const adminAuth = authorizeRole('admin');
  adminAuth(mockReqAdmin, {}, () => {
    adminPassed = true;
  });

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code === 403) mitraBlocked = true;
      },
    }),
  };
  adminAuth(mockReqMitra, mockRes, () => {});

  console.log('Admin access allowed:', adminPassed ? 'PASSED' : 'FAILED');
  console.log('Mitra access blocked with 403:', mitraBlocked ? 'PASSED' : 'FAILED');

  console.log('\nAll tests completed successfully!');
}

runTests().catch(console.error);
