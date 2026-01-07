const fetch = require("node-fetch");

const yt = {
  get baseUrl() {
    return { origin: "https://ssvid.net" };
  },

  get baseHeaders() {
    return {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "origin": this.baseUrl.origin,
      "referer": this.baseUrl.origin + "/youtube-to-mp3",
    };
  },

  validateFormat(userFormat) {
    const validFormat = ["mp3", "360p", "720p", "1080p"];
    if (!validFormat.includes(userFormat))
      throw Error(`invalid format! available formats: ${validFormat.join(", ")}`);
  },

  handleFormat(userFormat, searchJson) {
    this.validateFormat(userFormat);
    let result;
    if (userFormat === "mp3") {
      result = searchJson.links?.mp3?.mp3128?.k;
    } else {
      let selectedFormat;
      const allFormats = Object.entries(searchJson.links.mp4);
      const quality = allFormats
        .map((v) => v[1].q)
        .filter((v) => /\d+p/.test(v))
        .map((v) => parseInt(v))
        .sort((a, b) => b - a)
        .map((v) => v + "p");

      if (!quality.includes(userFormat)) {
        selectedFormat = quality[0]; // fallback ke best
      } else {
        selectedFormat = userFormat;
      }
      const find = allFormats.find((v) => v[1].q === selectedFormat);
      result = find?.[1]?.k;
    }
    if (!result) throw Error(`${userFormat} gak ada`);
    return result;
  },

  async hit(path, payload) {
    const body = new URLSearchParams(payload);
    const opts = { headers: this.baseHeaders, body, method: "post" };
    const r = await fetch(`${this.baseUrl.origin}${path}`, opts);
    if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`);
    return await r.json();
  },

  async download(queryOrYtUrl, userFormat = "mp3") {
    this.validateFormat(userFormat);

    // first hit
    let search = await this.hit("/api/ajax/search", {
      query: queryOrYtUrl,
      cf_token: "",
      vt: "youtube",
    });

    if (search.p === "search") {
      if (!search?.items?.length)
        throw Error(`hasil pencarian ${queryOrYtUrl} tidak ada`);
      const { v } = search.items[0];
      const videoUrl = "https://www.youtube.com/watch?v=" + v;

      // hit ulang pakai url video
      search = await this.hit("/api/ajax/search", {
        query: videoUrl,
        cf_token: "",
        vt: "youtube",
      });
    }

    const vid = search.vid;
    const k = this.handleFormat(userFormat, search);

    // convert
    const convert = await this.hit("/api/ajax/convert", { k, vid });
    return convert;
  },
};

module.exports = function (app) {
  // 🎵 Endpoint untuk MP3
  app.get("/download/ytmp3", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.json({ status: false, error: "Masukkan URL YouTube" });

      const result = await yt.download(url, "mp3");

      res.json({
        creator: "Ryuu Dev",
        ...result,
      });
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });

  // 🎬 Endpoint untuk MP4 720p
  app.get("/download/ytmp4", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.json({ status: false, error: "Masukkan URL YouTube" });

      const result = await yt.download(url, "720p");

      res.json({
        creator: "Ryuu Dev",
        ...result,
      });
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });
};