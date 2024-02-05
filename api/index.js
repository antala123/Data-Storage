import express from 'express';
import { google } from 'googleapis';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import fs from 'fs';


const app = express();

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        const extension = file.originalname.split(".").pop()
        cb(null, `${file.fieldname}-${Date.now()}.${extension}`)
    }
})

const upload = multer({ storage: storage });

app.use(cors());

app.post("/upload", upload.array('files'), async (req, res) => {

    try {

        const auth = new google.auth.GoogleAuth({
            keyFile: "key.json",
            scopes: ["https://www.googleapis.com/auth/drive"]
        })

        console.log(auth);

        const drive = google.drive({
            version: 'v3',
            auth
        })

        const uploadFiles = []

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i]

            const res = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    mimeType: file.mimeType,
                    parents: ["1MLBtfUQHHU1nBQbFkAWfae_7Bfqz_jIA"]
                },
                media: {
                    body: fs.createReadStream(file.path)
                }
            })

            uploadFiles.push(res.data);
        }

        res.json({ files: uploadFiles })
    }
    catch (error) {
        console.log(error);
    }
})

app.listen(5000, () => {
    console.log('Run Port 5000...');
})