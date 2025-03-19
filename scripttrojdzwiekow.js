// ✅ Lista wybranych trójdźwięków do testu
let selectedChords = [];
let correctChord;
let correctCount = 0;
let incorrectCount = 0;
let isPlaying = false; // Flaga oznaczająca, czy aktualnie coś gra
let timeoutIds = []; // Lista timeoutów do kontroli grania

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

// ✅ Definicja trójdźwięków (akordów)
const chords = {
    'major': [0, 4, 7],
    'major1': [4, 7, 12],
    'major2': [7, 12, 16],
    'minor': [0, 3, 7],
    'minor1': [3, 7, 12],
    'minor2': [7, 12, 15],
    'augmented': [0, 4, 8],
    'diminished': [0, 3, 6]
};

// ✅ Mapowanie nazw akordów na polski
const chordNamesPL = {
    'major': "Durowy",
    'major1': "Durowy (I przewrót)",
    'major2': "Durowy (II przewrót)",
    'minor': "Molowy",
    'minor1': "Molowy (I przewrót)",
    'minor2': "Molowy (II przewrót)",
    'augmented': "Zwiększony",
    'diminished': "Zmniejszony"
};

// ✅ Zaznaczanie/Odznaczanie wszystkich trójdźwięków
function toggleAllChords() {
    let checkboxes = document.querySelectorAll(".chord-checkbox");
    let allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => (checkbox.checked = !allChecked));
}

// ✅ Start testu na trójdźwięki
function startChordTest() {
    if (isPlaying) return; // Jeśli dźwięk gra, nie pozwól na nowe odtwarzanie

    selectedChords = Array.from(document.querySelectorAll(".chord-checkbox:checked"))
        .map(input => input.value);

    if (selectedChords.length === 0) {
        alert("Wybierz przynajmniej jeden trójdźwięk!");
        return;
    }

    correctCount = 0;
    incorrectCount = 0;
    document.getElementById("correct-chord-count").innerText = correctCount;
    document.getElementById("incorrect-chord-count").innerText = incorrectCount;
    document.getElementById("chord-feedback").innerText = "";

    playNewChord();
}

// ✅ Odtwarzanie losowego trójdźwięku
function playNewChord() {
    if (isPlaying) return; // Jeśli dźwięk nadal gra, nie pozwól na nowe odtwarzanie

    stopAllAudio();
    clearAllTimeouts();

    correctChord = selectedChords[Math.floor(Math.random() * selectedChords.length)];

    console.log(`🎵 Odtwarzanie trójdźwięku: ${chordNamesPL[correctChord]}`);
    playChord(correctChord);
}

// ✅ Powtórzenie ostatniego trójdźwięku
function repeatLastChord() {
    if (isPlaying || !correctChord) return;

    console.log(`🔁 Powtórzenie trójdźwięku: ${chordNamesPL[correctChord]}`);
    playChord(correctChord);
}

// ✅ Funkcja sprawdzania odpowiedzi użytkownika
function checkChordAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    let userAnswer = document.getElementById("chord-answer").value;

    if (!userAnswer) {
        alert("Wybierz trójdźwięk przed sprawdzeniem!");
        return;
    }

    if (userAnswer === correctChord) {
        document.getElementById("chord-feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("chord-feedback").innerText = `❌ Niepoprawnie! To był: ${chordNamesPL[correctChord]}`;
        incorrectCount++;
    }

    document.getElementById("correct-chord-count").innerText = correctCount;
    document.getElementById("incorrect-chord-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("chord-feedback").innerText = "";
        playNewChord();
    }, 2000);
}

// ✅ Funkcja odtwarzania trójdźwięków
function playChord(type) {
    if (!chords[type]) {
        console.error(`❌ Nie znaleziono akordu: ${type}`);
        return;
    }

    isPlaying = true;
    let baseNote = 'C3';
    let notesToPlay = chords[type].map(i => noteNames[noteNames.indexOf(baseNote) + i]);

    console.log(`🎵 Odtwarzanie trójdźwięku: ${type} - ${notesToPlay.join(', ')}`);

    notesToPlay.forEach((note, index) => {
        let timeoutId = setTimeout(() => {
            if (!isPlaying) return; // Jeśli użytkownik kliknął "Sprawdź", to nie graj dalej

            let audio = new Audio(notes[note]);
            console.log(`▶️ Odtwarzam: ${note}`);
            audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${notes[note]}:`, error));

            timeoutIds.push(setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 850)); // Skracamy dźwięk przed kolejnym

        }, index * 800); // Opóźnienie między nutami = 800ms

        timeoutIds.push(timeoutId);
    });

    setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800);
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

// ✅ Funkcja odtwarzania dźwięku z logowaniem błędów
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
