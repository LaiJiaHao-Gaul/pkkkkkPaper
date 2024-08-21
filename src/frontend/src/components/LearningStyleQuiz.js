import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar'; // 引入进度条组件
import { Link } from 'react-router-dom'; // 用于跳转主页的链接
// 问题和选项数组
const questions = [
    "You are helping someone who wants to go to your airport, town centre or railway station. You would:",
    "You are not sure whether a word should be spelled `dependent' or `dependant'. You would:",
    "You are planning a holiday for a group. You want some feedback from them about the plan. You would:",
];

const options = [
    ["a. go with her,", "b. tell her the directions.", "c. write down the directions.", " d. draw, or give her a map."],
    ["a.  see the words in your mind and choose by the way they look.", "b.  think about how each word sounds and choose one.", "c. find it in a dictionary.", "d. write both words on paper and choose one."],
    ["a. describe some of the highlights.", "b. use a map or website to show them the places.", "c. give them a copy of the printed itinerary.", "d. phone, text or email them."],
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
    const [scores, setScores] = useState(null); // 存储计算后的学习风格分数
    const username = localStorage.getItem('username'); // 从 localStorage 获取 username

    if (!username) {
        console.error('No username found in localStorage');
        alert('Please log in before submitting the quiz');
        return;
    }

    // 处理答案选择的函数
    const handleAnswerChange = (value) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value; // 这里直接存储 'a', 'b', 'c', 'd'
        setAnswers(newAnswers);
    };

    // 提交问卷并计算结果
    const handleSubmitQuiz = async () => {
        const token = localStorage.getItem('token');
        const newScores = { V: 0, A: 0, R: 0, K: 0 };

        answers.forEach((answer, index) => {
            if (answer) {
                const style = scoring[index][answer];
                if (style) {
                    newScores[style] += 1;
                } else {
                    console.warn(`Unrecognized answer at index ${index}:`, answer);
                }
            } else {
                console.warn(`Missing answer at index ${index}`);
            }
        });

        console.log('Calculated scores:', newScores);

        try {
            const result = await axios.post('http://localhost:8000/api/save_learning_style', {
                username: username,
                visual_score: newScores.V,
                aural_score: newScores.A,
                read_write_score: newScores.R,
                kinaesthetic_score: newScores.K,
                answers: answers // 这里传输的是字母数组
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // 然后从数据库中获取最新的学习风格分数
            const response = await axios.get(`http://localhost:8000/api/learning_style/${username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response.data:', response.data);
            // 设置最新的学习风格分数到状态
            setScores(response.data);

            alert('Learning style saved and updated!');

        } catch (error) {
            console.error('Error saving or fetching learning style:', error);
            // alert('Failed to save or fetch learning style');
        }
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

    // 根据学习风格分数显示相关说明
    const renderLearningStyleDescription = () => {
        if (!scores) return null;

        const descriptions = [];
        if (scores.visual_score >= 3) {
            descriptions.push("你更擅长通过视觉学习...");
        }
        if (scores.aural_score >= 3) {
            descriptions.push("你更擅长通过语音学习...");
        }
        if (scores.read_write_score >= 3) {
            descriptions.push("你更擅长通过阅读/写作学习...");
        }
        if (scores.kinaesthetic_score >= 3) {
            descriptions.push("你更擅长通过动觉学习...");
        }

        return (
            <div>
                <h3>你的学习风格：</h3>
                <p>Visual: {scores.visual_score}</p>
                <p>Aural: {scores.aural_score}</p>
                <p>Read/Write: {scores.read_write_score}</p>
                <p>Kinaesthetic: {scores.kinaesthetic_score}</p>
                <ul>
                    {descriptions.map((desc, index) => (
                        <li key={index}>{desc}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div>
            <h2>学习风格问卷</h2>
            <ProgressBar current={currentQuestion + 1} total={questions.length} /> {/* 显示当前进度 */}

            {scores ? (
                renderLearningStyleDescription() // 显示学习风格结果
            ) : (
                <>
                    <div key={currentQuestion}>
                        <label>{questions[currentQuestion]}</label>
                        {options[currentQuestion].map((option, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    checked={answers[currentQuestion] === option.charAt(0)}
                                    onChange={() => handleAnswerChange(option.charAt(0))}
                                />
                                {option}
                            </div>
                        ))}
                    </div>

                    <button onClick={prevQuestion} disabled={currentQuestion === 0}>last question</button>
                    <button onClick={nextQuestion} disabled={currentQuestion === questions.length - 1}>next question</button>
                    {currentQuestion === questions.length - 1 && (
                        <button onClick={handleSubmitQuiz}>submit</button>
                    )}
                </>
            )}

            <Link to="/">Homepage</Link> {/* 返回首页的链接 */}
        </div>
    );
}

export default LearningStyleQuiz;