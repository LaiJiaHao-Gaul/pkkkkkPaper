const express = require('express');
const router = express.Router();
const { saveLearningStyle,getLearningStyle } = require('../controllers/learningStyleController');

// let getLearningStyle=()=>{}
// POST 路由用于保存用户的学习风格信息
router.post('/save_learning_style', saveLearningStyle);
router.get('/learning_style/:username', getLearningStyle);


module.exports = router;