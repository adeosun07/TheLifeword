import express from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});






app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});