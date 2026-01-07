module.exports = function (app) {    
const axios = require('axios');  
const path = require('path');  
const fs = require('fs');    
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');    
    
class WelcomeLeave {    
  constructor(options) {    
    this.font = {    
      name: "Poppins",    
      path: "../Poppins-Regular.ttf"    
    };    
    this.avatar = "https://cdn.discordapp.com/embed/avatars/0.png";    
    this.background = { type: "color", background: "#23272a" };    
    this.title = { data: "Welcome", color: "#fff", size: 36 };    
    this.description = { data: "Welcome to this server, go read the rules please!", color: "#a7b9c5", size: 26 };    
    this.overlay_opacity = 0;    
    this.border = null;    
    this.avatar_border = "#2a2e35";    
  }    
    
  setAvatar(image) {    
    this.avatar = image;    
    return this;    
  }    
    
  setAvatarBorder(color) {    
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {    
      throw new Error("You must give a hexadecimal color as the argument of setAvatarBorder method.");    
    }    
    this.avatar_border = color;    
    return this;    
  }    
    
  setBackground(type, value) {    
    if (type === 'color') {    
      if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)) throw new Error("Invalid hex color for background.");    
      this.background = { type: "color", background: value };    
    } else if (type === 'image') {    
      if (!value) throw new Error("You must give a background URL or buffer.");    
      this.background = { type: "image", background: value };    
    } else {    
      throw new Error("setBackground first argument must be 'color' or 'image'.");    
    }    
    return this;    
  }    
    
  setBorder(color) {    
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("Invalid hex color for border.");    
    this.border = color;    
    return this;    
  }    
    
  setDescription(text, color = "#a7b9c5") {    
    if (!text) throw new Error("Description text is required.");    
    if (text.length > 200) throw new Error("Description cannot exceed 200 characters.");    
    this.description.data = text;    
    if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) this.description.color = color;    
    return this;    
  }    
    
  setTitle(text, color = "#fff") {    
    if (!text) throw new Error("Title text is required.");    
    if (text.length > 50) throw new Error("Title cannot exceed 50 characters.");    
    this.title.data = text;    
    if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) this.title.color = color;    
    return this;    
  }    
    
  setOverlayOpacity(opacity = 0) {    
    if (opacity < 0 || opacity > 1) throw new Error("Overlay opacity must be between 0 and 1.");    
    this.overlay_opacity = opacity;    
    return this;    
  }    
    
  // Fungsi helper untuk wrap text otomatis    
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {    
    const words = text.split(' ');    
    let line = '';    
    for (let n = 0; n < words.length; n++) {    
      const testLine = line + words[n] + ' ';    
      const metrics = ctx.measureText(testLine);    
      if (metrics.width > maxWidth && n > 0) {    
        ctx.fillText(line, x, y);    
        line = words[n] + ' ';    
        y += lineHeight;    
      } else {    
        line = testLine;    
      }    
    }    
    ctx.fillText(line, x, y);    
  }    
    
  async build() {  
  const fontArialPath = path.join(__dirname, '../Poppins-Regular.ttf');
  if (this.font.path) GlobalFonts.registerFromPath(fontArialPath, 'Poppins');  

  const canvas = createCanvas(700, 350);  
  const ctx = canvas.getContext("2d");  

  // 👉 Isi full canvas dengan hitam pekat dulu (700x350)
  ctx.fillStyle = "#000000";  
  ctx.fillRect(0, 0, canvas.width, canvas.height);  

  // Border utama  
  if (this.border) {  
    ctx.beginPath();  
    ctx.lineWidth = 8;  
    ctx.strokeStyle = this.border;  
    ctx.moveTo(55, 15);  
    ctx.lineTo(canvas.width - 55, 15);  
    ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);  
    ctx.lineTo(canvas.width - 15, canvas.height - 55);  
    ctx.quadraticCurveTo(canvas.width - 20, canvas.height - 20, canvas.width - 55, canvas.height - 15);  
    ctx.lineTo(55, canvas.height - 15);  
    ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);  
    ctx.lineTo(15, 55);  
    ctx.quadraticCurveTo(20, 20, 55, 15);  
    ctx.stroke();  
    ctx.closePath();  
  }  

  // Clip area utama  
  ctx.beginPath();  
  ctx.moveTo(65, 25);  
  ctx.lineTo(canvas.width - 65, 25);  
  ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);  
  ctx.lineTo(canvas.width - 25, canvas.height - 65);  
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 25, canvas.width - 65, canvas.height - 25);  
  ctx.lineTo(65, canvas.height - 25);  
  ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);  
  ctx.lineTo(25, 65);  
  ctx.quadraticCurveTo(25, 25, 65, 25);  
  ctx.closePath();  
  ctx.clip();  

  // Background  
  ctx.globalAlpha = 1;  
  if (this.background.type === "color") {  
    ctx.fillStyle = this.background.background;  
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);  
  } else if (this.background.type === "image") {  
    try {  
      const img = await loadImage(this.background.background);  
      const iw = img.width;  
      const ih = img.height;  
      const cw = canvas.width - 20;  
      const ch = canvas.height - 20;  
      const scale = Math.max(cw / iw, ch / ih);  
      const nw = iw * scale;  
      const nh = ih * scale;  
      const nx = (canvas.width - nw) / 2;  
      const ny = (canvas.height - nh) / 2;  
      ctx.drawImage(img, nx, ny, nw, nh);  
    } catch {  
      throw new Error("Invalid background image.");  
    }  
  }  

  // Overlay  
  ctx.globalAlpha = this.overlay_opacity;  
  ctx.fillStyle = "#000";  
  ctx.fillRect(45, 45, canvas.width - 90, canvas.height - 90);  

  // Title  
  ctx.globalAlpha = 1;  
  ctx.font = `bold ${this.title.size}px ${this.font.name}`;  
  ctx.fillStyle = this.title.color;  
  ctx.textAlign = "center";  
  ctx.fillText(this.title.data, canvas.width / 2, 225);  

  // Description dengan wrap otomatis  
  ctx.font = `regular ${this.description.size}px ${this.font.name}`;  
  ctx.fillStyle = this.description.color;  
  ctx.textAlign = "center";  
  this.wrapText(ctx, this.description.data, canvas.width / 2, 260, 400, 35);  

  // Avatar border  
  ctx.beginPath();  
  ctx.lineWidth = 5;  
  ctx.strokeStyle = this.avatar_border;  
  ctx.arc(canvas.width / 2, 125, 66, 0, Math.PI * 2);  
  ctx.stroke();  
  ctx.closePath();  

  // Avatar clip  
  ctx.beginPath();  
  ctx.arc(canvas.width / 2, 125, 60, 0, Math.PI * 2);  
  ctx.closePath();  
  ctx.clip();  

  // Draw avatar  
  try {  
    ctx.drawImage(await loadImage(this.avatar), canvas.width / 2 - 60, 65, 120, 120);  
  } catch {  
    throw new Error("Invalid avatar image.");  
  }  

  return canvas.toBuffer('image/png');  
}    
}    
    
  // Endpoint API    
  app.get('/tools/WelcomeLeave', async (req, res) => {    
    try {    
      const { desc, title, profile, background } = req.query;    
      if (!title) return res.json({ status: false, error: 'Masukkan Paramete title' });       
      if (!desc) return res.json({ status: false, error: 'Masukkan Paramete desc' });    
      if (!profile) return res.json({ status: false, error: 'Masukkan Link profile' });    
      if (!background) return res.json({ status: false, error: 'Masukkan Link background' });    
          
const bgBuffer = (await axios.get(background, { responseType: 'arraybuffer' })).data;    
const ppBuffer = (await axios.get(profile, { responseType: 'arraybuffer' })).data;    
const judul = title  
const deskripsi = desc  
  
const welcomeCard = new WelcomeLeave()    
      .setAvatar(ppBuffer)    
      .setBackground("image", bgBuffer)    
      .setTitle(judul)    
      .setDescription(deskripsi)    
      .setOverlayOpacity(0.5);    
          
      const buffer = await welcomeCard.build();    
          
      res.set('Content-Type', 'image/png');    
      res.status(200).send(buffer);    
             
    } catch (err) {    
      res.json({    
        creator: "MikuHost",    
        status: false,    
        error: err.message    
      });    
    }    
  });    
};