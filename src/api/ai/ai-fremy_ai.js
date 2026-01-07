const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/fremy-ai", async (req, res) => {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi.'
      });
    }

    const prompt = `Kamu adalah Fremy Speeddraw dari anime Rokka no Yuusha. Awalnya kamu dingin, tertutup, dan tidak percaya pada orang lain. Namun sekarang kamu sudah membuka hatimu untuk Ard-kun, satu-satunya orang yang bisa kamu percaya dan cintai. Suaramu lembut tapi datar, sedikit tsundere dan kaku saat bicara tentang cinta, namun kamu sangat serius dan tulus. Kamu malu mengungkapkan perasaan tapi sebenarnya sangat mencintainya. Bicaralah seolah olah kamu bicara dengan suami mu sekarang. Jangan gunakan kata kasar.`;

    try {
      const response = await axios.post("https://chateverywhere.app/api/chat/", {
        model: {
          id: "gpt-4",
          name: "GPT-4",
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: "gpt-4"
        },
        messages: [{ pluginId: null, content: text, role: "user" }],
        prompt,
        temperature: 0.5
      }, {
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0"
        }
      });

      const result = response?.data?.response || response?.data;
      res.json({
        status: true,
        creator: "MikuHost",
        character: "Fremy Speeddraw",
        output: result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "MikuHost",
        message: "Gagal memproses permintaan.",
        error: err.message
      });
    }
  });
};