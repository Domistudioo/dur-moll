// ------------------------------------------
// KONFIGURACJA
// ------------------------------------------
let selectedIntervals = [];
let correctInterval;
let baseNoteIndex;
let lastBaseNoteIndex, lastInterval;
let correctCount = 0;
let incorrectCount = 0;
let isPlaying = false;
let timeoutIds = [];

const TOTAL_NOTES = 88;

// środek klawiatury
const CENTER_NOTE = 44;
const CENTER_SPREAD = 18;

// historia – aby nie było: oktawa–oktawa–oktawa albo pryma–oktawa–pryma–oktawa
let prevInterval = null;
let prevPrevInterval = null;

// ------------------------------------------
// FUNKCJE POMOCNICZE
// ------------------------------------------

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

function getNotePath(index) {
    return `piano/${index}.mp3`;
}

function playNoteAudio(index) {
    if (index < 1 || index > TOTAL_NOTES) return;

    const audio = new Audio(getNotePath(index));
    audio.play().catch(() => {});
    const stopTimeout = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 850);

    timeoutIds.push(stopTimeout);
}

// ------------------------------------------
// START TESTU
// ------------------------------------------

function toggleAllIntervals() {
    const checkboxes = document.querySelectorAll(".interval-checkbox");
    const allChecked = [...checkboxes].every(ch => ch.checked);
    checkboxes.forEach(ch => ch.checked = !allChecked);
}

function chooseRandomInterval() {
    if (selectedIntervals.length === 0) return null;
    if (selectedIntervals.length === 1) {
        const only = selectedIntervals[0];
        prevPrevInterval = prevInterval;
        prevInterval = only;
        return only;
    }

    let candidate, attempts = 0;
    do {
        candidate = selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];
        attempts++;

        const forbidden =
            candidate === prevInterval ||
            candidate === prevPrevInterval;

        if (!forbidden || attempts > 20) break;
    } while (true);

    prevPrevInterval = prevInterval;
    prevInterval = candidate;
    return candidate;
}

function startTest() {
    if (isPlaying) return;

    selectedIntervals = [...document.querySelectorAll(".interval-checkbox:checked")]
        .map(x => parseInt(x.value));

    if (selectedIntervals.length === 0) {
        alert("Wybierz przynajmniej jeden interwał!");
        return;
    }

    correctCount = incorrectCount = 0;
    document.getElementById("correct-count").innerText = 0;
    document.getElementById("incorrect-count").innerText = 0;
    document.getElementById("feedback").innerText = "";

    prevInterval = prevPrevInterval = null;
    playNewInterval();
}

// ------------------------------------------
// GRANIE INTERWAŁU
// ------------------------------------------

function playNewInterval() {
    if (isPlaying) return;

    stopAllAudio();
    clearAllTimeouts();

    correctInterval = chooseRandomInterval();
    if (correctInterval === null) return;

    baseNoteIndex = getRandomBaseIndex(12);
    lastBaseNoteIndex = baseNoteIndex;
    lastInterval = correctInterval;

    const nextNote = baseNoteIndex + correctInterval;
    isPlaying = true;

    [baseNoteIndex, nextNote].forEach((n, i) => {
        const id = setTimeout(() => {
            if (!isPlaying) return;
            playNoteAudio(n);
        }, i * 800);
        timeoutIds.push(id);
    });

    timeoutIds.push(setTimeout(() => isPlaying = false, 1600));
}

function repeatLastInterval() {
    if (isPlaying || !lastBaseNoteIndex || lastInterval == null) return;
    stopAllAudio();
    clearAllTimeouts();

    const n1 = lastBaseNoteIndex;
    const n2 = n1 + lastInterval;

    isPlaying = true;

    [n1, n2].forEach((n, i) => {
        const id = setTimeout(() => playNoteAudio(n), i * 800);
        timeoutIds.push(id);
    });

    timeoutIds.push(setTimeout(() => isPlaying = false, 1600));
}

// ------------------------------------------
// SPRAWDZANIE ODPOWIEDZI
// ------------------------------------------

function checkAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    const answer = parseInt(document.getElementById("answer").value);
    if (answer === correctInterval) {
        document.getElementById("feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("feedback").innerText =
            `❌ Źle! To był: ${getIntervalName(correctInterval)}`;
        incorrectCount++;
    }

    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("feedback").innerText = "";
        playNewInterval();
    }, 2000);
}

function getIntervalName(i) {
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
    return names[i] || i;
}

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
