import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images"); // set the destination folder
  },
  filename: function (req, file, cb) {
    // generate a unique filename
    cb(
      null,
      Date.now() + Math.ceil(Math.random() * 1e5) + "-" + file.originalname
    );
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});
