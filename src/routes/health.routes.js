const express = require('express');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Atlas backend is running',
    data: {
      status: 'ok',
    },
  });
});

module.exports = router;
