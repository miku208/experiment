const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const Jimp = require('jimp');

// --- Pendaftaran Font Global ---
const fontPoppinsPath = path.join(__dirname, '../Poppins-Regular.ttf');
const fontManropePath = path.join(__dirname, '../Manrope-Regular.ttf');
const fontEmojiPath = path.join(__dirname, '../AppleColorEmoji.ttf');

try {
  if (!fs.existsSync(fontPoppinsPath)) {
    throw new Error('Font Poppins-Regular.ttf tidak ditemukan.');
  }
  if (!fs.existsSync(fontManropePath)) {
    throw new Error('Font Manrope-Regular.ttf tidak ditemukan.');
  }
  if (!fs.existsSync(fontEmojiPath)) {
    throw new Error('Font AppleColorEmoji.ttf tidak ditemukan.');
  }

  GlobalFonts.registerFromPath(fontPoppinsPath, 'Poppins');
  GlobalFonts.registerFromPath(fontManropePath, 'Manrope');
  GlobalFonts.registerFromPath(fontEmojiPath, 'Noto Color Emoji');

  console.log('Semua font berhasil didaftarkan secara global.');
} catch (error) {
  console.error('Gagal mendaftarkan font:', error.message);
}

// --- Fungsi Pembuatan Gambar Chat ---
async function createFakeChat({ text, username, profile, color }) {
  const canvasWidth = 800;
  const canvasHeight = 150;
  const padding = 25;
  const cornerRadius = 20;
  const avatarSize = 50;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  
  // Latar belakang
  const colors = {
    putih: '#FFFFFF',
    kuning: '#FFEB3B',
    pink: '#F48FB1',
    hitam: '#000000',
    hijau: '#4CAF50',
    orange: '#FF9800',
    merah: '#F44336',
    biru: '#2196F3',
    coklat: '#795548',
  };

  const bgColor = colors[color.toLowerCase()] || '#000000';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Ukur teks untuk menyesuaikan ukuran kotak
  ctx.font = '24px Poppins, Noto Color Emoji';
  const usernameMetrics = ctx.measureText(username);
  
  ctx.font = '24px Manrope, Noto Color Emoji';
  const textMetrics = ctx.measureText(text);

  const usernameWidth = usernameMetrics.width;
  const textWidth = textMetrics.width;

  const contentWidth = Math.max(usernameWidth, textWidth);
  const chatBoxWidth = contentWidth + (padding * 2);
  const chatBoxHeight = 50 + (padding * 2);

  const chatBoxX = 85;
  const chatBoxY = 25;

  // Gambar kotak chat dengan sudut membulat
  ctx.fillStyle = (color.toLowerCase() === 'hitam' || color.toLowerCase() === 'coklat') ? '#FFFFFF' : '#000000';
  ctx.beginPath();
  ctx.moveTo(chatBoxX + cornerRadius, chatBoxY);
  ctx.lineTo(chatBoxX + chatBoxWidth - cornerRadius, chatBoxY);
  ctx.arcTo(chatBoxX + chatBoxWidth, chatBoxY, chatBoxX + chatBoxWidth, chatBoxY + cornerRadius, cornerRadius);
  ctx.lineTo(chatBoxX + chatBoxWidth, chatBoxY + chatBoxHeight - cornerRadius);
  ctx.arcTo(chatBoxX + chatBoxWidth, chatBoxY + chatBoxHeight, chatBoxX + chatBoxWidth - cornerRadius, chatBoxY + chatBoxHeight, cornerRadius);
  ctx.lineTo(chatBoxX + cornerRadius, chatBoxY + chatBoxHeight);
  ctx.arcTo(chatBoxX, chatBoxY + chatBoxHeight, chatBoxX, chatBoxY + chatBoxHeight - cornerRadius, cornerRadius);
  ctx.lineTo(chatBoxX, chatBoxY + cornerRadius);
  ctx.arcTo(chatBoxX, chatBoxY, chatBoxX + cornerRadius, chatBoxY, cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Gambar avatar
  try {
    const avatar = await loadImage(profile);
    ctx.save();
    ctx.beginPath();
    ctx.arc(45, 50, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 20, 25, avatarSize, avatarSize);
    ctx.restore();
  } catch (err) {
    console.error('Gagal memuat gambar profil:', err.message);
  }

  // Tulis nama pengguna
  ctx.font = `bold 24px Poppins, Noto Color Emoji`;
  ctx.fillStyle = (color.toLowerCase() === 'hitam' || color.toLowerCase() === 'coklat') ? '#000000' : '#FFFFFF';
  ctx.fillText(username, chatBoxX + padding, chatBoxY + 30);

  // Tulis pesan
  ctx.font = '24px Manrope, Noto Color Emoji';
  ctx.fillStyle = (color.toLowerCase() === 'hitam' || color.toLowerCase() === 'coklat') ? '#000000' : '#FFFFFF';
  ctx.fillText(text, chatBoxX + padding, chatBoxY + 65);

  return canvas.encode('png');
}

// --- Modul Ekspor Endpoin ---
module.exports = function (app) {
  app.get('/tools/fake-chat', async (req, res) => {
    try {
      const { text, username, profile, color } = req.query;

      if (!text || !username || !profile) {
        return res.status(400).json({
          status: false,
          message: 'Parameter "text", "username", dan "profile" wajib diisi.'
        });
      }

      const colors = ['putih', 'kuning', 'pink', 'hitam', 'hijau', 'orange', 'merah', 'biru', 'coklat'];
      if (color && !colors.includes(color.toLowerCase())) {
        return res.status(400).json({
          status: false,
          message: `Parameter "color" harus salah satu dari: ${colors.join(', ')}`
        });
      }

      const imageBuffer = await createFakeChat({
        text,
        username,
        profile,
        color: color || 'hitam',
      });

      res.set('Content-Type', 'image/png');
      res.status(200).send(imageBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};
