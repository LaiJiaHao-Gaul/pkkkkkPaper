import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar'; // 引入进度条组件
import { Link } from 'react-router-dom'; // 用于跳转主页的链接

// 问题和选项数组
const questions = [
    "你正在帮助某人前往机场、镇中心或火车站。你会：",
    "你不确定某个单词是拼写为 'dependent' 还是 'dependant'。你会：",
    "你正在为一个团体计划假期。你想从他们那里获得一些反馈。你会：",
    // ...继续添加所有问题
];

const options = [
    ["a. 陪她去。", "b. 告诉她方向。", "c. 写下方向。", "d. 画或给她一张地图。"],
    ["a. 在脑海中想象单词并根据它们的样子选择。", "b. 想想每个单词的发音并选择一个。", "c. 在字典中查找。", "d. 在纸上写下两个单词并选择一个。"],
    ["a. 描述一些亮点。", "b. 使用地图或网站向他们展示地点。", "c. 给他们一份打印的行程。", "d. 打电话、发短信或发电子邮件给他们。"],
    // ...继续添加所有选项
];

// 对应每个问题的评分规则
const scoring = [
    { a: 'K', b: 'A', c: 'R', d: 'V' },
    { a: 'V', b: 'A', c: 'R', d: 'K' },
    { a: 'K', b: 'V', c: 'R', d: 'A' },
    // 对应其他题目的评分规则继续添加...
];

function LearningStyleQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0); // 当前显示的问题索引
    const [answers, setAnswers] = useState([]); // 存储用户的答案

    // 处理答案选择的函数
    const handleAnswerChange = (value) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value;
        setAnswers(newAnswers);
    };

    // 提交问卷并计算结果
    const handleSubmitQuiz = async () => {
        const scores = { V: 0, A: 0, R: 0, K: 0 }; // 初始化VARK得分

        // 遍历用户的每个答案，更新对应学习风格的得分
        answers.forEach((answer, index) => {
            if (answer) {
                const style = scoring[index][answer];
                scores[style] += 1;
            }
        });

        // 发送得分和答案到服务器
        const result = await axios.post('http://localhost:5000/save_learning_style', {
            user_id: 1, // 假设已登录用户ID为1，实际应从登录状态中获取
            visual_score: scores.V,
            aural_score: scores.A,
            read_write_score: scores.R,
            kinaesthetic_score: scores.K,
            answers: answers
        });
        alert('Learning style saved!');
    };

    // 处理下一问题
    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    // 处理上一问题
    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    return (
        <div>
            <h2>学习风格问卷</h2>
            <ProgressBar current={currentQuestion + 1} total={questions.length} /> {/* 显示当前进度 */}
            
            <div key={currentQuestion}>
                <label>{questions[currentQuestion]}</label>
                {options[currentQuestion].map((option, index) => (
                    <div key={index}>
                        <input 
                            type="radio" 
                            checked={answers[currentQuestion] === option}
                            onChange={() => handleAnswerChange(option)} 
                        />
                        {option}
                    </div>
                ))}
            </div>

            <button onClick={prevQuestion} disabled={currentQuestion === 0}>上一题</button>
            <button onClick={nextQuestion} disabled={currentQuestion === questions.length - 1}>下一题</button>
            {currentQuestion === questions.length - 1 && (
                <button onClick={handleSubmitQuiz}>提交</button>
            )}
            <Link to="/">返回首页</Link> {/* 返回首页的链接 */}
        </div>
    );
}

export default LearningStyleQuiz;