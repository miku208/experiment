const axios = require('axios');

const colorMap = {
  putih: '#FFFFFF', hijau: '#00FF00', kuning: '#FFFF00', hitam: '#000000',
  merah: '#FF0000', biru: '#0000FF', ungu: '#800080', jingga: '#FFA500',
  pink: '#FFC0CB', 'abu-abu': '#808080', coklat: '#A52A2A', cyan: '#00FFFF',
  magenta: '#FF00FF', maroon: '#800000', navy: '#000080', olive: '#808000',
  orange: '#FFA500', purple: '#800080', silver: '#C0C0C0', teal: '#008080',
  turquoise: '#40E0D0', violet: '#EE82EE', salmon: '#FA8072', gold: '#FFD700',
  indigo: '#4B0082', lime: '#00FF00', skyblue: '#87CEEB', tan: '#D2B48C',
  orchid: '#DA70D6', coral: '#FF7F50'
};

module.exports = function(app) {
  app.get('/tools/qc', async (req, res) => {
    let { text, profile, color, name } = req.query;

    if (!text || !profile || !name) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text", "profile", dan "name" diperlukan.'
      });
    }

    if (text.length > 100) {
      return res.status(400).json({
        status: false,
        message: 'Teks terlalu panjang! Maksimal 100 karakter.'
      });
    }

    const bgColor = colorMap[color?.toLowerCase()] || '#FFFFFF';

    const obj = {
      type: 'quote',
      format: 'png',
      backgroundColor: bgColor,
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: name,
          photo: { url: profile }
        },
        text: text,
        replyMessage: {}
      }]
    };

    try {
      const { data } = await axios.post('https://bot.lyo.su/quote/generate', obj, {
        headers: { 'Content-Type': 'application/json' }
      });

      const buffer = Buffer.from(data.result.image, 'base64');
      res.set('Content-Type', 'image/png');
      res.send(buffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'Gagal membuat stiker quote.',
        error: err.message
      });
    }
  });
};