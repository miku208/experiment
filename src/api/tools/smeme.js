const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');

module.exports = function (app) {
  app.get('/tools/smeme', async (req, res) => {
    try {
      const { img, atas, bawah } = req.query;

      if (!img) return res.status(400).send('Parameter img (URL) wajib diisi');
      if (!atas) return res.status(400).send('Parameter atas wajib diisi');
      if (!bawah) return res.status(400).send('Parameter bawah wajib diisi');

      // Cek font
      const fontArialPath = path.join(__dirname, '../Milker.ttf');
      const fontEmojiPath = path.join(__dirname, '../NotoColorEmoji.ttf');
      if (!fs.existsSync(fontArialPath)) return res.status(500).send('Font Milker tidak ditemukan');
      if (!fs.existsSync(fontEmojiPath)) return res.status(500).send('Font Noto Color Emoji tidak ditemukan');

      // Register font
      GlobalFonts.registerFromPath(fontArialPath, 'Milker');
      GlobalFonts.registerFromPath(fontEmojiPath, 'Noto Color Emoji');

      // Ambil gambar
      const imageResp = await axios.get(img, { responseType: 'arraybuffer' });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      // Canvas 480x480
      const size = 480;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background hitam
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);

      // Scale gambar tanpa crop
      const scale = Math.min(size / baseImage.width, size / baseImage.height);
      const newWidth = baseImage.width * scale;
      const newHeight = baseImage.height * scale;
      const offsetX = (size - newWidth) / 2;
      const offsetY = (size - newHeight) / 2;

      ctx.drawImage(baseImage, offsetX, offsetY, newWidth, newHeight);

      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.textAlign = 'center';

      // Fungsi drawText handle newline + wrap 12 karakter + font resize otomatis
      const drawText = (text, yPos, baseline) => {
        let fontSize = Math.floor(size * 0.10);
        ctx.textBaseline = baseline;

        // Split per newline dulu
        const paragraphs = text.split('\n');
        let lines = [];

        paragraphs.forEach(p => {
          for (let i = 0; i < p.length; i += 12) {
            lines.push(p.slice(i, i + 12));
          }
        });

        const maxWidth = size * 0.9;
        let fit = false;

        // Auto resize font
        while (!fit && fontSize > 12) {
          fit = true;
          ctx.font = `900 ${fontSize}px "Milker", "Noto Color Emoji"`;
          for (const line of lines) {
            if (ctx.measureText(line).width > maxWidth) {
              fontSize -= 1;
              fit = false;
              break;
            }
          }
        }

        const lineHeight = fontSize * 1.2;

        lines.forEach((line, i) => {
          const lineY = baseline === 'top'
            ? yPos + i * lineHeight
            : yPos - (lines.length - 1 - i) * lineHeight;

          // Outline fix 3px
          ctx.lineWidth = 3;
          ctx.strokeText(line, size / 2, lineY);

          // Fill text
          ctx.fillText(line, size / 2, lineY);
        });
      };

      // Gambar teks atas & bawah
      drawText(atas, 10, 'top');
      drawText(bawah, size - 10, 'bottom');

      // Convert ke webp
      const buffer = canvas.toBuffer('image/jpeg');
      const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();

      res.set('Content-Type', 'image/webp');
      res.status(200).send(webpBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};