import React, { useState, useEffect, useCallback, useRef } from 'react';

// Helper function to get a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Data: Math Problems ---
// Manually parsed from the provided document
const mathProblemsData = [
    {
        topic: "Rationale Zahlen – Addition & Subtraktion (Klasse 7)",
        problems: [
            { question: "Berechne: a) (-7) + 12 = ? b) 15 - (-4) = ? c) (-9) + (-6) = ?", solution: "a) 5, b) 19, c) -15" },
            { question: "Vervollständige die Gleichung: 8 + ? = -3", solution: "-11" },
            { question: "Ein U-Boot befindet sich 25 Meter unter dem Meeresspiegel (-25 m). Es steigt um 10 Meter auf und taucht dann 18 Meter tiefer. Auf welcher Tiefe befindet es sich nun?", solution: "-33 Meter" },
        ],
    },
    {
        topic: "Terme – Vereinfachen & Werte berechnen (Klasse 7)",
        problems: [
            { question: "Vereinfache den Term: 3x + 5y - x + 2y", solution: "2x + 7y" },
            { question: "Berechne den Wert des Terms 2a - 3b für a = 4 und b = -2.", solution: "14" },
            { question: "Löse die Klammer auf und vereinfache: 7 - (2x - 3) + 4x", solution: "10 + 2x" },
        ],
    },
    {
        topic: "Prozentrechnung – Grundaufgaben (Klasse 7/8)",
        problems: [
            { question: "Wie viel sind 15% von 200 €?", solution: "30 €" },
            { question: "Ein Pullover kostet nach 20% Rabatt noch 48 €. Wie hoch war der ursprüngliche Preis?", solution: "60 €" },
            { question: "Von 25 Schülern einer Klasse sind 18 Mädchen. Wie viel Prozent der Schüler sind Mädchen?", solution: "72%" },
        ],
    },
    {
        topic: "Lineare Gleichungen – Lösen (Klasse 7/8)",
        problems: [
            { question: "Löse nach x auf: 3x + 7 = 22", solution: "x = 5" },
            { question: "Löse nach y auf: 5y - 12 = 2y + 6", solution: "y = 6" },
            { question: "Löse nach z auf: 2(z + 4) = 18", solution: "z = 5" },
        ],
    },
    {
        topic: "Lineare Funktionen – Grundlagen (Klasse 8)",
        problems: [
            { question: "Gegeben ist die Funktion y = 2x - 1. Erstelle eine Wertetabelle für x = -2, -1, 0, 1, 2.", solution: "x=-2,y=-5; x=-1,y=-3; x=0,y=-1; x=1,y=1; x=2,y=3" },
            { question: "Ist der Punkt P(3|5) ein Punkt der Funktion y = 2x - 1? Begründe.", solution: "Ja, denn 5 = 2(3) - 1." },
        ],
    },
    {
        topic: "Zinsrechnung (Klasse 8)",
        problems: [
            { question: "Wie viel Zinsen erhält man für 1500 € bei einem Zinssatz von 2% pro Jahr nach einem Jahr?", solution: "30 €" },
            { question: "Ein Kapital von 800 € bringt nach einem Jahr 24 € Zinsen. Wie hoch ist der Zinssatz?", solution: "3%" },
            { question: "Wie viel Kapital muss man zu 3% anlegen, um nach einem Jahr 90 € Zinsen zu erhalten?", solution: "3000 €" },
        ],
    },
    {
        topic: "Lineare Gleichungssysteme – Gleichsetzungsverfahren (Klasse 8)",
        problems: [
            { question: "Löse das LGS: I) y = 2x + 1; II) y = -x + 4", solution: "x = 1, y = 3" },
            { question: "Löse das LGS: I) 3x - y = 5; II) y = x + 1", solution: "x = 3, y = 4" },
        ],
    },
];


// --- Components ---

const ChallengeSetup = ({ onStartChallenge }) => {
    const [days, setDays] = useState(7);
    const [duration, setDuration] = useState(15);

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Mathe-Challenge</h1>
            <p className="text-gray-600">Stelle dich der Herausforderung und werde jeden Tag besser!</p>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="days" className="block text-lg font-medium text-gray-700">Dauer der Challenge: <span className="font-bold text-indigo-600">{days} Tage</span></label>
                    <input
                        id="days"
                        type="range"
                        min="7"
                        max="30"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-lg font-medium text-gray-700">Tägliche Übungszeit: <span className="font-bold text-indigo-600">{duration} Minuten</span></label>
                    <input
                        id="duration"
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>

            <button
                onClick={() => onStartChallenge(parseInt(days), parseInt(duration))}
                className="w-full px-6 py-3 mt-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
            >
                Challenge starten!
            </button>
        </div>
    );
};

const DailyExercise = ({ challenge, onComplete, onBackToProgress }) => {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const fileInputRef = useRef(null);
    const { dailyProblem } = challenge;

    const handleSubmit = () => {
        const isCorrect = answer.toLowerCase().trim() === dailyProblem.solution.toLowerCase().trim();
        const points = isCorrect ? 6 : 4;
        setFeedback({
            isCorrect,
            message: isCorrect ? 'Super! Richtig gelöst!' : 'Das war leider nicht ganz richtig. Aber gut gekämpft!',
        });
        setTimeout(() => {
            onComplete(points, answer);
            setFeedback(null);
        }, 3000);
    };
    
    const handleShareProblem = () => {
        const text = `Kannst du mir bei dieser Mathe-Aufgabe helfen?\n\nThema: ${dailyProblem.topic}\nAufgabe: ${dailyProblem.question}`;
        const mailtoLink = `mailto:?subject=Mathe-Hilfe&body=${encodeURIComponent(text)}`;
        const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

        // Simple modal to choose sharing option
        const shareModal = document.createElement('div');
        shareModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
        shareModal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.25rem; color: #333;">Teilen über...</h3>
                <a href="${mailtoLink}" target="_blank" style="display: inline-block; margin: 0.5rem; padding: 0.75rem 1.5rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; text-decoration: none;">E-Mail</a>
                <a href="${whatsappLink}" target="_blank" style="display: inline-block; margin: 0.5rem; padding: 0.75rem 1.5rem; background-color: #25D366; color: white; border-radius: 0.5rem; text-decoration: none;">WhatsApp</a>
                <button id="closeShareModal" style="display: block; margin: 1.5rem auto 0; padding: 0.5rem 1rem; background: #ccc; border: none; border-radius: 0.5rem;">Schließen</button>
            </div>
        `;
        document.body.appendChild(shareModal);
        document.getElementById('closeShareModal').onclick = () => document.body.removeChild(shareModal);
        shareModal.onclick = (e) => { if (e.target === shareModal) document.body.removeChild(shareModal); };
    };

    const handlePhotoSubmitClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Meine Mathe-Lösung',
                    text: `Hier ist meine Lösung für die Aufgabe: ${dailyProblem.question}`,
                });
                // Award points for submitting the photo
                onComplete(4, "Foto gesendet");
            } else {
                throw new Error("File sharing not supported.");
            }
        } catch (error) {
            console.error("Error sharing photo:", error);
            alert("Dein Browser unterstützt das Teilen von Fotos leider nicht direkt. Bitte speichere das Foto und sende es manuell.");
        }
    };

    return (
        <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-gray-800">Übung für Tag {challenge.currentDay}</h2>
                 <button onClick={onBackToProgress} className="text-sm text-indigo-600 hover:underline">Zur Übersicht</button>
            </div>
           
            <div className="p-6 mb-6 bg-indigo-50 rounded-xl">
                <p className="text-sm font-medium text-indigo-800 mb-2">{dailyProblem.topic}</p>
                <p className="text-lg text-gray-900">{dailyProblem.question}</p>
            </div>

            {feedback ? (
                <div className={`p-4 rounded-lg text-center text-white font-bold ${feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {feedback.message}
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <label htmlFor="answer" className="block text-lg font-medium text-gray-700 mb-2">Deine Antwort (optional):</label>
                        <input
                            id="answer"
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Tippe deine Lösung hier ein"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!answer}
                            className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Antwort prüfen
                        </button>
                         <button
                            onClick={handlePhotoSubmitClick}
                            className="w-full px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                        >
                            Lösung als Foto senden
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelected}
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                        />
                    </div>
                     <div className="mt-4 text-center">
                        <button
                            onClick={handleShareProblem}
                            className="px-6 py-2 text-base font-semibold text-indigo-600 bg-indigo-100 rounded-xl hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                           Frage teilen & Hilfe holen
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ProgressTracker = ({ challenge, onStartNewDay, onReset }) => {
    const maxPoints = challenge.totalDays * 6;
    const userPercentage = maxPoints > 0 ? (challenge.score / maxPoints) * 100 : 0;
    
    let medal = 'Keine Medaille';
    let medalEmoji = '😔';
    let medalColor = 'bg-gray-400';
    if (userPercentage >= 80) {
        medal = 'Gold';
        medalEmoji = '🥇';
        medalColor = 'bg-yellow-400';
    } else if (userPercentage >= 65) {
        medal = 'Silber';
        medalEmoji = '🥈';
        medalColor = 'bg-gray-300';
    } else if (userPercentage >= 50) {
        medal = 'Bronze';
        medalEmoji = '🥉';
        medalColor = 'bg-yellow-600';
    }
    
    const isChallengeOver = challenge.currentDay > challenge.totalDays;
    const canStartNextDay = !challenge.isTodayCompleted && !isChallengeOver;

    return (
        <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Challenge-Übersicht</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
                <div className="p-4 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-indigo-800">Aktueller Tag</p>
                    <p className="text-2xl font-bold text-indigo-900">{Math.min(challenge.currentDay, challenge.totalDays)} / {challenge.totalDays}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-800">Dein Punktestand</p>
                    <p className="text-2xl font-bold text-green-900">{challenge.score} / {maxPoints}</p>
                </div>
                <div className={`p-4 ${medalColor} rounded-xl`}>
                    <p className="text-sm text-black">Deine Medaille</p>
                    <p className="text-2xl font-bold text-black">{medalEmoji} {medal}</p>
                </div>
            </div>

            <div className="text-center mb-8">
                {isChallengeOver ? (
                     <p className="text-xl font-semibold text-green-600">🎉 Herzlichen Glückwunsch! Du hast die Challenge abgeschlossen! 🎉</p>
                ) : (
                    canStartNextDay ? (
                        <button
                            onClick={onStartNewDay}
                            className="px-8 py-4 text-xl font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                        >
                            Heutige Übung starten!
                        </button>
                    ) : (
                        <p className="text-lg font-medium text-gray-600">Du hast die heutige Übung bereits abgeschlossen. Komm morgen wieder! 💪</p>
                    )
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Bisherige Übungen</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {challenge.history.length > 0 ? challenge.history.map(item => (
                        <div key={item.day} className="p-4 bg-gray-100 rounded-lg">
                            <p className="font-bold text-gray-700">Tag {item.day}: {item.points} Punkte</p>
                            <p className="text-sm text-gray-600 mt-1"><strong>Frage:</strong> {item.problem.question}</p>
                            <p className="text-sm text-gray-600"><strong>Deine Antwort:</strong> <span className={item.userAnswer === 'Foto gesendet' ? 'text-blue-700' : (item.points === 6 ? 'text-green-700' : 'text-red-700')}>{item.userAnswer}</span></p>
                            {item.points !== 6 && item.userAnswer !== 'Foto gesendet' && <p className="text-sm text-gray-600"><strong>Richtige Lösung:</strong> <span className="text-blue-700">{item.problem.solution}</span></p>}
                        </div>
                    )) : (
                        <p className="text-gray-500">Noch keine Übungen abgeschlossen.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onReset}
                    className="px-6 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Challenge zurücksetzen
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [challenge, setChallenge] = useState(null);
    const [view, setView] = useState('setup'); // 'setup', 'exercise', 'progress'

    // Load challenge from localStorage on initial render
    useEffect(() => {
        try {
            const savedChallenge = localStorage.getItem('mathChallenge');
            if (savedChallenge) {
                const parsedChallenge = JSON.parse(savedChallenge);
                // Simple check to ensure data is not malformed
                if (parsedChallenge.totalDays && parsedChallenge.currentDay) {
                    setChallenge(parsedChallenge);
                    setView('progress');
                }
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
            localStorage.removeItem('mathChallenge');
        }
    }, []);

    // Save challenge to localStorage whenever it changes
    useEffect(() => {
        if (challenge) {
            try {
                localStorage.setItem('mathChallenge', JSON.stringify(challenge));
            } catch (error) {
                console.error("Failed to save state to localStorage", error);
            }
        }
    }, [challenge]);

    const getNewProblem = useCallback((history) => {
        const usedTopics = history.map(h => h.problem.topic);
        const availableTopics = mathProblemsData.filter(t => !usedTopics.includes(t.topic));
        
        const topicSource = availableTopics.length > 0 ? availableTopics : mathProblemsData;
        const selectedTopic = getRandomElement(topicSource);
        const selectedProblem = getRandomElement(selectedTopic.problems);

        return { ...selectedProblem, topic: selectedTopic.topic };
    }, []);

    const handleStartChallenge = (days, duration) => {
        const newChallenge = {
            totalDays: days,
            duration: duration,
            currentDay: 1,
            score: 0,
            isTodayCompleted: false,
            dailyProblem: getNewProblem([]),
            history: []
        };
        setChallenge(newChallenge);
        setView('exercise');
    };

    const handleCompleteExercise = (points, userAnswer) => {
        setChallenge(prev => {
            const newHistory = [...prev.history, {
                day: prev.currentDay,
                points,
                userAnswer,
                problem: prev.dailyProblem
            }];

            return {
                ...prev,
                score: prev.score + points,
                isTodayCompleted: true,
                history: newHistory
            };
        });
        setView('progress');
    };

    const handleStartNewDay = () => {
        if (challenge.isTodayCompleted) {
             setChallenge(prev => ({
                ...prev,
                currentDay: prev.currentDay + 1,
                isTodayCompleted: false,
                dailyProblem: getNewProblem(prev.history)
            }));
        }
        setView('exercise');
    };
    
    const handleReset = () => {
        localStorage.removeItem('mathChallenge');
        setChallenge(null);
        setView('setup');
    };

    const renderView = () => {
        switch (view) {
            case 'exercise':
                return <DailyExercise challenge={challenge} onComplete={handleCompleteExercise} onBackToProgress={() => setView('progress')} />;
            case 'progress':
                return <ProgressTracker challenge={challenge} onStartNewDay={handleStartNewDay} onReset={handleReset} />;
            case 'setup':
            default:
                return <ChallengeSetup onStartChallenge={handleStartChallenge} />;
        }
    };

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4 font-sans">
            {renderView()}
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>Eine App für meine Tochter. ❤️</p>
                <p>Entwickelt, um das Lernen von Mathematik unterhaltsam zu gestalten.</p>
            </footer>
        </main>
    );
}
