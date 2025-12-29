const multer = require("multer");//multer ın görevi public dosyasın a resimleri upload etmeyi kolaylaştırmak
const path = require("path");
const fs = require("fs");//dosya işlemleri için

const uploadDir = path.join(__dirname, "../public/uploads");

// Klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) +//burada  unique yapmamızın nedeni aynı isimde dosya yüklenirse sorun yaşanmasın diye
            path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Sadece resim dosyaları kabul edilir"), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }//burada 5mb a kadar dosya yüklenebilir sınırı koyduk
});
