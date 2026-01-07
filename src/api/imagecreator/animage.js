const axios = require('axios');

module.exports = function(app) {
async function wainsfwillustrious(prompt, options = {}) {
  try {
    const {
      model = "v140",
      quality_prompt = "masterpiece, best quality, fine details",
      negative_prompt = "lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, low score, bad score, average score, signature, watermark, username, blurry",
      width = 1024,
      height = 1024,
      guidance_scale = 6,
      numInference_steps = 30,
      generations = 1,
    } = options;

    const _model = ["v140", "v130", "v120"];

    if (!prompt) throw new Error("Prompt is required");
    if (!_model.includes(model))
      throw new Error(`Available models: ${_model.join(", ")}`);

    const session_hash = Math.random().toString(36).substring(2);

    await axios.post(
      `https://nech-c-wainsfwillustrious-v140.hf.space/gradio_api/queue/join`,
      {
        data: [
          model,
          prompt,
          quality_prompt,
          negative_prompt,
          0, 
          true, 
          width,
          height,
          guidance_scale,
          numInference_steps,
          generations,
          null, 
          true, 
          null, 
        ],
        event_data: null,
        fn_index: 12,
        session_hash,
      }
    );

    // polling hasil
    let result = null;
    for (let i = 0; i < 30; i++) {
      const { data } = await axios.get(
        `https://nech-c-wainsfwillustrious-v140.hf.space/gradio_api/queue/data?session_hash=${session_hash}`
      );

      if (Array.isArray(data)) {
        for (const ev of data) {
          if (ev.msg === "process_completed") {
            const out = ev.output?.data?.[0];
            if (typeof out === "string") {
              result = out.startsWith("http")
                ? out
                : `https://nech-c-wainsfwillustrious-v140.hf.space${out}`;
            } else if (out?.url) {
              result = out.url.startsWith("http")
                ? out.url
                : `https://nech-c-wainsfwillustrious-v140.hf.space${out.url}`;
            }
          }
        }
      }

      if (result) break;
      await new Promise((r) => setTimeout(r, 2000));
    }

    return { url: result || null };
  } catch (error) {
    return { error: error.message };
  }
}

  app.get('/imagecreator/animage', async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) return res.json({ status: false, error: 'Parameter "prompt" wajib diisi' });

    const result = await wainsfwillustrious(prompt);

        res.json({ creator: 'MikuHost', 
        prompt: prompt, 
        output: result });
    } catch (err) {
        res.json({ creator: 'MikuHost', status: false, error: err.message });
    }
  });
};