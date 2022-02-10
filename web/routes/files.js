const express = require('express');
const router = express.Router();

router.get('/download/maintenance', async (req, res) => {
    const data = await req.app.get('API').maintenance.read();
    const fname = 'maintenance.json';
    const type = 'text/plain';

    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fname}"`,
        'Content-Type': type,
    });

    const download = Buffer.from(JSON.stringify(data, null, 2));
    res.end(download);
});

router.get('/download/obd-log', (req, res) => {
    res.download(process.cwd() + '/obd.log');
});

router.get('/view/obd-log', (req, res) => {
    res.sendFile(process.cwd() + '/obd.log');
});

module.exports = router;