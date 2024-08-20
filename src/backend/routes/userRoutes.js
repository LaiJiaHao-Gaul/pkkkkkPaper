const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');  // 添加身份验证中间件

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);  // 使用身份验证中间件保护此路由

router.get('/test', (req, res) => {
    res.send('User routes working');
});

module.exports = router;