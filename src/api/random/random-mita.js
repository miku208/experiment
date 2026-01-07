const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    const mitaImages = [
        "https://www.upload.ee/image/18849406/381292502b6fb262814799afe3ac6885.jpg",
        "https://www.upload.ee/image/18849405/fad467f9855ca7eff6b27ad4df9b4711.jpg",
        "https://www.upload.ee/image/18849403/f297024ae704aee3704a507e1d7c2fc7.jpg",
        "https://www.upload.ee/image/18849402/0957c767691b487a6a307d16633b6a1c.jpg",
        "https://www.upload.ee/image/18849401/72b3bb032a1c4409d931f77792fb4570.jpg",
        "https://www.upload.ee/image/18849399/347cb80c7ec5520157caf458be2789eb.jpg",
        "https://www.upload.ee/image/18849398/WhatsApp_Image_2025-11-29_at_20.27.32.jpeg",
        "https://www.upload.ee/image/18849395/a0d0c2d51402c8ace3d4070ffd09604d.jpg",
        "https://www.upload.ee/image/18849395/a0d0c2d51402c8ace3d4070ffd09604d.jpg"
    ];

    async function getRandomWaifu() {
        try {
            const url = mitaImages[Math.floor(Math.random() * mitaImages.length)];
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

    app.get('/random/mita', async (req, res) => {
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