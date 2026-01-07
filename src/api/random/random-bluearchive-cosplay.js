const axios = require('axios');

module.exports = function (app) {
  app.get('/random/cosplay-ba', async (req, res) => {
    try {
      const { data: list } = await axios.get('https://raw.githubusercontent.com/kurozann/Img-nest/master/misc/cosplay.json');

      if (!Array.isArray(list) || list.length === 0) {
        return res.status(500).json({
          status: false,
          message: 'List gambar kosong atau rusak.'
        });
      }

      const randomImage = list[Math.floor(Math.random() * list.length)];

      const imageRes = await axios.get(randomImage, { responseType: 'arraybuffer' });
      const contentType = imageRes.headers['content-type'] || 'image/jpeg';

      res.set('Content-Type', contentType);
      res.send(imageRes.data);

    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan saat memuat gambar.'
      });
    }
  });
};