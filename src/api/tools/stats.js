const fs = require('fs');
const path = require('path');

module.exports = function(app) {
    let requestCount = 0;
    let rps = 0;

    // Middleware untuk hit request
    app.use((req, res, next) => {
        requestCount++;
        next();
    });

    // Hitung RPS tiap detik
    setInterval(() => {
        rps = requestCount;
        requestCount = 0;
    }, 1000);

    // Fungsi hitung total router (file .js di ./src/api dari root project)
    function countJsFiles(dir) {
        let count = 0;
        if (!fs.existsSync(dir)) return 0;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                count += countJsFiles(fullPath);
            } else if (file.endsWith('.js')) {
                count++;
            }
        }
        return count;
    }

    // Endpoint /stats
    app.get('/stats', (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const apiFolder = path.join(process.cwd(), 'src', 'api'); // pakai root project
        const totalRouter = countJsFiles(apiFolder);
        res.json({
            ip,
            rps,
            fitur: totalRouter
        });
    });
};