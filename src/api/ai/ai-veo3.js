const axios = require('axios');
const crypto = require('crypto');

module.exports = function (app) {

async function veo3(prompt, { model = 'veo-3-fast', auto_sound = false, auto_speech = false } = {}) {
    try {
        const _model = ['veo-3-fast', 'veo-3'];
        
        if (!prompt) throw new Error('Prompt is required');
        if (!_model.includes(model)) throw new Error(`Available models: ${_model.join(', ')}`);
        if (typeof auto_sound !== 'boolean') throw new Error('Auto sound must be a boolean');
        if (typeof auto_speech !== 'boolean') throw new Error('Auto speech must be a boolean');
        
        const { data: cf } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
            params: {
                mode: 'turnstile-min',
                siteKey: '0x4AAAAAAAdJZmNxW54o-Gvd',
                url: 'https://lunaai.video/features/v3-fast',
                accessKey: '5238b8ad01dd627169d9ac2a6c843613d6225e6d77a6753c75dc5d3f23813653'
            }
        });
        
        const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
            prompt: prompt,
            imgUrls: [],
            quality: '720p',
            duration: 8,
            autoSoundFlag: auto_sound,
            soundPrompt: '',
            autoSpeechFlag: auto_speech,
            speechPrompt: '',
            speakerId: 'Auto',
            aspectRatio: '16:9',
            secondaryPageId: 1811,
            channel: 'VEO3',
            source: 'lunaai.video',
            type: 'features',
            watermarkFlag: true,
            privateFlag: true,
            isTemp: true,
            vipFlag: true,
            model: model
        }, {
            headers: {
                uniqueid: uid,
                verify: cf.result.token
            }
        });
        
        while (true) {
            const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
                headers: {
                    uniqueid: uid,
                    verify: cf.result.token
                }
            });
            
            if (data.data.state === 'success') return JSON.parse(data.data.completeData);
            await new Promise(res => setTimeout(res, 1000000));
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

  app.get('/ai/veo3', async (req, res) => {
    try {
      const { prompt } = req.query;
      if (!prompt) return res.json({ status: false, error: `Parameter "Prompt" wajid di isi` });
     
const hasil = await veo3(prompt, { model: 'veo-3' });

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

