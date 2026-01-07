const axios = require('axios');

module.exports = function (app) {
const imagen = {
  api: {
    base: 'https://image.pollinations.ai',
    endpoints: {
      textToImage: (prompt, width, height, seed) =>
        `/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&safe=true&seed=${seed}`
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    accept: 'image/jpeg',
    Authorization: 'Bearer Vxbsp6f84MqPzLgK',
    referer: 'https://image.pollinations.ai/'
  },

  request: (prompt, type, negative, size) => {
    const stylePrompts = {
      'No Style': '{prompt}',
      Realistic: 'realistic photo {prompt}. highly detailed, high budget, highly details, epic, high quality',
      Ghibli: 'style of studio ghibli, Hayao Miyazaki style',
      GTA: 'GTA style {prompt}. Realistic gta art style, rockstar games artwork, vice city, photorealistic concept art, detailed face, realistic anatomy, epic, cinematic, high detail, highly detailed, 4k RAW',
      Anime: 'anime style {prompt}. key visual, vibrant, studio anime, highly detailed',
      Cinematic: 'cinematic still {prompt}. emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy',
      Photographic: 'cinematic photo {prompt}. 35mm photograph, film, bokeh, professional, 4k, highly detailed',
      Fantasy: 'ethereal fantasy concept art of {prompt}. magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy',
      Cartoon: 'cartoon style {prompt}. cartoon, vibrant, high-energy, detailed',
      Cyberpunk: 'cyberpunk style {prompt}. extremely detailed, photorealistic, 8k, realistic, neon ambiance, vibrant, high-energy, cyber, futuristic',
      Manga: 'manga style {prompt}. vibrant, high-energy, detailed, iconic, Japanese comic style',
      'Digital Art': 'concept art {prompt}. digital artwork, illustrative, painterly, matte painting, highly detailed',
      Colorful: 'colorful style {prompt}. color, vibrant, high-energy, detailed, cover art, dreamy',
      Robot: 'robotic style {prompt}. robotic, vibrant, high-energy, detailed, cyber, futuristic',
      Neonpunk: 'neonpunk style {prompt}. cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional',
      'Pixel Art': 'pixel-art style {prompt}. low-res, blocky, 8-bit graphics, 16-bit, pixel',
      Disney: 'disney style {prompt}. disney cartoon, vibrant, high-energy, detailed, 3d, disney styles',
      '3D Model': 'professional 3d model {prompt}. octane render, highly detailed, volumetric, dramatic lighting'
    };

    const negativePrompts = {
      'No Style': 'extra hand, extra legs, ugly, glitch, bad eyes, text, glitch, deformed, mutated, ugly, disfigured',
      Realistic: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Ghibli: '-',
      GTA: 'ugly, deformed, noisy, blurry, anime, cartoon, distorted, out of focus, bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, missing fingers',
      Anime: 'photo, deformed, black and white, realism, disfigured, low contrast',
      Cinematic: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Photographic: 'drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly',
      Fantasy: 'photographic, realis, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white',
      Cartoon: 'ugly, deformed, noisy, blurry, low contrast, realism, photorealistic',
      Cyberpunk: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Manga: 'ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, Western comic style',
      'Digital Art': 'photo, photorealistic, realism, ugly',
      Colorful: 'graphic, text, painting, crayon, graphite, glitch, deformed, mutated, ugly, disfigured',
      Robot: 'anime, cartoon, text, painting, crayon, graphite, glitch, deformed, mutated, ugly, disfigured',
      Neonpunk: 'painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured',
      'Pixel Art': 'sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic',
      Disney: 'graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      '3D Model': 'ugly, deformed, noisy, low poly, blurry, painting'
    };

    const extraPrompt = (stylePrompts[type] || '{prompt}').replace('{prompt}', prompt);
    const fullNegative = `${negative}, ${negativePrompts[type] || ''}, nude, nudity, naked, sfw, nsfw, sex, erotic, pornography, hentai, explicit, fetish, bdsm, orgy, masturbate, masturbation, genital, vagina, penis, nipples, nipple, intercourse, ejaculation, orgasm, cunt, boobs, ****, tits, breast, ass, topless, fisting, censored`;

    let dimensions;
    switch (size) {
      case '1:1': dimensions = [1152, 1152]; break;
      case '3:4': dimensions = [864, 1152]; break;
      case '4:3': dimensions = [1152, 864]; break;
      case '16:9': dimensions = [1366, 768]; break;
      case '9:16': dimensions = [768, 1366]; break;
      default: dimensions = [1024, 1024];
    }

    return { extraPrompt, negative: fullNegative, dimensions };
  },

  generate: async (prompt = '', type = 'No Style', negative = '', size = '1:1') => {
    if (!prompt?.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Promptnya mana njirr 🗿 Malah kosong begini... ' }
      };
    }

    try {
      const { extraPrompt, negative: fullNegative, dimensions } = imagen.request(prompt, type, negative, size);
      const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const url = `${imagen.api.base}${imagen.api.endpoints.textToImage(`${extraPrompt}, ${prompt}`, dimensions[0], dimensions[1], seed)}`;

      const { data } = await axios.get(url, {
        headers: imagen.headers,
        timeout: 60000,
        responseType: 'arraybuffer'
      });

      if (!data || data.length === 0) {
        return {
          success: false,
          code: 404,
          result: { error: 'Kagak ada responsenya bree 🫵🏻🤣' }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          prompt,
          type,
          negative: fullNegative,
          dimensions,
          url,
          created: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  }
};
app.get('/imagecreator/imagen', async (req, res) => {
    try {
      const { style ,prompt, Nstyle, size } = req.query;
      if (!prompt) return res.json({ status: false, error: `Parameter "Prompt" wajid di isi` });
      if (!style) return res.json({ status: false, error: `Parameter "style" wajid di isi\nContoh:\nAnime\nFantasy\nCartoon` });      
      if (!size) return res.json({ status: false, error: `Parameter "size" wajid di isi, Contoh size valid:\n1:1\n3:4\n4:3\n16:9\n9:16` });
      if (!Nstyle) return res.json({ status: false, error: `Parameter "Nstyle" wajid di isi` });
     
const hasil = await imagen.generate(`${style} style, ${prompt}`, style, Nstyle, size);
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