import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Helper: Firebase Configuration ---
// These variables are expected to be provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Helper: Math Content based on Curriculum Analysis ---
// A sample of questions based on the provided Realschule curriculum.
const mathTopics = {
  ALGEBRA: "Algebra",
  QUADRATIC_FUNCTIONS: "Quadratic Functions",
  GEOMETRY_PYTHAGORAS: "Geometry (Pythagoras)",
  GEOMETRY_SOLIDS: "Solid Geometry",
  PROBABILITY: "Probability",
};

const questionBank = [
    { topic: mathTopics.QUADRATIC_FUNCTIONS, text: "Find the vertex (Scheitelpunkt) of the parabola given by the equation y = 2(x - 3)² + 5.", answer: "S(3|5)" },
    { topic: mathTopics.QUADRATIC_FUNCTIONS, text: "Solve the quadratic equation x² - 5x + 6 = 0 using the p-q-formula.", answer: "x1=2, x2=3" },
    { topic: mathTopics.ALGEBRA, text: "Simplify the following term using the binomial formulas: (2a + 4b)²", answer: "4a² + 16ab + 16b²" },
    { topic: mathTopics.GEOMETRY_PYTHAGORAS, text: "In a right-angled triangle, the two shorter sides are a = 6 cm and b = 8 cm. What is the length of the hypotenuse c?", answer: 10 },
    { topic: mathTopics.GEOMETRY_SOLIDS, text: "A cylinder has a radius of 4 cm and a height of 10 cm. Calculate its volume. Use π ≈ 3.14.", answer: 502.4 },
    { topic: mathTopics.PROBABILITY, text: "A bag contains 5 red balls and 3 blue balls. You draw one ball without looking. What is the probability of drawing a red ball?", answer: "5/8" },
];

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [view, setView] = useState('loading'); // loading, dashboard, newChallenge, dailyExercise
    const [firebase, setFirebase] = useState(null);
    const [user, setUser] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            setFirebase({ app, auth, db });

            onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    // If no user, sign in. Prefer custom token if available.
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
            });
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setView('error');
        }
    }, []);

    // --- Data Fetching: Load User's Challenge ---
    const fetchChallenge = useCallback(async () => {
        if (!firebase || !user) return;
        setIsLoading(true);
        const challengeRef = doc(firebase.db, `artifacts/${appId}/users/${user.uid}/challenge/current`);
        try {
            const docSnap = await getDoc(challengeRef);
            if (docSnap.exists()) {
                const challengeData = docSnap.data();
                // Check if today's exercise has been done
                const today = new Date().toISOString().split('T')[0];
                const lastCompleted = challengeData.lastCompletedDate;
                const dailyExerciseDone = lastCompleted === today;
                
                setChallenge({ ...challengeData, id: docSnap.id, dailyExerciseDone });
                setView('dashboard');
            } else {
                setChallenge(null);
                setView('dashboard'); // Go to dashboard to show "start new challenge"
            }
        } catch (error) {
            console.error("Error fetching challenge:", error);
            setView('error');
        } finally {
            setIsLoading(false);
        }
    }, [firebase, user]);

    useEffect(() => {
        if (firebase && user) {
            fetchChallenge();
        }
    }, [firebase, user, fetchChallenge]);

    // --- View Renderer ---
    const renderView = () => {
        if (isLoading || view === 'loading') {
            return <LoadingScreen />;
        }
        if (view === 'error') {
            return <ErrorScreen />;
        }

        switch (view) {
            case 'dashboard':
                return <Dashboard challenge={challenge} setView={setView} />;
            case 'newChallenge':
                return <NewChallengeSetup user={user} firebase={firebase} setView={setView} fetchChallenge={fetchChallenge} />;
            case 'dailyExercise':
                return <DailyExercise user={user} firebase={firebase} challenge={challenge} fetchChallenge={fetchChallenge} />;
            default:
                return <Dashboard challenge={challenge} setView={setView} />;
        }
    };

    return (
        <div className="bg-blue-50 min-h-screen font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                {renderView()}
            </div>
        </div>
    );
}

// --- UI Components ---

function LoadingScreen() {
    return (
        <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-blue-600">Loading Your Math Challenge...</h2>
            <p className="text-gray-500 mt-2">Getting everything ready!</p>
        </div>
    );
}

function ErrorScreen() {
    return (
        <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
            <p className="text-gray-600 mt-2">Could not connect to the application services. Please refresh the page to try again.</p>
        </div>
    );
}

function Dashboard({ challenge, setView }) {
    if (!challenge) {
        return (
            <div className="text-center p-4">
                <h1 className="text-3xl font-bold text-gray-800">Welcome!</h1>
                <p className="text-gray-500 mt-2 mb-6">Start a new daily challenge to begin your training.</p>
                <button
                    onClick={() => setView('newChallenge')}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    Start New Challenge
                </button>
            </div>
        );
    }

    const { totalDays, completedDays, score, dailyExerciseDone } = challenge;
    const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    const maxPoints = totalDays * 6;
    const scorePercentage = maxPoints > 0 ? (score / maxPoints) * 100 : 0;

    const getMedal = () => {
        if (scorePercentage >= 80) return { name: 'Gold', color: 'text-yellow-500', icon: '🥇' };
        if (scorePercentage >= 65) return { name: 'Silver', color: 'text-gray-400', icon: '🥈' };
        if (scorePercentage >= 50) return { name: 'Bronze', color: 'text-orange-400', icon: '🥉' };
        return { name: 'No Medal Yet', color: 'text-gray-500', icon: '🌱' };
    };
    const medal = getMedal();

    return (
        <div>
            <h1 className="text-3xl font-bold text-center text-gray-800">Your Progress</h1>
            <p className="text-center text-gray-500 mb-6">{totalDays}-Day Challenge</p>

            {/* Progress Bar */}
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-blue-700">Day {completedDays} of {totalDays}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-bold text-gray-500">SCORE</div>
                    <div className="text-3xl font-bold text-green-500">{score}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-bold text-gray-500">MEDAL</div>
                    <div className={`text-3xl font-bold ${medal.color}`}>{medal.icon} {medal.name}</div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
                {dailyExerciseDone ? (
                    <div className="text-center bg-green-100 text-green-800 font-semibold p-4 rounded-lg">
                        Great job! You've completed your exercise for today. Come back tomorrow!
                    </div>
                ) : (
                    <button
                        onClick={() => setView('dailyExercise')}
                        className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 text-lg"
                    >
                        Start Today's Exercise
                    </button>
                )}
            </div>
        </div>
    );
}

function NewChallengeSetup({ user, firebase, setView, fetchChallenge }) {
    const [duration, setDuration] = useState(7);
    const [isCreating, setIsCreating] = useState(false);

    const handleStartChallenge = async () => {
        if (!user || !firebase) return;
        setIsCreating(true);
        const challengeData = {
            userId: user.uid,
            totalDays: duration,
            completedDays: 0,
            score: 0,
            startDate: serverTimestamp(),
            lastCompletedDate: null,
            knowledgeGaps: [], // To be used later for adaptive learning
        };
        try {
            const challengeRef = doc(firebase.db, `artifacts/${appId}/users/${user.uid}/challenge/current`);
            await setDoc(challengeRef, challengeData);
            await fetchChallenge(); // Re-fetch data to update UI
            setView('dashboard');
        } catch (error) {
            console.error("Error creating challenge:", error);
            setIsCreating(false);
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Set Your Goal</h2>
            <p className="text-gray-600 mb-6">Choose the length of your daily challenge. Consistency is key!</p>
            
            <div className="flex justify-center space-x-3 mb-8">
                {[7, 14, 30].map(d => (
                    <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition ${duration === d ? 'bg-blue-600 text-white ring-4 ring-blue-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {d} Days
                    </button>
                ))}
            </div>

            <button
                onClick={handleStartChallenge}
                disabled={isCreating}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
                {isCreating ? "Setting up..." : `Start ${duration}-Day Challenge`}
            </button>
             <button
                onClick={() => setView('dashboard')}
                className="mt-4 text-gray-500 hover:text-gray-700"
            >
                Back to Dashboard
            </button>
        </div>
    );
}

function DailyExercise({ user, firebase, challenge, fetchChallenge }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // For now, pick a random question. Later, this will be adaptive.
        const randomIndex = Math.floor(Math.random() * questionBank.length);
        setCurrentQuestion(questionBank[randomIndex]);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleSubmitImage = async () => {
        if (!imageFile) return;
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const base64ImageData = await fileToBase64(imageFile);

            const prompt = `You are an expert math teacher for 10th-grade German Realschule students. The student was asked to solve the following problem: '${currentQuestion.text}'. The student has provided their handwritten solution in the attached image. Please analyze it carefully. Your task is to respond in a JSON format with the following structure: {"isCorrect": boolean, "feedback": "string", "correctAnswer": "string"}. In your feedback, be encouraging. If wrong, gently point out where the mistake might be without giving the answer. If correct, praise their work.`;
            
            const payload = {
                contents: [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: base64ImageData } }
                    ]
                }],
                generationConfig: { responseMimeType: "application/json" }
            };
            
            const apiKey = ""; // Will be populated by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();

            // Robust check for AI response structure
            if (!result.candidates || result.candidates.length === 0) {
                 if (result.promptFeedback && result.promptFeedback.blockReason) {
                    throw new Error(`AI response blocked due to: ${result.promptFeedback.blockReason}`);
                 }
                throw new Error("Invalid AI response: 'candidates' array is missing or empty.");
            }
            
            const candidate = result.candidates[0];
            if (candidate.finishReason !== 'STOP') {
                 throw new Error(`AI response generation stopped for reason: ${candidate.finishReason}`);
            }

            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error("Invalid AI response: 'parts' array is missing or empty.");
            }

            const aiResponseText = candidate.content.parts[0].text;
            if (!aiResponseText || aiResponseText.trim() === '') {
                throw new Error("AI returned an empty text response.");
            }
            
            const parsedResponse = JSON.parse(aiResponseText);
            setFeedback({ text: parsedResponse.feedback, isCorrect: parsedResponse.isCorrect });
            await updateScore(parsedResponse.isCorrect);

        } catch (error) {
            console.error("Error with AI analysis:", error.message, error);
            let userMessage = "Sorry, I couldn't analyze the image. Please try again.";
            if (error.message.includes("blocked")) {
                userMessage = "The analysis was blocked. This can happen with unclear images. Please try taking a clearer picture."
            } else if (error.message.includes("stopped")) {
                 userMessage = "The AI couldn't finish its analysis. This might be a temporary issue. Please try again."
            }
            setFeedback({ text: userMessage, isCorrect: false });
            setIsSubmitting(false);
        }
    };

    const updateScore = async (isCorrect) => {
        const points = isCorrect ? 6 : 4;
        const challengeRef = doc(firebase.db, `artifacts/${appId}/users/${user.uid}/challenge/current`);
        await updateDoc(challengeRef, {
            score: challenge.score + points,
            completedDays: challenge.completedDays + 1,
            lastCompletedDate: new Date().toISOString().split('T')[0]
        });
        // No need to set isSubmitting to false here, as the view will change.
    };

    if (!currentQuestion) return <LoadingScreen />;
    if (feedback) {
        return (
            <div className="text-center p-4">
                <h2 className={`text-2xl font-bold mb-4 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {feedback.isCorrect ? "Excellent Work!" : "Good Effort!"}
                </h2>
                <p className="text-gray-700 text-lg mb-6">{feedback.text}</p>
                <button
                    onClick={fetchChallenge}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-center text-gray-500">Day {challenge.completedDays + 1} Exercise</h2>
            <div className="bg-blue-100 border-2 border-blue-200 rounded-xl p-6 my-4 text-center">
                <p className="text-sm font-bold text-blue-700">{currentQuestion.topic}</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{currentQuestion.text}</p>
            </div>
            
            {isSubmitting ? (
                 <div className="text-center p-4">
                    <p className="text-lg font-semibold text-blue-600">AI is analyzing your solution...</p>
                    <p className="text-gray-500">This might take a moment.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="text-center">
                         <label htmlFor="image-upload" className="cursor-pointer w-full inline-block bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-800 transition">
                            📷 Upload Handwritten Solution
                        </label>
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>

                    {imagePreview && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                             <img src={imagePreview} alt="Solution preview" className="rounded-lg max-h-60 w-auto mx-auto"/>
                        </div>
                    )}
                   
                    <button
                        onClick={handleSubmitImage}
                        disabled={!imageFile}
                        className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Submit for AI Feedback
                    </button>
                </div>
            )}
        </div>
    );
}
