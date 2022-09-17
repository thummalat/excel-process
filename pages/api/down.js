
import nc from 'next-connect';
import * as reader from 'xlsx';


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
    const workBook_TSS_MOD = reader.readFile('/tmp/TSS_MOD.xlsx');
    let ModTSSData = readDataFromSheet(workBook_TSS_MOD, 'ModSheet');
    res.json({ data: ModTSSData});
});

function readDataFromSheet(excelName,sheetName) {
    let data = [];
    reader.utils.sheet_to_json(excelName.Sheets[sheetName]).forEach(res => data.push(res));
    return data;
}

export default handler;
