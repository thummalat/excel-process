
// import nc from 'next-connect';
// const fs = require('fs');
// const mime = require('mime');


// const handler = nc({
//     onError: (err, req, res, next) => {
//         console.error(err.stack);
//         res.status(500).end("Something broke!");
//     },
//     onNoMatch: (req, res) => {
//         res.status(404).end("Page is not found");
//     },
// });

// handler.get((req, res) => {
//     let buffer = fs.readFileSync('/tmp/TSS_MOD.xlsx');
//     res.setHeader("Content-Disposition", `attachment; filename=TSS_MOD.xlsx`);
//     res.setHeader("Content-Type", mime.getType('/tmp/TSS_MOD.xlsx'));

//     // res.writeHead(200, {
//     //     'Content-Type': mime.getType('/tmp/TSS_MOD.xlsx'),
//     //     'Content-Length': stat.size
//     // });
//     // let readStream = fs.createReadStream('/tmp/TSS_MOD.xlsx');
//     res.send(buffer)
// });

// export default handler;

import stream from 'stream';
import { promisify } from 'util';
import fetch from 'node-fetch';

const pipeline = promisify(stream.pipeline);

const handler = async (req, res) => {
  const response = await fetch('/tmp/TSS_MOD.xlsx'); // replace this with your API call & options
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=dummy.pdf');
  await pipeline(response.body, res);
};

export default handler;
