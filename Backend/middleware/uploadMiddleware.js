const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `p-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/");
    cb(ok ? null : new Error("Only images allowed"), ok);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
