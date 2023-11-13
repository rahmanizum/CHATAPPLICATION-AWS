const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
module.exports = {
  multer: upload
};
