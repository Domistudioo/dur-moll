// ==========================================
// TEST TRÓJDŹWIĘKÓW + D7 – LOGIKA
// ==========================================

// Stan
let selectedChords = [];
let correctChord;
let correctChordBaseIndex;
let lastChordBaseIndex;
let correctCount = 0;
let incorrectCount = 0;
let isPlaying = false;
let timeoutIds = [];

// Konfiguracja klawiatury: 1.mp3 ... 88.mp3
const TOTAL_NOTES = 88;
const CENTER_NOTE = 44;    // środek klawiatury
const CENTER_SPREAD = 18;  // ile klawiszy w lewo/prawo od środka

// Historia – żeby nie było ciągle tego samego akordu
let prevChord = null;
let prevPrevChord = null;

// ------------------------------------------
// PLIK DŹWIĘKOWY
// ------------------------------------------

function getNotePath(index) {
    return `piano/${index}.mp3`;
}

// losowanie bazowego dźwięku bardziej ze środka klawiatury
function getRandomBaseIndex(maxOffset) {
    const preferredMin = CENTER_NOTE - CENTER_SPREAD;
    const preferredMax = CENTER_NOTE + CENTER_SPREAD;
    const maxBaseAllowed = TOTAL_NOTES - maxOffset;

    const min = Math.max(1, preferredMin);
    const max = Math.min(maxBaseAllowed, preferredMax);

    const low = Math.max(1, Math.min(min, maxBaseAllowed));
    const high = Math.max(low, max);

    return Math.floor(Math.random() * (high - low + 1)) + low;
}

// ------------------------------------------
// DEFINICJA AKORDÓW (półtony od basu)
// ------------------------------------------

const chords = {
    major:     [0, 4, 7],
    major1:    [4, 7, 12],
    major2:    [7, 12, 16],
    minor:     [0, 3, 7],
    minor1:    [3, 7, 12],
    minor2:    [7, 12, 15],
    augmented: [0, 4, 8],
    diminished:[0, 3, 6],

    // Dominanta septymowa (D7)
    dom7:   [0, 4, 7, 10],   // pozycja zasadnicza
    dom7_1: [4, 7, 10, 12],  // I przewrót
    dom7_2: [7, 10, 12, 16], // II przewrót
    dom7_3: [10, 12, 16, 19] // III przewrót
};

const chordNamesPL = {
    major:     "Durowy",
    major1:    "Durowy (I przewrót)",
    major2:    "Durowy (II przewrót)",
    minor:     "Molowy",
    minor1:    "Molowy (I przewrót)",
    minor2:    "Molowy (II przewrót)",
    augmented: "Zwiększony",
    diminished:"Zmniejszony",

    dom7:   "D7 (pozycja zasadnicza)",
    dom7_1: "D7 (I przewrót)",
    dom7_2: "D7 (II przewrót)",
    dom7_3: "D7 (III przewrót)"
};

// ------------------------------------------
// UI: zaznacz wszystko
// ------------------------------------------

function toggleAllChords() {
    const checkboxes = document.querySelectorAll(".chord-checkbox");
    const allChecked = [...checkboxes].every(ch => ch.checked);
    checkboxes.forEach(ch => ch.checked = !allChecked);
}

// ------------------------------------------
// LOSOWANIE AKORDU Z ANTY-SPAMEM
// ------------------------------------------

function chooseRandomChord() {
    if (selectedChords.length === 0) return null;

    if (selectedChords.length === 1) {
        const only = selectedChords[0];
        prevPrevChord = prevChord;
        prevChord = only;
        return only;
    }

    let candidate;
    let attempts = 0;

    do {
        candidate = selectedChords[Math.floor(Math.random() * selectedChords.length)];
        attempts++;

        const forbidden =
            candidate === prevChord ||
            candidate === prevPrevChord; // unikanie wzoru A–B–A–B

        if (!forbidden || attempts > 20) break;
    } while (true);

    prevPrevChord = prevChord;
    prevChord = candidate;
    return candidate;
}

// ------------------------------------------
// START TESTU
// ------------------------------------------

function startChordTest() {
    if (isPlaying) return;

    selectedChords = [...document.querySelectorAll(".chord-checkbox:checked")]
        .map(x => x.value);

    if (selectedChords.length === 0) {
        alert("Wybierz przynajmniej jeden akord!");
        return;
    }

    correctCount = 0;
    incorrectCount = 0;
    document.getElementById("correct-chord-count").innerText = "0";
    document.getElementById("incorrect-chord-count").innerText = "0";
    document.getElementById("chord-feedback").innerText = "";

    prevChord = null;
    prevPrevChord = null;

    playNewChord();
}

// ------------------------------------------
// GRANIE NOWEGO AKORDU
// ------------------------------------------

function playNewChord() {
    if (isPlaying) return;

    stopAllAudio();
    clearAllTimeouts();

    correctChord = chooseRandomChord();
    if (!correctChord) return;

    const maxOffset = Math.max(...chords[correctChord]);
    correctChordBaseIndex = getRandomBaseIndex(maxOffset);
    lastChordBaseIndex = correctChordBaseIndex;

    console.log(`🎵 Akord: ${chordNamesPL[correctChord]} od nuty #${correctChordBaseIndex}`);
    playChord(correctChord, correctChordBaseIndex);
}

function repeatLastChord() {
    if (isPlaying || !correctChord || !lastChordBaseIndex) return;

    console.log(`🔁 Powtórka: ${chordNamesPL[correctChord]} od nuty #${lastChordBaseIndex}`);
    stopAllAudio();
    clearAllTimeouts();
    playChord(correctChord, lastChordBaseIndex);
}

function playChord(type, baseIndex) {
    const pattern = chords[type];
    if (!pattern) {
        console.error("❌ Nieznany akord:", type);
        return;
    }

    isPlaying = true;
    const notesToPlay = pattern.map(offset => baseIndex + offset);

    console.log("Nuty akordu:", notesToPlay.join(", "));

    notesToPlay.forEach((noteIndex, i) => {
        const id = setTimeout(() => {
            if (!isPlaying) return;

            if (noteIndex < 1 || noteIndex > TOTAL_NOTES) {
                console.error("❌ Poza zakresem klawiatury:", noteIndex);
                return;
            }

            const audio = new Audio(getNotePath(noteIndex));
            audio.play().catch(() => {});

            const stopId = setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 850);

            timeoutIds.push(stopId);
        }, i * 800);

        timeoutIds.push(id);
    });

    timeoutIds.push(setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800));
}

// ------------------------------------------
// SPRAWDZANIE ODPOWIEDZI
// ------------------------------------------

function checkChordAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    const userAnswer = document.getElementById("chord-answer").value;
    if (!userAnswer) {
        alert("Wybierz akord przed sprawdzeniem!");
        return;
    }

    if (userAnswer === correctChord) {
        document.getElementById("chord-feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("chord-feedback").innerText =
            `❌ Źle! To był: ${chordNamesPL[correctChord]}`;
        incorrectCount++;
    }

    document.getElementById("correct-chord-count").innerText = correctCount;
    document.getElementById("incorrect-chord-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("chord-feedback").innerText = "";
        playNewChord();
    }, 2000);
}

// ------------------------------------------
// CLEAN-UP
// ------------------------------------------

function stopAllAudio() {
    isPlaying = false;
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
}

function clearAllTimeouts() {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
}
