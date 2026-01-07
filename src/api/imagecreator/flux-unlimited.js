const axios = require('axios');

module.exports = function(app) {

async function fluxImage(prompt, width = 1024, height = 1024, server = "NSFW-Core: Uncensored Server 2") {
  try {
    const { data: init } = await axios.post(
      "https://nihalgazi-flux-unlimited.hf.space/gradio_api/call/generate_image",
      { data: [prompt, width, height, 3, true, server] },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://chrunos.com",
          Referer: "https://chrunos.com/",
        },
      }
    );

    const eventId = init.event_id;
    if (!eventId) throw new Error("Failed to obtain event_id.");

    const streamUrl = `https://nihalgazi-flux-unlimited.hf.space/gradio_api/call/generate_image/${eventId}`;
    let imageUrl = null;

    for (let i = 0; i < 15; i++) {
      const { data } = await axios.get(streamUrl, {
        headers: { Accept: "text/event-stream" },
      });

      const match = data.match(/"url":\s*"([^"]+)"/);
      if (match) {
        imageUrl = match[1];
        break;
      }

      await new Promise(r => setTimeout(r, 10000));
    }

    if (!imageUrl) throw new Error("Failed to retrieve image URL from stream.");
    return imageUrl;
  } catch (err) {
    console.error("Error:", err.message);
    return null;
  }
}

  app.get('/imagecreator/flux-unli', async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) return res.json({ status: false, error: 'Parameter "prompt" wajib diisi' });

    const result = await fluxImage(prompt);

        res.json({ creator: 'MikuHost', 
        prompt: prompt, 
        output: result });
    } catch (err) {
        res.json({ creator: 'MikuHost', status: false, error: err.message });
    }
  });
};