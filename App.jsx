<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mathe-Lern-App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#8B5CF6">
    <link rel="apple-touch-icon" href="images/icons/icon-192x192.png">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .challenge-card {
            transition: transform 0.2s ease-in-out;
        }
        .challenge-card:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-800">

    <div id="app" class="container mx-auto p-4 max-w-lg">

        <!-- Initial Screen: Challenge Selection -->
        <div id="challenge-selection" class="text-center">
            <h1 class="text-4xl font-bold text-purple-600 mb-4">Mathe-Challenge</h1>
            <p class="text-lg mb-8">Wähle deine Herausforderung!</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onclick="startChallenge(7)" class="challenge-card bg-white p-6 rounded-lg shadow-md cursor-pointer">
                    <h2 class="text-2xl font-bold mb-2">7 Tage</h2>
                    <p>Eine Woche voller Mathe-Spaß!</p>
                </div>
                <div onclick="startChallenge(14)" class="challenge-card bg-white p-6 rounded-lg shadow-md cursor-pointer">
                    <h2 class="text-2xl font-bold mb-2">14 Tage</h2>
                    <p>Zwei Wochen, um deine Fähigkeiten zu testen.</p>
                </div>
                <div onclick="startChallenge(21)" class="challenge-card bg-white p-6 rounded-lg shadow-md cursor-pointer">
                    <h2 class="text-2xl font-bold mb-2">21 Tage</h2>
                    <p>Drei Wochen für echte Mathe-Champions.</p>
                </div>
                <div onclick="startChallenge(30)" class="challenge-card bg-white p-6 rounded-lg shadow-md cursor-pointer">
                    <h2 class="text-2xl font-bold mb-2">30 Tage</h2>
                    <p>Ein ganzer Monat voller Herausforderungen!</p>
                </div>
            </div>
        </div>

        <!-- Exercise Screen -->
        <div id="exercise-screen" class="hidden">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold text-purple-600">Tägliche Aufgabe</h1>
                <div id="stats" class="text-right">
                    <p>Tag: <span id="current-day"></span>/<span id="total-days"></span></p>
                    <p>Punkte: <span id="current-score"></span></p>
                </div>
            </div>
            <div class="bg-white p-8 rounded-lg shadow-md">
                <p class="text-gray-600 mb-2" id="problem-topic"></p>
                <p class="text-2xl mb-6" id="problem-text"></p>
                <input type="text" id="answer-input" class="w-full p-3 border rounded-lg mb-4" placeholder="Deine Antwort...">
                <button onclick="submitAnswer()" class="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">Antwort abgeben</button>
                 <button onclick="showSolution()" class="w-full bg-gray-400 text-white p-3 rounded-lg hover:bg-gray-500 mt-2">Lösung anzeigen</button>
            </div>
             <div id="feedback" class="mt-4 p-4 rounded-lg hidden"></div>
        </div>

        <!-- End Screen -->
        <div id="end-screen" class="hidden text-center">
            <h1 class="text-4xl font-bold text-purple-600 mb-4">Challenge beendet!</h1>
            <div id="medal" class="text-6xl mb-4"></div>
            <p class="text-lg mb-2">Deine Punktzahl: <span id="final-score"></span></p>
            <p class="text-lg mb-8">Du hast <span id="medal-name"></span> erreicht!</p>
            <button onclick="restartApp()" class="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">Neue Challenge starten</button>
        </div>
    </div>

    <script>
        const problems = [
            { topic: "Rationale Zahlen – Addition & Subtraktion", question: "Berechne: (-7) + 12 = ?", solution: "5" },
            { topic: "Rationale Zahlen – Addition & Subtraktion", question: "Berechne: 15 - (-4) = ?", solution: "19" },
            { topic: "Rationale Zahlen – Addition & Subtraktion", question: "Berechne: (-9) + (-6) = ?", solution: "-15" },
            { topic: "Terme – Vereinfachen & Werte berechnen", question: "Vereinfache den Term: 3x + 5y - x + 2y", solution: "2x + 7y" },
            { topic: "Terme – Vereinfachen & Werte berechnen", question: "Berechne den Wert des Terms 2a - 3b für a = 4 und b = -2.", solution: "14" },
            { topic: "Prozentrechnung – Grundaufgaben", question: "Wie viel sind 15% von 200 €?", solution: "30" },
            { topic: "Lineare Gleichungen – Lösen", question: "Löse nach x auf: 3x + 7 = 22", solution: "5" },
            { topic: "Lineare Funktionen – Grundlagen", question: "Ist der Punkt P(3|5) ein Punkt der Funktion y = 2x - 1? (Ja/Nein)", solution: "Ja" },
            { topic: "Zinsrechnung", question: "Wie viel Zinsen erhält man für 1500 € bei einem Zinssatz von 2% pro Jahr nach einem Jahr?", solution: "30" },
        ];

        let appState = {
            challengeDuration: 0,
            currentDay: 0,
            score: 0,
            usedProblems: [],
            currentProblem: null,
            lastExerciseDate: null,
        };

        function saveState() {
            localStorage.setItem('mathAppState', JSON.stringify(appState));
        }

        function loadState() {
            const savedState = localStorage.getItem('mathAppState');
            if (savedState) {
                appState = JSON.parse(savedState);
            }
        }

        function isNewDay() {
            const today = new Date().toDateString();
            return appState.lastExerciseDate !== today;
        }

        function startChallenge(days) {
            appState.challengeDuration = days;
            appState.currentDay = 1;
            appState.score = 0;
            appState.usedProblems = [];
            appState.lastExerciseDate = null;
            saveState();
            showExerciseScreen();
        }

        function showExerciseScreen() {
            if (appState.currentDay > appState.challengeDuration) {
                showEndScreen();
                return;
            }

            document.getElementById('challenge-selection').classList.add('hidden');
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('exercise-screen').classList.remove('hidden');
            
            document.getElementById('current-day').innerText = appState.currentDay;
            document.getElementById('total-days').innerText = appState.challengeDuration;
            document.getElementById('current-score').innerText = appState.score;

            if (isNewDay()) {
                let availableProblems = problems.filter((p, index) => !appState.usedProblems.includes(index));
                if (availableProblems.length === 0) {
                    appState.usedProblems = [];
                    availableProblems = problems;
                }
                const randomIndex = Math.floor(Math.random() * availableProblems.length);
                const problemIndex = problems.indexOf(availableProblems[randomIndex]);
                
                appState.currentProblem = { ...problems[problemIndex], index: problemIndex };
                appState.usedProblems.push(problemIndex);
                
                document.getElementById('problem-topic').innerText = appState.currentProblem.topic;
                document.getElementById('problem-text').innerText = appState.currentProblem.question;
                document.getElementById('answer-input').value = '';
                document.getElementById('answer-input').disabled = false;
                document.querySelector('#exercise-screen button').disabled = false;
                document.getElementById('feedback').classList.add('hidden');
            } else {
                 document.getElementById('problem-topic').innerText = "Bereits erledigt";
                 document.getElementById('problem-text').innerText = "Du hast deine heutige Aufgabe bereits erledigt. Komm morgen wieder!";
                 document.getElementById('answer-input').disabled = true;
                 document.querySelector('#exercise-screen button').disabled = true;
            }
        }

        function submitAnswer() {
            const userAnswer = document.getElementById('answer-input').value.trim();
            const feedbackEl = document.getElementById('feedback');
            
            if (!userAnswer) {
                feedbackEl.innerText = "Bitte gib eine Antwort ein.";
                feedbackEl.className = 'mt-4 p-4 rounded-lg bg-yellow-200 text-yellow-800';
                feedbackEl.classList.remove('hidden');
                return;
            }

            const isCorrect = userAnswer.toLowerCase() === appState.currentProblem.solution.toLowerCase();

            if (isCorrect) {
                appState.score += 6;
                feedbackEl.innerText = "Richtig! Super gemacht!";
                feedbackEl.className = 'mt-4 p-4 rounded-lg bg-green-200 text-green-800';
            } else {
                appState.score += 4;
                feedbackEl.innerText = "Nicht ganz richtig, aber gut versucht!";
                feedbackEl.className = 'mt-4 p-4 rounded-lg bg-red-200 text-red-800';
            }
            feedbackEl.classList.remove('hidden');

            appState.lastExerciseDate = new Date().toDateString();
            appState.currentDay += 1;
            saveState();

            document.getElementById('answer-input').disabled = true;
            document.querySelector('#exercise-screen button').disabled = true;

            setTimeout(() => {
                showExerciseScreen();
            }, 2000);
        }
        
        function showSolution() {
            const feedbackEl = document.getElementById('feedback');
            feedbackEl.innerText = `Die richtige Antwort ist: ${appState.currentProblem.solution}`;
            feedbackEl.className = 'mt-4 p-4 rounded-lg bg-blue-200 text-blue-800';
            feedbackEl.classList.remove('hidden');
        }

        function showEndScreen() {
            document.getElementById('exercise-screen').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('hidden');

            const maxPoints = appState.challengeDuration * 6;
            const percentage = (appState.score / maxPoints) * 100;
            let medal = '🥉';
            let medalName = 'Bronze';

            if (percentage >= 80) {
                medal = '🥇';
                medalName = 'Gold';
            } else if (percentage >= 65) {
                medal = '🥈';
                medalName = 'Silber';
            }

            document.getElementById('medal').innerText = medal;
            document.getElementById('final-score').innerText = appState.score;
            document.getElementById('medal-name').innerText = medalName;
        }

        function restartApp() {
            localStorage.removeItem('mathAppState');
            appState = {
                challengeDuration: 0,
                currentDay: 0,
                score: 0,
                usedProblems: [],
                currentProblem: null,
                lastExerciseDate: null,
            };
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('challenge-selection').classList.remove('hidden');
        }

        window.onload = () => {
            loadState();
            if (appState.challengeDuration > 0) {
                showExerciseScreen();
            }
        };
        
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    </script>
    
    <!-- Dummy manifest.json and service-worker.js for PWA functionality -->
    <script>
        const manifest = {
            "name": "Mathe-Lern-App",
            "short_name": "Mathe-App",
            "start_url": ".",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#8B5CF6",
            "description": "Eine App zum Üben von Matheaufgaben.",
            "icons": [{
                "src": "images/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            }, {
                "src": "images/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }]
        };
        const manifestBlob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(manifestBlob);
        document.querySelector('link[rel="manifest"]').href = manifestURL;

        const swCode = `
            self.addEventListener('install', event => {
                console.log('Service worker installing...');
            });

            self.addEventListener('fetch', event => {
                console.log('Fetching:', event.request.url);
            });
        `;
        const swBlob = new Blob([swCode], {type: 'application/javascript'});
        const swURL = URL.createObjectURL(swBlob);
        
        // The service worker registration in the main script will use this URL
        // We need to adjust the path in the registration
        const mainScript = document.getElementsByTagName('script')[1];
        mainScript.innerHTML = mainScript.innerHTML.replace('/service-worker.js', swURL);
    </script>
</body>
</html>
