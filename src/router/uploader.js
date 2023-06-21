const router = require("express").Router();
const path = require("path");

router.post("/", (req, res) => {
  if (req.files === null || req.files === undefined) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  const { files } = req.files; 
  const filePath = `/uploads/${files.name}`;
  files.mv(path.join(__dirname, `../../uploads`, files.name), (err) => {
    if (err) {
      console.log(err);
      return res.json({ err }); 
    }
  });
  return res.json({ filePath });
});
 
module.exports = router;  