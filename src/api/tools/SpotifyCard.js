const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

module.exports = function (app) {
  class newSpotify {
    constructor(options) {
      this.font = { name: options?.font?.name ?? "Manrope", path: options?.font?.path };
      this.album = "";
      this.artist = "";
      this.border = null;
      this._bar_width = 1400;
      this.end = null;
      this.overlay_opacity = 0.4;
      this.image = null;
      this.title = "";
      this.start = 0;
      this.spotifyLogo = true;
      this.randomColors = ["#0c0c0c", "#121212", "#282828", "#1c1c1c", "#244c66"];
    }

    setTitle(title) {
      this.title = title;
      return this;
    }

    setBackground(img) {
      this.image = img;
      return this;
    }

    setDuration(ms) {
      this.start = 0;
      this.end = parseInt(ms);
      return this;
    }

    async build() {
      GlobalFonts.registerFromPath(
        this.font.path || path.join(__dirname, "../fonts/Manrope-Regular.ttf"),
        this.font.name
      );

      const canvas = createCanvas(1600, 400);
      const ctx = canvas.getContext("2d");

      // Background
      if (this.image) {
        try {
          ctx.drawImage(await loadImage(this.image), 0, 0, 1600, 400);
        } catch {
          throw new Error("Background image tidak valid / tidak bisa dimuat.");
        }
      } else {
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, 1600, 400);
      }

      // Overlay
      ctx.fillStyle = `rgba(0,0,0,${this.overlay_opacity})`;
      ctx.fillRect(0, 0, 1600, 400);

      // Spotify logo (catbox)
      if (this.spotifyLogo) {
        try {
          ctx.drawImage(
            await loadImage("https://files.catbox.moe/abcd12.png"), // ganti link catbox logo
            1450, 40, 100, 100
          );
        } catch {
          throw new Error("Spotify logo gagal dimuat.");
        }
      }

      // Judul lagu
      ctx.font = "bold 48px Manrope";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.title || "Unknown Title", 80, 100);

      // Progress bar
      ctx.fillStyle = "#1db954";
      let progress = 0;
      if (this.end && this.end > 0) {
        progress = (this.start / this.end) * this._bar_width;
      }
      ctx.fillRect(80, 300, progress, 10);

      // Total durasi
      ctx.font = "28px Manrope";
      ctx.fillStyle = "#b3b3b3";
      ctx.fillText(this.formatTime(this.end), 80, 350);

      return canvas.toBuffer("image/png");
    }

    formatTime(ms) {
      if (!ms) return "0:00";
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  }

  // ✅ Endpoint Spotify Card
  app.get('/tools/SpotifyCard', async (req, res) => {
    try {
      const { title, background, duration } = req.query;

      if (!title) return res.json({ status: false, error: 'Parameter title wajib' });
      if (!background) return res.json({ status: false, error: 'Parameter background wajib' });
      if (!duration) return res.json({ status: false, error: 'Parameter duration wajib (ms)' });

      const spotifyCard = new newSpotify({
        font: { name: "Manrope", path: "../Manrope-Regular.ttf" }
      })
        .setTitle(title)
        .setBackground(background)
        .setDuration(duration);

      const buffer = await spotifyCard.build();

      res.set('Content-Type', 'image/png');
      res.status(200).send(buffer);

    } catch (err) {
      res.json({
        creator: "MikuHost",
        status: false,
        error: err.message
      });
    }
  });
};