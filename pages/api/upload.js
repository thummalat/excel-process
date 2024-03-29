
import nc from 'next-connect';
import multer from "multer";
import * as reader from 'xlsx';
import _ from 'lodash';

export const config = {
    api: {
        bodyParser: false
    }
}

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: fileStorageEngine });
const uploadFiles = upload.array('files');
const handler = nc({
    onError: (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).end("Something broke!");
    },
    onNoMatch: (req, res) => {
        res.status(404).end("Page is not found");
    },
});
handler.use(uploadFiles);
handler.post((req, res) => {
    const sheetErrDb = { 'TSS.xlsx': false, 'NFA.xlsx': false, 'FINRA.xlsx': false };
    const workBook = reader.readFile('/tmp/TSS.xlsx');
    const workBook_NFA = reader.readFile('/tmp/NFA.xlsx');
    const workBook_FINRA = reader.readFile('/tmp/FINRA.xlsx');
    _.set(sheetErrDb, `${'TSS.xlsx'}`, workBook.SheetNames.indexOf('Sheet1') === -1);
    _.set(sheetErrDb, `${'NFA.xlsx'}`, workBook_NFA.SheetNames.indexOf('Sheet1') === -1);
    _.set(sheetErrDb, `${'FINRA.xlsx'}`, workBook_FINRA.SheetNames.indexOf('Sheet1') === -1);
    let err = '';
    let hasError = false;
    _.forEach(sheetErrDb, (val, excelName) => {
        if (val) {
            hasError = true;
            err += `${excelName} has missing sheet with name: Sheet1. `;
        }
    });
    if (hasError) {
        return res.status(400).json({ err })
    }

    else {
        const sheetColumnNameErrors = getSheetCoulmnNameErrors(workBook);
        if (sheetColumnNameErrors) {
            return res.status(400).json({ err: sheetColumnNameErrors })
        }
        return res.json({ data: "File upload completed" });
    }
});

function getSheetCoulmnNameErrors(workBook) {
    let errors = [];
    let hasError = false;
    const TSSData = readDataFromSheet(workBook, 'Sheet1');
    const isFirstNameExists = _.includes(_.keys(_.first(TSSData)), 'First Name');
    const isLastNameExists = _.includes(_.keys(_.first(TSSData)), 'Last Name');
    const isReportsToNameExists = _.includes(_.keys(_.first(TSSData)), 'Reports To Name');
    if (!isFirstNameExists) {
        hasError = true;
        errors.push(`First Name`);
    }
    if (!isLastNameExists) {
        hasError = true;
        errors.push(`Last Name`);
    }
    if (!isReportsToNameExists) {
        hasError = true;
        errors.push(`Reports To Name`);
    }
    return hasError ? `TSS.xlsx is missing ${_.join(errors, ',')} column names` : null;
}

function readDataFromSheet(excelName, sheetName) {
    let data = [];
    reader.utils.sheet_to_json(excelName.Sheets[sheetName]).forEach(res => data.push(res));
    return data;
}

export default handler;
