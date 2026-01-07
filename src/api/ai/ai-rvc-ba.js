const ws = require('ws');
const axios = require('axios');

class RVCBlueArchive {
    constructor() {
        this.char = {
      arisu: 0,
      wakamo: 6,
      himari: 12,
      arona: 18,
      hoshino: 24,
      noa: 30,
      hina: 36,
      hifumi: 42,
      haruka: 48,
      nagisa: 54,
      kokona: 60,
      saori: 66,
      yuuka: 72,
      aru: 78,
      umika: 84,
      asuna: 90,
      kasumi: 96,
      shiroko: 102,
      mika: 108,
      mutsuki: 114,
      yukari: 120,
      mari: 126,
      hanako: 132,
      sakurako: 138,
      reisa: 144
    };
    }

    generate = async function ({ audio, char = 'arisu', is_audio_male = true }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(char.toLowerCase() in this.char)) {
                    return reject(`Karakter '${char}' tidak ditemukan.`);
                }

                const base_url = 'https://andhikagg-rvc-blue-archive.hf.space/';
                const session_hash = this.generateSession();
                const socket = new ws('wss://andhikagg-rvc-blue-archive.hf.space/queue/join');

                const aud = {
                    data: 'data:audio/mpeg;base64,' + audio.toString('base64'),
                    name: `audio_${Date.now()}.mp3`
                };

                socket.on('message', (data) => {
                    const d = JSON.parse(data.toString('utf8'));
                    switch (d.msg) {
                        case 'send_hash': {
                            socket.send(JSON.stringify({
                                fn_index: this.char[char],
                                session_hash,
                            }));
                            break;
                        }
                        case 'send_data': {
                            socket.send(JSON.stringify({
                                fn_index: this.char[char],
                                session_hash,
                                data: ['Upload audio', '', aud, '', 'en-US-AnaNeural-Female', is_audio_male ? 12 : -12, 'pm', 0.7, 3, 0, 1, 0.5],
                            }));
                            break;
                        }
                        case 'process_completed': {
                            const o = d.output;
                            const name = o.data[1]?.name;
                            socket.close();
                            return resolve({
                                duration: +o.duration.toFixed(2),
                                path: name,
                                url: base_url + 'file=' + name,
                            });
                        }
                        default: break;
                    }
                });

                socket.on('error', () => {
                    reject('WebSocket error');
                });

            } catch (err) {
                reject('Gagal memproses audio');
            }
        });
    };

    generateSession = function () {
        return Math.random().toString(36).substring(2);
    };
}

module.exports = async function (app) {
    const converter = new RVCBlueArchive();

    app.get('/ai/rvc-ba', async (req, res) => {
        try {
            const { char, audio_url, pitch } = req.query;

            if (!char || !audio_url) {
                return res.status(400).json({
                    status: false,
                    creator: 'MikuHost',
                    message: 'Parameter "char" dan "audio_url" wajib diisi.',
                });
            }

            const response = await axios.get(audio_url, {
                responseType: 'arraybuffer'
            });

            const audioBuffer = Buffer.from(response.data);

            const result = await converter.generate({
                char,
                audio: audioBuffer,
                is_audio_male: pitch !== '-12'
            });

            return res.json({
                status: true,
                creator: 'MikuHost',
                message: 'Berhasil diubah',
                char,
                pitch: pitch || 'default',
                duration: result.duration,
                url: result.url
            });

        } catch (e) {
            return res.status(500).json({
                status: false,
                creator: 'MikuHost',
                message: 'Gagal mendapatkan hasil audio.',
                char: req.query.char || null,
                pitch: req.query.pitch || null,
                duration: null,
                url: null
            });
        }
    });
};