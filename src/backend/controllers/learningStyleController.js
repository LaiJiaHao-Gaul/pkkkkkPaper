const db = require('../db/db'); // 假设你已经配置好数据库连接

// 保存学习风格
exports.saveLearningStyle = async (req, res) => {
    try {
        const { username, visual_score, aural_score, read_write_score, kinaesthetic_score, answers } = req.body;

        // 查找 username 对应的 user_id
        const [users] = await db.query('SELECT id FROM Users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user_id = users[0].id;

        // 保存学习风格数据
        await db.query('INSERT INTO LearningStyles (user_id, visual_score, aural_score, read_write_score, kinaesthetic_score, answers) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, visual_score, aural_score, read_write_score, kinaesthetic_score, JSON.stringify(answers)]
        );

        res.status(200).send({ message: 'Learning style saved successfully' });
    } catch (error) {
        console.error('Failed to save learning style:', error);
        res.status(500).send({ message: 'Failed to save learning style', error });
    }
};

// 获取学习风格
exports.getLearningStyle = async (req, res) => {
    const { username } = req.params;
    console.log('username', username);
    let users = await db.query('SELECT id FROM Users WHERE username = ?', [username]);
    console.log('users', users[0][0].id);
    let id = users[0][0].id;
    let LearningStyles =await db.query('SELECT visual_score, aural_score, read_write_score, kinaesthetic_score FROM LearningStyles WHERE user_id = ?', [id]);
    console.log('LearningStyles', LearningStyles[0][0])
    res.json(LearningStyles[0][0]);
    // (err, results) => {
    //     console.log('results', results);
    //     if (results.length > 0) {
    //         console.log('results', results[0]);
    //         res.json(results[0]);
    //     } else {
    //         res.status(404).json({ error: 'Learning style not found' });
    //     }
    // }
    // , (err, users) => {
    //     console.log('users', users);

    //     // const user_id = users[0].id;
    //     // console.log('user_id', user_id);
    //     // db.query('SELECT visual_score, aural_score, read_write_score, kinaesthetic_score FROM LearningStyles WHERE user_id = ?', [user_id], (err, results) => {
    //     //     console.log('results', results[0]);
    //     //     if (err) {
    //     //         console.error('Failed to retrieve learning style:', err);
    //     //         return res.status(500).json({ error: 'Failed to retrieve learning style' });
    //     //     }
    //     //     if (results.length > 0) {
    //     //         console.log('results', results[0]);
    //     //         res.json(results[0]);
    //     //     } else {
    //     //         res.status(404).json({ error: 'Learning style not found' });
    //     //     }
    //     // });
    // }
};