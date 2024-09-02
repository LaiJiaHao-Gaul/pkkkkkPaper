const express = require('express');
const router = express.Router();
const { postQuestion,postFeedback } = require('../controllers/gptController');

// POST 路由用于保存用户的学习风格信息
router.post('/ask', postQuestion);
router.post('/feedback', postFeedback);



module.exports = router;