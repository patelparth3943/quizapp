/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react';

function QuizApp() {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [answerStatus, setAnswerStatus] = useState({});
    const [score, setScore] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('http://localhost:3000/quiz');
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || 'Failed to load quizzes');
            }

            setQuizzes(json);
            console.log('Quizzes loaded:', json);
        } catch (error) {
            console.error('Load quizzes error:', error.message);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleQuizSelection = (quizId) => {
        const quiz = quizzes.find(q => q.id === quizId);
        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setAnswerStatus({});
        setScore(null);
        setQuizCompleted(false);
        setValidationMessage('');
    };

    const handleAnswerSelection = (questionId, answer) => {
        if (answerStatus[questionId]) {
            return;
        }

        const selectedLetter = answer.split('.')[0];
        const isCorrect = selectedLetter === selectedQuiz.questions[currentQuestionIndex].answer;

        setAnswerStatus(prevStatus => ({
            ...prevStatus,
            [questionId]: isCorrect ? 'correct' : 'incorrect'
        }));

        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: answer
        }));

        if (isCorrect) {
            setScore(prevScore => (prevScore !== null ? prevScore + 1 : 1));
        }

        setValidationMessage('');
    };

    const handleNextQuestion = () => {
        if (!selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id]) {
            setValidationMessage('Please select  atleast one answer. ');
            return;
        }
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setValidationMessage('');
    };

    const handleSubmitQuiz = () => {
        if (!selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id]) {
            setValidationMessage('Please select  atleast one answer.');
            return;
        }
        setQuizCompleted(true);
        setValidationMessage('');
    };
    const calculateProgress = () => {
        const totalQuestions = selectedQuiz.questions.length;
        const correctAnswers = Object.values(answerStatus).filter(status => status === 'correct').length;
        return (correctAnswers / totalQuestions) * 100;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white p-4 md:p-10 lg:p-20">
            {selectedQuiz === null ? (
                <div className="flex flex-col md:flex-row md:gap-20">
                    <div className='flex flex-col text-center md:text-left'>
                        <h1 className="text-3xl md:text-6xl font-bold mb-5">Welcome to the <br />
                            <span className="text-3xl md:text-6xl font-bold mb-5">Frontend Quiz!</span></h1>
                        <p className="text-xl">Pick a subject to get started.</p>
                    </div>
                    <div className='flex flex-col gap-2 mt-5 md:mt-0'>
                        {quizzes.map(quiz => (
                            <button
                                key={quiz.id}
                                onClick={() => handleQuizSelection(quiz.id)}
                                className="py-3 px-10 md:py-5 md:px-20 font-bold bg-gray-700 rounded-md text-left hover:bg-gray-600 transition"
                            >
                                {quiz.title}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className=" w-full max-w-4xl">
                    {quizCompleted ? (
                        <div className="text-center flex flex-col gap-10">
                            <div>
                                <h2 className="text-2xl md:text-4xl">Quiz completed</h2>
                                <p className="text-lg md:text-4xl">You scored {score} out of {selectedQuiz.questions.length}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => setSelectedQuiz(null)}
                                    className="min-w-full font-bold md:min-w-80 max-w-full md:max-w-80 py-2 px-3 md:py-5 md:px-5 rounded-md  md:text-2xl lg:text-2xl text-center bg-gray-700 hover:bg-purple-600 transition"
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 md:items-baseline">
                            <div className="flex flex-col gap-5 pb-12 md:pb-0 w-full md:w-2/3">
                                <h2 className="text-5xl  font-medium hover:scale-95 transition-all">{selectedQuiz.title}</h2>
                                <p className="text-base lg:text-1rem md:text-1.4rem italic duration-1000 transition-all slide-out-from-top-5">{selectedQuiz.description}</p>
                                <p className="mb-3 font-bold text-lg md:text-xl">{selectedQuiz.questions[currentQuestionIndex].text}</p>
                                <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                                        style={{ width: `${calculateProgress()}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-right">{Math.round(calculateProgress())}%</p>
                            </div>

                            <div className="space-y-5">
                                <ul className="space-y-2">
                                    {selectedQuiz.questions[currentQuestionIndex].choices.map((choice, index) => (
                                        <li key={index} className="items-center">
                                            <button
                                                name={`question-${selectedQuiz.questions[currentQuestionIndex].id}`}
                                                value={choice.text}
                                                onClick={() => handleAnswerSelection(selectedQuiz.questions[currentQuestionIndex].id, choice.text)}
                                                disabled={answerStatus[selectedQuiz.questions[currentQuestionIndex].id]}
                                                className={`required min-w-full md:min-w-80 max-w-full md:max-w-80 py-2 px-3 md:py-5 md:px-5 rounded-md text-left md:text-2xl lg:text-2xl transition ${selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id] === choice.text ? (answerStatus[selectedQuiz.questions[currentQuestionIndex].id] === 'correct' ? 'bg-green-600' : 'bg-red-600') : 'bg-gray-700 hover:bg-gray-600'}`}
                                            >
                                                {choice.text}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {validationMessage && (
                                    <p className="text-red-500 text-xl font-bold  inline-block px-5 rounded-xl ">{validationMessage}</p>
                                )}
                                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                                    <button
                                        onClick={handleNextQuestion}
                                        className="min-w-full md:min-w-80 max-w-full md:max-w-80 py-2 px-3 md:py-5 md:px-5 rounded-md  md:text-2xl lg:text-2xl text-center bg-gray-700 hover:bg-purple-600 transition"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        className="min-w-full md:min-w-80 max-w-full md:max-w-80 py-2 px-3 md:py-5 md:px-5 rounded-md  md:text-2xl lg:text-2xl text-center bg-gray-700 hover:bg-purple-600 transition"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizApp;
