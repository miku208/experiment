const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
require("./function.js")

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy");
app.set("json spaces", 2);

// Naikin limit jadi 70MB
app.use(express.json({ limit: '70mb' }));
app.use(express.urlencoded({ limit: '70mb', extended: true }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey

app.use((req, res, next) => {
console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
global.totalreq += 1
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Skyzo",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Api Route
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.get(['/src', '/src/*', '/api-page', '/api-page/*'], (req, res) => {   res.status(403).sendFile(path.join(__dirname, 'api-page', '403.html'));  
});

app.use('/src/assest/bot', express.static(path.join(__dirname, 'src'), {  
  setHeaders(res, filePath) {  
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {  
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');  
      res.setHeader('Access-Control-Allow-Origin', '*');  
      res.setHeader('Cache-Control', 'public, max-age=3600');  
    }  
  }  
}));

app.use((req, res, next) => {
    const forbiddenExtensions = ['.js', '.html', '.json'];
    for (const ext of forbiddenExtensions) {
        if (req.url.endsWith(ext)) {
            return res.status(403).sendFile(path.join(__dirname, 'api-page', '403.html'));
        }
    }
    next();
});

app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app