import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import { Link } from 'react-router-dom';

const questions = [
    "You are helping someone who wants to go to your airport, town centre or railway station. You would:",
    "You are not sure whether a word should be spelled 'dependent' or 'dependant'. You would:",
    "You are planning a holiday for a group. You want some feedback from them about the plan. You would:",
    "You are going to cook something as a special treat for your family. You would:",
    "A group of tourists want to learn about the parks or nature reserves in your area. You would:",
    "You are about to purchase a digital camera or mobile phone. Other than price, what would most influence your decision?",
    "Remember a time when you learned how to do something new. Try to avoid choosing a physical skill, e.g. riding a bike. You learned best by:",
    "You have a problem with your knee. You would prefer that the doctor:",
    "You want to learn a new programme, skill or game on a computer. You would:",
    "I like websites that have:",
    "Other than price, what would most influence your decision to buy a new non-fiction book?",
    "You are using a book, DVD or website to learn how to take photos with your new digital camera. You would like to have:",
    "Do you prefer a trainer or a presenter who uses:",
    "You have finished a competition or test and would like some feedback. You would like to have feedback:",
    "You are going to choose food at a restaurant or cafe. You would:",
    "You have to make an important speech at a conference or special occasion. You would:"
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

function LearningStyleQuiz({ onFinish }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [scores, setScores] = useState(null);
    const username = localStorage.getItem('username');
    if (!username) {
        console.error('No username found in localStorage');
        alert('Please log in before submitting the quiz');
        return;
    }

    const handleAnswerChange = (value) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value;
        setAnswers(newAnswers);
    };

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
                answers: answers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            onFinish();
            const response = await axios.get(`http://localhost:8000/api/learning_style/${username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response.data:', response.data);
            // Set the latest learning style score to the status
            setScores(response.data);

            alert('Learning style saved and updated!');

        } catch (error) {
            console.error('Error saving or fetching learning style:', error);
            // alert('Failed to save or fetch learning style');
        }
    };


    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    // Displays instructions based on learning style scores
    const renderLearningStyleDescription = () => {
        if (!scores) return null;

        const descriptions = [];
        if (scores.visual_score >= 3) {
            descriptions.push("You're better at learning visually...");
        }
        if (scores.aural_score >= 3) {
            descriptions.push("You're better at learning through speech...");
        }
        if (scores.read_write_score >= 3) {
            descriptions.push("You're better at learning by reading/writing...");
        }
        if (scores.kinaesthetic_score >= 3) {
            descriptions.push("You're better at kinesthetic learning...");
        }

        return (
            <div>
                <h3>Your Learning style:</h3>
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
            <h2>Learning style questionnaire</h2>
            <ProgressBar current={currentQuestion + 1} total={questions.length} />

            {scores ? (
                renderLearningStyleDescription()
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

            <Link to="/">Homepage</Link>
        </div>
    );
}

export default LearningStyleQuiz;