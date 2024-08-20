import React, { useState } from 'react';
import axios from 'axios';

function Feedback() {
    const [feedback, setFeedback] = useState({
        approval: null,
    });

    const handleFeedbackChange = (e) => {
        const { name, value } = e.target;
        setFeedback({
            ...feedback,
            [name]: value
        });
    };

    const handleSubmitFeedback = async () => {
        await axios.post('http://localhost:5000/feedback', {
            feedback: feedback
        });
        alert('Feedback submitted!');
    };

    return (
        <div>
            <h2>Feedback</h2>
            <div>
                <label>
                    Do you approve the response?
                    <select name="approval" onChange={handleFeedbackChange}>
                        <option value="approve">Approve</option>
                        <option value="disapprove">Disapprove</option>
                    </select>
                </label>
            </div>
            <button onClick={handleSubmitFeedback}>Submit</button>
        </div>
    );
}

export default Feedback;

