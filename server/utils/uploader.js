const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const imageExtensions = [
    ".jpeg",
    ".jpg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".webp",
    ".svg",
    ".jfif",
  ];

  const documentExtensions = [
    ".pdf",
    ".docx",
    ".doc",
    ".docs",
    ".xlsx",
    ".xls",
    ".txt",
    ".pptx",
    ".ppt",
    ".rtf",
  ];

  if (imageExtensions.includes(ext) || documentExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb({ error: "You cannot upload this type of file" }, false);
  }
};

const profileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (
    ext.toLowerCase() === ".jpeg" ||
    ext.toLowerCase() === ".jpg" ||
    ext.toLowerCase() === ".png"
  ) {
    cb(null, true);
  } else {
    cb({ error: "You cannot upload this type of file" }, false);
  }
};

const attachment = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const profileUpload = multer({
  storage: storage,
  profileFilter: profileFilter,
});

module.exports = {
  attachment,
  profileUpload,
};
