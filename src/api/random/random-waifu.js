const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    const waifuList = [
        "https://i.waifu.pics/Weau1RP.jpg",
        "https://i.waifu.pics/bwCsw8q.jpg",
        "https://i.waifu.pics/rzLcgTU.jpg",
        "https://i.waifu.pics/DjSMoCU.jpg",
        "https://i.waifu.pics/h_3GteW.png",
        "https://i.waifu.pics/Q5BE0Qt.jpg",
        "https://i.waifu.pics/_zlfBgp.jpg",
        "https://i.waifu.pics/ueqBS0o.jpg",
        "https://i.waifu.pics/gnpc_Lr.jpeg",
        "https://i.waifu.pics/ryft10A.jpg",
        "https://i.waifu.pics/G8JK8lu.png",
        "https://i.waifu.pics/JIQ9QZ_.jpg",
        "https://i.waifu.pics/SoQkXA3.jpg",
        "https://i.waifu.pics/4lyqRvd.jpg",
        "https://i.waifu.pics/czCeUqy.jpg",
        "https://i.waifu.pics/CxL~Tbz.jpg",
        "https://i.waifu.pics/3x8hEE1.png",
        "https://i.waifu.pics/_laUTLb.jpg",
        "https://i.waifu.pics/E_U9eeg.jpg",
        "https://i.waifu.pics/FWE8ggD.png",
        "https://i.waifu.pics/HlZeFoe.png",
        "https://i.waifu.pics/38QXoHc.jpeg",
        "https://i.waifu.pics/ZV7J1WW.png",
        "https://i.waifu.pics/d22x2XR.jpg",
        "https://i.waifu.pics/HaDv5Z-.jpg",
        "https://i.waifu.pics/Owt_E3B.jpg",
        "https://i.waifu.pics/xJuOKC8.jpg",
        "https://i.waifu.pics/45IA-ur.jpg",
        "https://i.waifu.pics/cu~8th-.jpg",
        "https://i.waifu.pics/wt2ZmoY.png",
        "https://i.waifu.pics/jnuawXf.png",
        "https://i.waifu.pics/4eSVOil.jpg",
        "https://i.waifu.pics/HNEg0-Q.png",
        "https://i.waifu.pics/LhA7EZ9.jpg",
        "https://i.waifu.pics/bZI5L7-.png"
    ];

    async function getRandomWaifu() {
        try {
            const url = waifuList[Math.floor(Math.random() * waifuList.length)];
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

    app.get('/random/waifupic', async (req, res) => {
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