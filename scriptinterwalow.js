// ✅ Lista wybranych interwałów do testu
let selectedIntervals = [];
let correctInterval;
let baseNote;
let correctCount = 0;
let incorrectCount = 0;
let isPlaying = false; // Flaga oznaczająca, czy coś gra
let timeoutIds = []; // Przechowywanie timeoutów, żeby je czyścić

// ✅ Pełna skala chromatyczna
const noteNames = [
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'
];

// ✅ Mapowanie nut do plików `.mp3`
const notes = {};
noteNames.forEach((note, index) => {
    notes[note] = `piano/${index + 28}.mp3`;
});

// ✅ Zaznaczanie/Odznaczanie wszystkich interwałów
function toggleAllIntervals() {
    let checkboxes = document.querySelectorAll(".interval-checkbox");
    let allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => (checkbox.checked = !allChecked));
}

// ✅ Start testu interwałów
function startTest() {
    if (isPlaying) return; // Jeśli dźwięk gra, nie pozwól na nowe odtwarzanie

    selectedIntervals = Array.from(document.querySelectorAll(".interval-checkbox:checked"))
        .map(input => parseInt(input.value));

    if (selectedIntervals.length === 0) {
        alert("Wybierz przynajmniej jeden interwał!");
        return;
    }

    correctCount = 0;
    incorrectCount = 0;
    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;
    document.getElementById("feedback").innerText = "";

    playNewInterval();
}

// ✅ Odtwarzanie losowego interwału
function playNewInterval() {
    if (isPlaying) return; // Jeśli dźwięk nadal gra, nie pozwól na nowe odtwarzanie

    stopAllAudio();
    clearAllTimeouts();

    baseNote = noteNames[Math.floor(Math.random() * (noteNames.length - 12))];
    correctInterval = selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];

    let nextNote = noteNames[noteNames.indexOf(baseNote) + correctInterval];

    console.log(`🎵 Odtwarzanie interwału: ${baseNote} → ${nextNote}`);

    isPlaying = true;

    let notesToPlay = [baseNote, nextNote];

    notesToPlay.forEach((note, index) => {
        let timeoutId = setTimeout(() => {
            if (!isPlaying) return; // Jeśli użytkownik kliknął "Sprawdź", to nie graj dalej

            let audio = new Audio(notes[note]);
            console.log(`▶️ Odtwarzam: ${note}`);
            audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${notes[note]}:`, error));

            // Skracamy dźwięk przed kolejnym
            timeoutIds.push(setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 850)); 

        }, index * 800); // Opóźnienie między nutami = 800ms

        timeoutIds.push(timeoutId);
    });

    // Po zakończeniu ostatniego dźwięku resetujemy flagę
    timeoutIds.push(setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800));
}

// ✅ Powtórzenie ostatniego interwału
function repeatLastInterval() {
    if (isPlaying || !correctInterval) return;

    console.log(`🔁 Powtórzenie interwału: ${baseNote} → ${noteNames[noteNames.indexOf(baseNote) + correctInterval]}`);
    playNewInterval();
}

// ✅ Funkcja sprawdzania odpowiedzi użytkownika
function checkAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    let userAnswer = parseInt(document.getElementById("answer").value);

    if (isNaN(userAnswer)) {
        alert("Wybierz interwał przed sprawdzeniem!");
        return;
    }

    if (userAnswer === correctInterval) {
        document.getElementById("feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("feedback").innerText = `❌ Niepoprawnie! To był: ${getIntervalName(correctInterval)}`;
        incorrectCount++;
    }

    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("feedback").innerText = "";
        playNewInterval();
    }, 2000);
}

// ✅ Funkcja zwracająca nazwę interwału na podstawie liczby półtonów
function getIntervalName(interval) {
    const names = {
        0: "Pryma",
        1: "Sekunda mała",
        2: "Sekunda wielka",
        3: "Tercja mała",
        4: "Tercja wielka",
        5: "Kwarta czysta",
        6: "Tryton",
        7: "Kwinta czysta",
        8: "Seksta mała",
        9: "Seksta wielka",
        10: "Septyma mała",
        11: "Septyma wielka",
        12: "Oktawa"
    };
    return names[interval] || "Nieznany interwał";
}

// ✅ Funkcja zatrzymywania wszystkich dźwięków
function stopAllAudio() {
    isPlaying = false;
    timeoutIds.forEach(timeout => clearTimeout(timeout));
    timeoutIds = [];
}

// ✅ Usuwanie wszystkich zaplanowanych timeoutów
function clearAllTimeouts() {
    timeoutIds.forEach(timeout => clearTimeout(timeout));
    timeoutIds = [];
}
