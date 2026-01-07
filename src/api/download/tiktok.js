const axios = require('axios');
const cheerio = require("cheerio");

module.exports = (app) => {
    const creatorName = "MikuHost"; 

async function tiktokDl(query) {
  try {
    const response = await axios.post("https://ttsave.app/download", {
      query,
      language_id: "2",
    });

    const $ = cheerio.load(response.data);
    let result = {};

    $("a").each((i, el) => {
      const type = $(el).attr("type");
      const url = $(el).attr("href");
      if (type && url) {
        result[type] = url;
      }
    });

    return result;
  } catch (err) {
    console.error("Scrape error:", err.message);
    return null;
  }
}

    // Route Express
    app.get('/download/tiktok', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: creatorName,
                message: 'Parameter url wajib diisi'
            });
        }

        try {
            const result = await tiktokDl(url);            
                res.json({
                    status: true,
                    creator: creatorName,
                    result
                });           
        } catch (err) {
            console.error("TikTok Downloader Error:", err.message || err);
            res.status(500).json({
                status: false,
                creator: creatorName,
                message: err.message || 'Terjadi kesalahan saat memproses permintaan.'
            });
        }
    });
};