const axios = require('axios');
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');

module.exports = function(app) {
  app.get('/tools/bratnime', async (req, res) => {
    try {
      const { apikey, text } = req.query;

      if (!global.apikey.includes(apikey)) return res.status(403).send('Invalid API key');
      if (!text) return res.status(400).send('Text is required');

      const imageUrl = 'https://files.catbox.moe/kwkiyb.png';
      const TextfontPath = path.join(__dirname, '../arialnarrow.ttf'); 
      const EmojifontPath = path.join(__dirname, '../NotoColorEmoji.ttf'); // ubah sesuai path kamu

      const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      GlobalFonts.registerFromPath(TextfontPath, 'Arial Narrow');
  GlobalFonts.registerFromPath(EmojifontPath, 'Noto Color Emoji');

      // Posisi papan teks
      let boardX = canvas.width * 0.18;
      let boardY = canvas.height * 0.57;
      let boardWidth = canvas.width * 0.56;
      let boardHeight = canvas.height * 0.25;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let maxFontSize = 62;
      let minFontSize = 12;
      let fontSize = maxFontSize;

      const isTextFit = (text, fontSize) => {
        ctx.font = `bold ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
        const words = text.split(' ');
        const lineHeight = fontSize * 1.2;
        const maxWidth = boardWidth * 0.9;
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        return lines.length * lineHeight <= boardHeight * 0.9;
      };

      while (!isTextFit(text, fontSize) && fontSize > minFontSize) fontSize -= 2;
      ctx.font = `bold ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;

      const words = text.split(' ');
      const lineHeight = fontSize * 1.2;
      const maxWidth = boardWidth * 0.9;
      let lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      let startY = boardY + boardHeight / 2 - (lines.length - 1) * lineHeight / 2;
      lines.forEach((line, i) => {
        let xPos = boardX + boardWidth / 2 - 15;
        let yPos = startY + i * lineHeight;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(line, xPos, yPos);
        ctx.fillStyle = '#000000';
        ctx.fillText(line, xPos, yPos);
      });

      // Konversi ke WebP dan kirim
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