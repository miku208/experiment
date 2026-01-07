const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    const mahiruImages = [
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-01.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-02.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-03.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-04.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-05.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-06.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-07.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-08.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-09.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-10.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-11.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-12.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-13.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-14.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-15.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/mahiru/Mahiru-16.jpg"
];

    async function getRandomWaifu() {
        try {
            const url = mahiruImages[Math.floor(Math.random() * mahiruImages.length)];
            const response = await axios.get(url, { responseType: 'arraybuffer' });

            const ext = path.extname(url).toLowerCase().replace('.', '');
            const mimeMap = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                webp: 'image/webp'
            };

            return {
                buffer: Buffer.from(response.data),
                contentType: mimeMap[ext] || 'application/octet-stream'
            };
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/mahiruImages', async (req, res) => {
        try {
            const result = await getRandomWaifu();
            res.writeHead(200, {
                'Content-Type': result.contentType,
                'Content-Length': result.buffer.length,
            });
            res.end(result.buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};