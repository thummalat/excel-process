import * as reader from 'xlsx';
import nc from 'next-connect';
import _ from 'lodash';

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
    const workBook = reader.readFile('/tmp/TSS.xlsx');
    const workBook_NFA = reader.readFile('/tmp/NFA.xlsx');
    const workBook_FINRA = reader.readFile('/tmp/FINRA.xlsx');
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
    const fin1 = fin.map(d => {
        const employeeName = `${d['Full Name']}(${d['CRD ID']})`;
        return{...d, ['Employee Name']:employeeName};
    })
    const InvertedNFADataMappings = _.invert(NFADataMappings);

    const noRecordNFAs = _.difference(NFAData.map(n => n['NFA ID']), fin1.map(f => f['NFA ID']));

    const noNFARecords = noRecordNFAs.map(d=>({'Full Name':InvertedNFADataMappings[d], 'NAF ID':d}));
    
    const ws = reader.utils.json_to_sheet(fin1);
    reader.utils.book_append_sheet(workBook, ws, 'ModSheet');
    reader.writeFile(workBook, '/tmp/TSS_MOD.xlsx');
    const workBook_mod = reader.readFile('/tmp/TSS_MOD.xlsx');
    let ModTSSData = readDataFromSheet(workBook_mod, 'ModSheet');
    res.json({ data: ModTSSData, noNFARecords });
});

function readDataFromSheet(excelName, sheetName) {
    let data = [];
    reader.utils.sheet_to_json(excelName.Sheets[sheetName]).forEach(res => data.push(res));
    return data;
}

function updateNamesForFINRASheet(finraData) {
    return finraData.map(data => ({ ...data, ['Full Name']: `${data['Last Name']}, ${data['First Name']}`.toLocaleLowerCase() }));
}

export default handler;



