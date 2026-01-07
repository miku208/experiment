const axios = require('axios')
const FormData = require('form-data')
const https = require('https')

const reso = {
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
  square: { width: 1024, height: 1024 },
  ultra: { width: 1536, height: 1536 },
  tall: { width: 832, height: 1344 },
  wide: { width: 1344, height: 832 }
}

module.exports = function (app) {
  app.get('/imagecreator/txt2img', async (req, res) => {
    const { prompt, resolusi = 'portrait', upscale = 2 } = req.query

    if (!prompt) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan prompt sebagai deskripsi gambar.'
      })
    }

    const selected = reso[resolusi] || reso.portrait
    const { width, height } = selected

    const form = new FormData()
    form.append('Prompt', prompt)
    form.append('Language', 'eng_Latn')
    form.append('Size', `${width}x${height}`)
    form.append('Upscale', upscale.toString())
    form.append('Batch_Index', '0')

    const agent = new https.Agent({ rejectUnauthorized: false })

    try {
      const response = await axios.post(
        'https://api.zonerai.com/zoner-ai/txt2img',
        form,
        {
          httpsAgent: agent,
          headers: {
            ...form.getHeaders(),
            'Origin': 'https://zonerai.com',
            'Referer': 'https://zonerai.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
          responseType: 'arraybuffer'
        }
      )

      const contentType = response.headers['content-type'] || 'image/jpeg'
      const buffer = Buffer.from(response.data)

      res.setHeader('Content-Type', contentType)
      res.send(buffer)
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal generate gambar',
        error: err.message
      })
    }
  })
}