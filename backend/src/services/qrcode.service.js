const QRCode = require('qrcode');
const path = require('path');

exports.generate = async (data, reference) => {
  const outputPath = path.join('uploads', `qr_${reference}.png`);
  await QRCode.toFile(outputPath, data, { width: 200, margin: 1 });
  return outputPath;
};