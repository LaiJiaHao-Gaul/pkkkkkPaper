const express = require('express');
const app = express();
const learningStyleRoutes = require('./routes/learningStyleRoutes');
const userRoutes = require('./routes/userRoutes'); // 引入用户路由
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api', learningStyleRoutes);
app.use('/api/users', userRoutes); // 使用用户路由

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));