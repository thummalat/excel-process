
import nc from 'next-connect';
import multer from "multer";

export const config = {
    api: {
        bodyParser: false
    }
}

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
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
    res.json({ data: "File upload completed" });
});

export default handler;
