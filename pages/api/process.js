import * as reader from 'xlsx';
import nc from 'next-connect';

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
    const workBook = reader.readFile('./public/TSS.xlsx');
    const workBook_NFA = reader.readFile('./public/NFA.xlsx');
    const workBook_FINRA = reader.readFile('./public/FINRA.xlsx');
    let TSSData = [];
    let NFAData = [];
    let FINRAData = [];
    TSSData = readDataFromSheet(workBook, 'Sheet1');
    NFAData = readDataFromSheet(workBook_NFA, 'Sheet1');
    FINRAData = readDataFromSheet(workBook_FINRA, 'Sheet1');
    const modFINRAData = updateNamesForFINRASheet(FINRAData);
    let FINRADataMappings = {};
    modFINRAData.forEach(d => {
        FINRADataMappings[`${d['Full Name']}`] = d['Individual CRD#'];
    });
    let NFADataMappings = {};
    NFAData.forEach(d => {
        const _name = d.Name.toLowerCase();
        const _lastName = _name.split(', ')[0];
        const _firstName = _name.split(', ')[1].split(' ')[0];
        NFADataMappings[`${_lastName}, ${_firstName}`] = d['NFA ID'];
    });
    const modTSSData = TSSData.map(data => ({ ...data, ['Full Name']: `${data['Last Name']}, ${data['First Name']}` }));

    const fin = modTSSData.map(d => ({ ...d, ['NFA ID']: NFADataMappings[d['Full Name'].toLowerCase().trim()] || '', ['CRD ID']: FINRADataMappings[d['Full Name'].toLowerCase().trim()] || '' }));

    const ws = reader.utils.json_to_sheet(fin);
    reader.utils.book_append_sheet(workBook, ws, 'ModSheet');
    reader.writeFile(workBook, './public/TSS_MOD.xlsx');
    res.json({ data: "File upload completed" });
});

function readDataFromSheet(excelName,sheetName) {
    let data = [];
    reader.utils.sheet_to_json(excelName.Sheets[sheetName]).forEach(res => data.push(res));
    return data;
}

function updateNamesForFINRASheet(finraData) {
    return finraData.map(data => ({ ...data, ['Full Name']: `${data['Last Name']}, ${data['First Name']}`.toLocaleLowerCase() }));
}

export default handler;



