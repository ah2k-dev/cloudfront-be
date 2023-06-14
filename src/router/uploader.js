const router = require("express").Router();
const path = require("path");

router.post("/", (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  const { file } = req.files;
  const filePath = `/uploads/${file.name}`;
  file.mv(path.join(__dirname, `../../uploads`, file.name), (err) => {
    if (err) {
      res.json({ err });
    }
  });
  res.json({ filePath });
});

module.exports = router;
