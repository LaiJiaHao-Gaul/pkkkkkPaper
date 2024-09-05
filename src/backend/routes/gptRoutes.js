const express = require('express');
const router = express.Router();
const { postQuestion,postFeedback,getWeight } = require('../controllers/gptController');

router.post('/ask', postQuestion);
router.post('/feedback', postFeedback);
router.get('/weight', getWeight);



module.exports = router;