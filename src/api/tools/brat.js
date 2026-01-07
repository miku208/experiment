const path = require('path');
const fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const Jimp = require('jimp');

module.exports = function (app) {
  app.get('/tools/brat', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).send('Parameter text wajib diisi. Contoh: /tools/brat2?text=Aku%20Sayang%20Kamu');
      }

      // Path font
      const fontArialPath = path.join(__dirname, '../arialnarrow.ttf');
      const fontEmojiPath = path.join(__dirname, '../AppleColorEmoji.ttf');

      // Cek font
      if (!fs.existsSync(fontArialPath)) return res.status(500).send('Font Arial Narrow tidak ditemukan');
      if (!fs.existsSync(fontEmojiPath)) return res.status(500).send('Font Noto Color Emoji tidak ditemukan');

      // Register font
      GlobalFonts.registerFromPath(fontArialPath, 'Arial Narrow');
      GlobalFonts.registerFromPath(fontEmojiPath, 'Noto Color Emoji');

      // Parameter gambar
      let width = 512;
      let height = 512;
      let margin = 20;
      let wordSpacing = 50;
      let fontSize = 280;
      let lineHeightMultiplier = 1.3;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background putih
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'black';

      let words = text.split(' ');
      let lines = [];

      // Fungsi membungkus teks
      function rebuildLines() {
        lines = [];
        let currentLine = '';
        for (let word of words) {
          let testLine = currentLine ? `${currentLine} ${word}` : word;
          ctx.font = `${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
          let lineWidth =
            ctx.measureText(testLine).width +
            (currentLine.split(' ').length - 1) * wordSpacing;
          if (lineWidth < width - 2 * margin) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
      }

      ctx.font = `${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
      rebuildLines();

      // Kecilkan font kalau terlalu tinggi
      while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
        fontSize -= 2;
        ctx.font = `${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
        rebuildLines();
      }

      let lineHeight = fontSize * lineHeightMultiplier;
      let y = margin;
      for (let line of lines) {
        let wordsInLine = line.split(' ');
        let x = margin;
        for (let word of wordsInLine) {
          ctx.fillText(word, x, y);
          x += ctx.measureText(word).width + wordSpacing;
        }
        y += lineHeight;
      }

      // Blur efek
      let buffer = await canvas.encode('png');
      let image = await Jimp.read(buffer);
      image.blur(3);
      let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

      res.set('Content-Type', 'image/png');
      res.status(200).send(blurredBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};