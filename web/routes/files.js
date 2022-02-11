const express = require('express');
const router = express.Router();

router.get('/download/maintenance', async (req, res) => {
    const data = await req.app.get('API').maintenance.read();
    const fname = 'maintenance.json';

    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fname}"`,
        'Content-Type': 'text/plain',
    });

    const download = Buffer.from(JSON.stringify(data, null, 2));
    res.end(download);
});

module.exports = router;