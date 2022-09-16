
import nc from 'next-connect';
const fs = require('fs');
const mime = require('mime');


const handler = nc({
    onError: (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).end("Something broke!");
    },
    onNoMatch: (req, res) => {
        res.status(404).end("Page is not found");
    },
});

handler.get((req, res) => {
    let buffer = fs.readFileSync('/tmp/TSS_MOD.xlsx');
    res.setHeader("Content-Disposition", `attachment; filename=TSS_MOD.xlsx`);
    res.setHeader("Content-Type", mime.getType('/tmp/TSS_MOD.xlsx'));

    // res.writeHead(200, {
    //     'Content-Type': mime.getType('/tmp/TSS_MOD.xlsx'),
    //     'Content-Length': stat.size
    // });
    // let readStream = fs.createReadStream('/tmp/TSS_MOD.xlsx');
    res.sendDate(buffer)
});

export default handler;
