// ✅ Upewniamy się, że zawsze jedno z pól jest zaznaczone (Po kolei domyślnie)
function toggleOption(selected) {
    if (selected === 'sequential') {
        document.getElementById('together').checked = false;
    } else {
        document.getElementById('sequential').checked = false;
    }
}

// ✅ Pełna skala chromatyczna
const noteNames = [
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'
];

// ✅ Mapowanie nut na pliki audio
const notes = {};
noteNames.forEach((note, index) => {
    notes[note] = `piano/${index + 28}.mp3`; // Ścieżka do plików MP3
});

// ✅ Funkcja odtwarzania pojedynczego dźwięku
function playNoteAudio(note) {
    if (notes[note]) {
        new Audio(notes[note]).play();
    } else {
        console.error("Nie znaleziono dźwięku:", note);
    }
}

// ✅ Funkcja odtwarzania interwałów
function playInterval(interval) {
    let baseNote = 'C3';
    let nextNote = noteNames[noteNames.indexOf(baseNote) + interval];

    let isSequential = document.getElementById("sequential").checked;
    let isTogether = document.getElementById("together").checked;

    if (isTogether) {
        playNoteAudio(baseNote);
        playNoteAudio(nextNote);
    } else if (isSequential) {
        playNoteAudio(baseNote);
        setTimeout(() => playNoteAudio(nextNote), 1000);
    }
}

// ✅ Funkcja odtwarzania trójdźwięków
function playChord(type) {
    let chords = {
        'major': [0, 4, 7],
        'major1': [4, 7, 12],
        'major2': [7, 12, 16],
        'minor': [0, 3, 7],
        'minor1': [3, 7, 12],
        'minor2': [7, 12, 15],
        'augmented': [0, 4, 8],
        'diminished': [0, 3, 6]
    };

    let baseNote = 'C3';
    let notesToPlay = chords[type].map(i => noteNames[noteNames.indexOf(baseNote) + i]);

    let isSequential = document.getElementById("sequential").checked;
    let isTogether = document.getElementById("together").checked;

    if (isSequential) {
        notesToPlay.forEach((note, index) => {
            setTimeout(() => playNoteAudio(note), index * 500);
        });
    } else {
        notesToPlay.forEach(playNoteAudio);
    }
}

// ✅ TEST INTERWAŁÓW

let selectedIntervals = [];
let correctInterval;
let baseNote;
let lastBaseNote, lastInterval;
let correctCount = 0;
let incorrectCount = 0;

// ✅ Funkcja wybierania interwałów do testu
function startTest() {
    selectedIntervals = Array.from(document.querySelectorAll('.interval-checkbox:checked'))
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

// ✅ Funkcja odtwarzania losowego interwału w teście
function playNewInterval() {
    if (selectedIntervals.length === 0) {
        console.error("❌ Błąd: Nie wybrano żadnych interwałów!");
        return;
    }

    baseNote = noteNames[Math.floor(Math.random() * (noteNames.length - 12))];
    correctInterval = selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];

    lastBaseNote = baseNote;
    lastInterval = correctInterval;

    let nextNote = noteNames[noteNames.indexOf(baseNote) + correctInterval];

    console.log(`🎵 Odtwarzanie interwału: ${baseNote} → ${nextNote}`);
    playNoteAudio(baseNote);
    setTimeout(() => playNoteAudio(nextNote), 1000);
}

// ✅ Powtórzenie ostatniego interwału
function repeatLastInterval() {
    if (!lastBaseNote || !lastInterval) {
        console.error("❌ Błąd: Nie ma ostatniego interwału do powtórzenia!");
        return;
    }

    let nextNote = noteNames[noteNames.indexOf(lastBaseNote) + lastInterval];

    console.log(`🔁 Powtórzenie interwału: ${lastBaseNote} → ${nextNote}`);
    playNoteAudio(lastBaseNote);
    setTimeout(() => playNoteAudio(nextNote), 1000);
}

// ✅ Funkcja sprawdzania odpowiedzi użytkownika
// ✅ Funkcja sprawdzania odpowiedzi użytkownika
function checkAnswer() {
    let userAnswer = parseInt(document.getElementById("answer").value);

    if (isNaN(userAnswer)) {
        alert("Wybierz interwał przed sprawdzeniem!");
        return;
    }

    if (userAnswer === correctInterval) {
        document.getElementById("feedback").innerText = "✅ Poprawnie!";
        correctCount++;
        document.getElementById("correct-count").innerText = correctCount;
        setTimeout(() => playNewInterval(), 1500);
    } else {
        document.getElementById("feedback").innerText = `❌ Niepoprawnie! To był: ${getIntervalName(correctInterval)}`;
        incorrectCount++;
        document.getElementById("incorrect-count").innerText = incorrectCount;
        
        // ⏳ Po 2 sekundach gra nowy interwał nawet po błędnej odpowiedzi
        setTimeout(() => {
            document.getElementById("feedback").innerText = "";
            playNewInterval();
        }, 2000);
    }
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

// ✅ Funkcja odtwarzania dźwięku (DODANE LOGI DO DEBUGOWANIA)
function playNoteAudio(note) {
    if (!notes[note]) {
        console.error(`❌ Błąd: Brak pliku dla nuty ${note}`);
        return;
    }

    let audio = new Audio(notes[note]);
    console.log(`▶️ Odtwarzam: ${notes[note]}`);

    audio.play().catch((error) => {
        console.error(`❌ Błąd odtwarzania ${notes[note]}:`, error);
    });
}
// ✅ Funkcja do zaznaczania/odznaczania wszystkich interwałów
function toggleAllIntervals() {
    let checkboxes = document.querySelectorAll(".interval-checkbox");
    let allChecked = [...checkboxes].every(checkbox => checkbox.checked);

    if (allChecked) {
        checkboxes.forEach(checkbox => checkbox.checked = false);
    } else {
        checkboxes.forEach(checkbox => checkbox.checked = true);
    }
}

// ✅ Start testu i odtworzenie pierwszego interwału
function startTest() {
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
