module.exports = function (app) {
const axios = require('axios');

async function ytsummarizer(url) {
    try {
        if (!/youtube.com|youtu.be/.test(url)) throw new Error('Invalid youtube url');
        
        const { data } = await axios.post('https://docsbot.ai/api/tools/youtube-prompter', {
            videoUrl: url,
            type: 'summary'
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });
        
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

  // Endpoint API
  app.get('/tools/yt-summary', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.json({ status: false, error: 'Masukkan URL YouTube' });
     
      const hasil = await ytsummarizer(url);
      res.json({
        creator: "MikuHost",
        output: [hasil]
      });
    } catch (err) {
      res.json({
        creator: "MikuHost",
        status: false,
        error: err.message
      });
    }
  });
};