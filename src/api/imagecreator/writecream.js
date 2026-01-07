const axios = require('axios');

async function writecreamimg(prompt, ratio = '1:1') {
    try {
        const availableRatios = ['1:1', '16:9', '2:3', '3:2', '4:5', '5:4', '9:16', '21:9', '9:21'];
        if (!prompt) throw new Error('Prompt is required');
        if (!availableRatios.includes(ratio)) throw new Error(`List available ratio: ${availableRatios.join(', ')}`);
        
        const { data } = await axios.get('https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image', {
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://www.writecream.com',
                referer: 'https://www.writecream.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            },
            params: {
                prompt: prompt,
                aspect_ratio: ratio,
                link: 'writecream.com'
            }
        });
        
        return data.image_link;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Endpoint terpisah
module.exports = function (app) {
    app.get('/imagecreator/writecream', async (req, res) => {
        const prompt = req.query.prompt?.trim();
        const ratio = req.query.ratio?.trim() || '1:1';

        try {
            const result = await writecreamimg(prompt, ratio);
            res.status(200).json({
                status: true,
                message: 'Gambar berhasil dibuat.',
                image_url: result,
                creator: 'MikuHost'
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message || 'Terjadi kesalahan saat memproses.'
            });
        }
    });
};