const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const File = require("./File.js");

const app = express();
const PORT = 7070;

// Включаем поддержку CORS для разработки
app.use(cors());

// Папка для хранения файлов
const uploadDir = path.join(__dirname, "uploads");

// Создаем папку uploads, если она не существует
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка статических файлов для обслуживания загруженных изображений
app.use("/uploads", express.static(uploadDir));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла с использованием UUID
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

// Массив для хранения информации о файлах
let files = [];

// Endpoint для получения списка всех файлов
app.get("/files", (req, res) => {
  console.log(
    `[${new Date().toISOString()}] GET /files - Returning ${files.length} files`
  );
  res.json(files);
});

// Endpoint для получения одного файла по ID
app.get("/files/:id", (req, res) => {
  const fileId = req.params.id;
  console.log(
    `[${new Date().toISOString()}] GET /files/${fileId} - Requested file ID: ${fileId}`
  );

  const file = files.find((f) => f.id === fileId);

  if (!file) {
    console.log(
      `[${new Date().toISOString()}] GET /files/${fileId} - File not found`
    );
    return res.status(404).json({ error: "File not found" });
  }

  console.log(
    `[${new Date().toISOString()}] GET /files/${fileId} - File found: ${
      file.filename
    }`
  );
  // Отправляем файл напрямую как изображение
  const filePath = path.join(uploadDir, file.uploadName);
  res.sendFile(filePath);
});

// Endpoint для загрузки файла
app.post("/files", upload.single("file"), (req, res) => {
  console.log(
    `[${new Date().toISOString()}] POST /files - File upload started`
  );

  if (!req.file) {
    console.log(`[${new Date().toISOString()}] POST /files - No file uploaded`);
    return res.status(400).json({ error: "No file uploaded" });
  }

  
  const decodeName = decodeURIComponent(req.file.originalname);
  
  console.log(decodeURIComponent(req.file.originalname))
  // Создаем объект файла
  const file = new File({
    id: uuidv4(),
    originalname: decodeName,
    filename: req.file.filename,
    path: req.file.path,
    lastModifiedDate: req.file.lastModifiedDate,
    type: req.file.type,
    size: req.file.size,
  });
  
  console.log(`[${new Date().toISOString()}] POST /files - File uploaded:`, file);
  
  // Сохраняем информацию о файле
  files.push(file);

  console.log(
    `[${new Date().toISOString()}] POST /files - File saved with ID: ${file.id}`
  );
  res.status(201).json(file);
});

// Endpoint для удаления файла
app.delete("/files/:id", (req, res) => {
  const fileId = req.params.id;
  console.log(
    `[${new Date().toISOString()}] DELETE /files/${fileId} - Requested file ID: ${fileId}`
  );

  const fileIndex = files.findIndex((f) => f.id === fileId);

  if (fileIndex === -1) {
    console.log(
      `[${new Date().toISOString()}] DELETE /files/${fileId} - File not found`
    );
    return res.status(404).json({ error: "File not found" });
  }

  // Удаляем файл с диска
  const file = files[fileIndex];
  console.log(
    `[${new Date().toISOString()}] DELETE /files/${fileId} - Deleting file: ${
      file.filename
    }`
  );

  fs.unlinkSync(file.path);

  // Удаляем информацию о файле из массива
  files.splice(fileIndex, 1);

  console.log(
    `[${new Date().toISOString()}] DELETE /files/${fileId} - File deleted successfully`
  );
  res.status(200).json({ message: "File deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
