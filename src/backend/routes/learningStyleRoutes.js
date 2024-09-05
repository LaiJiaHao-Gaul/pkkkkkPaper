const express = require('express');
const router = express.Router();
const { saveLearningStyle,getLearningStyle } = require('../controllers/learningStyleController');

router.post('/save_learning_style', saveLearningStyle);
router.get('/learning_style/:username', getLearningStyle);


module.exports = router;