const yt = {
    url: Object.freeze({
        audio128: 'https://api.apiapi.lat',
        video: 'https://api5.apiapi.lat',
        else: 'https://api3.apiapi.lat',
        referrer: 'https://ogmp3.pro/'
    }),
    encUrl: s => s.split('').map(c => c.charCodeAt()).reverse().join(';'),
    xor: s => s.split('').map(v => String.fromCharCode(v.charCodeAt() ^ 1)).join(''),
    genRandomHex: () => Array.from({ length: 32 }, _ => "0123456789abcdef"[Math.floor(Math.random()*16)]).join(""),
    init: async function (rpObj) {
        const { apiOrigin, payload } = rpObj
        const api = apiOrigin + "/" + this.genRandomHex() + "/init/" + this.encUrl(this.xor(payload.data)) + "/" + this.genRandomHex() + "/"
        const r = await fetch(api, { method: "post", body: JSON.stringify(payload) })
        if (!r.ok) throw Error(await r.text())
        return r.json()
    },
    genFileUrl: function (i, pk, rpObj) {
        const { apiOrigin } = rpObj
        const pkValue = pk ? pk + "/" : ""
        const downloadUrl = apiOrigin + "/" + this.genRandomHex() + "/download/" + i + "/" + this.genRandomHex() + "/" + pkValue
        return { downloadUrl }
    },
    statusCheck: async function (i, pk, rpObj) {
        const { apiOrigin } = rpObj
        let json
        let count = 0
        do {
            await new Promise(r => setTimeout(r, 5000))
            count++
            const pkVal = pk ? pk + "/" : ""
            const api = apiOrigin + "/" + this.genRandomHex() + "/status/" + i + "/" + this.genRandomHex() + "/" + pkVal
            const r = await fetch(api, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: i })
            })
            if (!r.ok) throw Error(await r.text())
            json = await r.json()
            if (count >= 100) throw Error("pooling mencapai 100, dihentikan")
        } while (json.s === "P")
        if (json.s === "E") throw Error(JSON.stringify(json))
        return this.genFileUrl(i, pk, rpObj)
    },
    resolvePayload: function (ytUrl, userFormat) {
        const valid = ["64k","96k","128k","192k","256k","320k","240p","360p","480p","720p","1080p"]
        if (!valid.includes(userFormat)) throw Error(`format salah. tersedia: ${valid.join(", ")}`)
        let apiOrigin = this.url.audio128
        let data = this.xor(ytUrl)
        let referer = this.url.referrer
        let format = "0"
        let mp3Quality = "128"
        let mp4Quality = "720"
        if (/^\d+p$/.test(userFormat)) {
            apiOrigin = this.url.video
            format = "1"
            mp4Quality = userFormat.replace("p","")
        } else if (userFormat !== "128k") {
            apiOrigin = this.url.else
            mp3Quality = userFormat.replace("k","")
        }
        return {
            apiOrigin,
            payload: {
                data,
                format,
                referer,
                mp3Quality,
                mp4Quality,
                userTimeZone: "-480"
            }
        }
    },
    download: async function (url, fmt = "128k") {
        const rpObj = this.resolvePayload(url, fmt)
        const initObj = await this.init(rpObj)
        const { i, pk, s } = initObj
        if (s === "C") return this.genFileUrl(i, pk, rpObj)
        return this.statusCheck(i, pk, rpObj)
    }
} 
  
module.exports = function(app) {  
  app.get("/download/ytmp3", async (req, res) => {  
    try {  
      const { url } = req.query;  
      if (!url) return res.status(400).json({ status: false, error: "Input URL not found " });  
  
      const result = await yt.download(url, "128k");  
  
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