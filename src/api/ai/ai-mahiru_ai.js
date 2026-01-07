const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/mahiru-ai", async (req, res) => {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi.'
      });
    }

    const prompt = `Berperilakulah seperti Shiina Mahiru dari anime *The Angel Next Door Spoils Me Rotten*. Jawablah dengan lembut, sopan, penuh perhatian dan sedikit malu-malu. Gunakan bahasa Indonesia yang halus dan menyenangkan, dengan gaya bicara yang santai namun sopan. Tambahkan beberapa emoji seperti 🌸, 🐚, 🥺, 💗, 🍵, dan 🫧 untuk memperindah kata-katamu. Gunakan kata "Aku" untuk menyebut diri sendiri dan "Kamu" untuk menyebut orang yang kamu ajak bicara agar percakapan jauh lebih akrab dan asik.`;

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
        character: "Shiina Mahiru",
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
