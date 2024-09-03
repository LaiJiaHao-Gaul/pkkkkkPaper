import React, { useState, useEffect } from 'react';
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
    ["a. go with her.", "b. tell her the directions.", "c. write down the directions.", "d. draw, or give her a map."],
    ["a. see the words in your mind and choose by the way they look.", "b. think about how each word sounds and choose one.", "c. find it in a dictionary.", "d. write both words on paper and choose one."],
    ["a. describe some of the highlights.", "b. use a map or website to show them the places.", "c. give them a copy of the printed itinerary.", "d. phone, text or email them."],
    ["a. cook something you know without the need for instructions.", "b. ask friends for suggestions.", "c. look through the cookbook for ideas from the pictures.", "d. use a cookbook where you know there is a good recipe."],
    ["a. talk about, or arrange a talk for them about parks or nature reserves.", "b. show them internet pictures, photographs or picture books.", "c. take them to a park or nature reserve and walk with them.", "d. give them a book or pamphlets about the parks or nature reserves."],
    ["a. Trying or testing it.", "b. Reading the details about its features.", "c. It is a modern design and looks good.", "d. The salesperson telling me about its features."],
    ["a. watching a demonstration.", "b. listening to somebody explaining it and asking questions.", "c. diagrams and charts - visual clues.", "d. written instructions – e.g. a manual or textbook."],
    ["a. gave you a web address or something to read about it.", "b. used a plastic model of a knee to show what was wrong.", "c. described what was wrong.", "d. showed you a diagram of what was wrong."],
    ["a. read the written instructions that came with the programme.", "b. talk with people who know about the programme.", "c. use the controls or keyboard.", "d. follow the diagrams in the book that came with it."],
    ["a. things I can click on, shift or try.", "b. interesting design and visual features.", "c. interesting written descriptions, lists and explanations.", "d. audio channels where I can hear music, radio programmes or interviews."],
    ["a. The way it looks is appealing.", "b. Quickly reading parts of it.", "c. A friend talks about it and recommends it.", "d. It has real-life stories, experiences and examples."],
    ["a. a chance to ask questions and talk about the camera and its features.", "b. clear written instructions with lists and bullet points about what to do.", "c. diagrams showing the camera and what each part does.", "d. many examples of good and poor photos and how to improve them."],
    ["a. demonstrations, models or practical sessions.", "b. question and answer, talk, group discussion, or guest speakers.", "c. handouts, books, or readings.", "d. diagrams, charts or graphs."],
    ["a. using examples from what you have done.", "b. using a written description of your results.", "c. from somebody who talks it through with you.", "d. using graphs showing what you had achieved."],
    ["a. choose something that you have had there before.", "b. listen to the waiter or ask friends to recommend choices.", "c. choose from the descriptions in the menu.", "d. look at what others are eating or look at pictures of each dish."],
    ["a. make diagrams or get graphs to help explain things.", "b. write a few key words and practice saying your speech over and over.", "c. write out your speech and learn from reading it over several times.", "d. gather many examples and stories to make the talk real and practical."]
];
// 对应每个问题的评分规则
const scoring = [
    { a: 'K', b: 'A', c: 'R', d: 'V' },
    { a: 'V', b: 'A', c: 'R', d: 'K' },
    { a: 'K', b: 'V', c: 'R', d: 'A' },
    { a: 'K', b: 'A', c: 'V', d: 'R' },
    { a: 'A', b: 'V', c: 'K', d: 'R' },
    { a: 'K', b: 'R', c: 'V', d: 'A' },
    { a: 'K', b: 'A', c: 'V', d: 'R' },
    { a: 'R', b: 'K', c: 'A', d: 'V' },
    { a: 'R', b: 'A', c: 'K', d: 'V' },
    { a: 'K', b: 'V', c: 'R', d: 'A' },
    { a: 'V', b: 'R', c: 'A', d: 'K' },
    { a: 'A', b: 'R', c: 'V', d: 'K' },
    { a: 'K', b: 'A', c: 'R', d: 'V' },
    { a: 'K', b: 'R', c: 'A', d: 'V' },
    { a: 'K', b: 'A', c: 'R', d: 'V' },
    { a: 'V', b: 'A', c: 'R', d: 'K' }
];

function LearningStyleQuiz({onFinish}) {
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
            onFinish();
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
                <p>Visual: {scores.visual_weight}</p>
                <p>Aural: {scores.auditory_weight}</p>
                <p>Kinaesthetic: {scores.kinesthetic_weight}</p>
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