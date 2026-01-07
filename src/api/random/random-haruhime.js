const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    const haruhimeImages = [
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-01.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-02.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-03.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-04.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-05.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-06.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-07.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-08.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-09.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-10.jpg",
  "https://api.ryuu-dev.offc.my.id/src/assest/Haruhime/Haruhime-11.jpg"
];

    async function getRandomWaifu() {
        try {
            const url = haruhimeImages[Math.floor(Math.random() * haruhimeImages.length)];
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

    app.get('/random/haruhime', async (req, res) => {
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