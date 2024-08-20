import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import LearningStyleQuiz from './components/LearningStyleQuiz';
import Feedback from './components/Feedback';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/">Chatbot</Link>
          <Link to="/questionnaire" className="questionnaire-link">Start Questionnaire</Link>
        </header>
        <main>
          <Route path="/" exact component={Chatbot} />
          <Route path="/LearningStyleQuiz" component={LearningStyleQuiz} />
        </main>
      </div>
    </Router>
  );
}

export default App;
