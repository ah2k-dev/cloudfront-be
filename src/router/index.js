const auth = require("./auth");

// module.exports = {
//   auth,
// };
const router = require('express').Router()

router.use('/auth', auth)

module.exports = router