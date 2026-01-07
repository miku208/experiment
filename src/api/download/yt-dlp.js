const { Client } = require('ssh2');  
const path = require('path');
const fs = require('fs');

async function downloadYouTube({ ip, port, username, password, url }) {  
  return new Promise((resolve, reject) => {  
    const conn = new Client();  
    let output = '';  

    conn.on('ready', () => {  
      const cmd = `node ytdl-api/yt-dlp.js "${url}"`;  

      conn.exec(cmd, (err, stream) => {  
        if (err) return reject({ success: false, error: err.message });  

        stream.on('close', (code, signal) => {  
          conn.end();  
          resolve({ success: true, code, output });  
        }).on('data', (data) => {  
          output += data.toString();  
        }).stderr.on('data', (data) => {  
          output += data.toString();  
        });  
      });  
    }).on('error', (err) => {  
      reject({ success: false, error: err.message });  
    }).connect({  
      host: ip,  
      port: port,  
      username: username,  
      password: password  
    });  
  });  
}  

// Ambil apikey dari root folder
const settingsPath = path.join(process.cwd(), 'src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = Array.isArray(settings.apiSettings.apikey) ? settings.apiSettings.apikey : [];

module.exports = function(app) {  
  app.get("/download/yt-dlp", async (req, res) => {  
    try {  
      const { url, apikey } = req.query;  

      // Cek URL
      if (!url) return res.status(400).json({ status: false, error: "Masukkan URL YouTube" });  

      // Cek apikey
      if (!apikey || !global.apikey.includes(apikey)) {
        return res.status(403).json({ status: false, error: "Apikey kosong atau salah!" });
      }

      const result = await downloadYouTube({  
        ip: '193.143.69.126',  
        port: 34907,  
        username: 'root',  
        password: 'ryuu123',  
        url  
      });  

      const output = typeof result.output === "string"  
        ? JSON.parse(result.output)  
        : result.output;  

      res.json({  
        status: true,  
        creator: "MikuHost",  
        output  
      });  
    } catch (err) {  
      res.status(500).json({ status: false, creator: "MikuHost", error: err.message });  
    }  
  });  
};