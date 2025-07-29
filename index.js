const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Keyv } = require("keyv");
const { KeyvFile } = require("keyv-file");

const app = express();
const PORT = 3000;

const UPLOAD_FOLDER = "./temp";

/**
 * Keyv setup with file storage
 * where each key is a filename and the value {@link FileMeta}.
 */
const uploadedFiles = new Keyv({
  store: new KeyvFile({
    filename: `./${UPLOAD_FOLDER}/.db/files.json`,
  }),
});

/**
 * Since keyv-file doesn't support the getKeys function,
 * we use a separate file to store filenames for listing purposes.
 * The key name used to store the array of filenames
 */
const KEY_NAME = "filenames";

/**
 * Keyv setup with file storage
 * where the key is KEY_NAME and the value is an array of uploaded filenames
 */
const uploadedFilenames = new Keyv({
  store: new KeyvFile({
    filename: `./${UPLOAD_FOLDER}/.db/keys.json`,
  }),
});

/**
 * Create folder for uploads based on the {@link UPLOAD_FOLDER}.
 */
const uploadFolder = path.join(__dirname, UPLOAD_FOLDER);
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Upload File
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const metadata = {
    filename: req.file.originalname,
    path: req.file.path,
    uploadedAt: new Date().toISOString(),
  };

  // add file details
  await uploadedFiles.set(req.file.originalname, metadata);

  // update list
  const filenames = (await uploadedFilenames.get(KEY_NAME)) ?? [];
  filenames.push(metadata.filename);
  await uploadedFilenames.set(KEY_NAME, filenames);

  res.send(`File "${req.file.originalname}" uploaded.`);
});

// List Files
app.get("/files", async (req, res) => {
  // const keys = await uploadedFiles.opts.store.getKeys(); // specific to keyv-file
  // TypeError: uploadedFiles.opts.store.getKeys is not a function
  const keys = await uploadedFilenames.get(KEY_NAME);
  res.json(keys);
});

// Download File
app.get("/download/:filename", async (req, res) => {
  const fileMeta = await uploadedFiles.get(req.params.filename);
  if (!fileMeta || !fs.existsSync(fileMeta.path)) {
    return res.status(404).send("File not found.");
  }
  res.download(fileMeta.path);
});

app.listen(PORT, () => {
  console.log(`File server running at http://localhost:${PORT}`);
});

/**
 * @typedef FileMeta
 * @property {string} name The uploaded filename.
 * @property {string} path The path to store.
 * @property {string} uploadedAt The uploaded datetime
 */
