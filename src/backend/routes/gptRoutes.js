const express = require('express');
const router = express.Router();
const { postQuestion } = require('../controllers/gptController');

// let getLearningStyle=()=>{}
// POST 路由用于保存用户的学习风格信息
router.post('/ask', postQuestion);
// router.get('/learning_style/:username', getLearningStyle);


module.exports = router;