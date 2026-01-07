const axios = require("axios");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { fetchFile, createFFmpeg } = require("@ffmpeg/ffmpeg");

const ffmpeg = createFFmpeg({ log: true });

module.exports = async function (app) {
  app.get("/tools/smeme-vid", async (req, res) => {
    try {
      const { img, atas, bawah } = req.query;
      if (!img || !atas || !bawah) {
        return res.status(400).send("Parameter img, atas, bawah wajib diisi");
      }

      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // load font
      GlobalFonts.registerFromPath("./Milker.ttf", "Milker");
      GlobalFonts.registerFromPath("./NotoColorEmoji.ttf", "NotoColorEmoji");

      // ambil gambar
      const imageResp = await axios.get(img, { responseType: "arraybuffer" });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      const size = 480;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      // fungsi render 1 frame
      const renderFrame = (progress) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, size, size);

        // scale gambar
        const scale = Math.min(size / baseImage.width, size / baseImage.height);
        const newWidth = baseImage.width * scale;
        const newHeight = baseImage.height * scale;
        const offsetX = (size - newWidth) / 2;
        const offsetY = (size - newHeight) / 2;

        ctx.drawImage(baseImage, offsetX, offsetY, newWidth, newHeight);

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = `900 40px "Milker", "NotoColorEmoji"`;

        // animasi sederhana: teks naik turun
        const offset = Math.sin(progress * Math.PI * 2) * 10;

        ctx.strokeText(atas, size / 2, 60 + offset);
        ctx.fillText(atas, size / 2, 60 + offset);

        ctx.strokeText(bawah, size / 2, size - 40 - offset);
        ctx.fillText(bawah, size / 2, size - 40 - offset);

        return canvas.toBuffer("image/jpeg");
      };

      // render beberapa frame
      const frameCount = 30; // 1 detik @30fps
      for (let i = 0; i < frameCount; i++) {
        const buffer = renderFrame(i / frameCount);
        ffmpeg.FS("writeFile", `frame${i}.jpg`, buffer);
      }

      // jalankan ffmpeg (encode jadi mp4)
      await ffmpeg.run(
        "-framerate", "30",
        "-i", "frame%d.jpg",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "out.mp4"
      );

      const data = ffmpeg.FS("readFile", "out.mp4");

      res.set("Content-Type", "video/mp4");
      res.send(Buffer.from(data));

    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message });
    }
  });
};