const path = require('path');
const fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const Jimp = require('jimp');

module.exports = function (app) {
  app.get('/tools/brat-vid', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).send('Parameter text wajib diisi. Contoh: /tools/brat-vid?text=Aku%20Sayang%20Kamu');
      }

      // Inisialisasi ffmpeg
      const ffmpeg = createFFmpeg({ log: true });
      if (!ffmpeg.isLoaded()) await ffmpeg.load();

      // Path font
      const fontArialPath = path.join(__dirname, '../arialnarrow.ttf');
      const fontEmojiPath = path.join(__dirname, '../AppleColorEmoji.ttf');

      if (!fs.existsSync(fontArialPath)) return res.status(500).send('Font Arial Narrow tidak ditemukan');
      if (!fs.existsSync(fontEmojiPath)) return res.status(500).send('Font Noto Color Emoji tidak ditemukan');

      GlobalFonts.registerFromPath(fontArialPath, 'Arial Narrow');
      GlobalFonts.registerFromPath(fontEmojiPath, 'Noto Color Emoji');

      const width = 512;
      const height = 512;
      const margin = 20;
      let fontSize = 64;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.font = `${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const words = text.split(' ');
      const frameRate = 2; // 2 fps → 500ms per kata
      let frameIndex = 0;

      for (let i = 0; i < words.length; i++) {
        const currentText = words.slice(0, i + 1).join(" ");

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.fillText(currentText, margin, margin);

        // encode canvas ke buffer
        const buffer = await canvas.encode('png');

        // Proses dengan Jimp (contoh: blur 3px)
        let image = await Jimp.read(buffer);
        image.blur(3);
        const blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        const frameName = `frame_${String(frameIndex).padStart(3, '0')}.png`;

        // tulis ke virtual FS ffmpeg
        ffmpeg.FS('writeFile', frameName, new Uint8Array(blurredBuffer));
        frameIndex++;
      }

      // gabungin semua frame jadi mp4
      await ffmpeg.run(
        '-framerate', `${frameRate}`,
        '-i', 'frame_%03d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        'output.mp4'
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      res.setHeader('Content-Type', 'video/mp4');
      res.send(Buffer.from(data));

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};