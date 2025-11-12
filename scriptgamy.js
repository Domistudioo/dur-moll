// ==========================================
// TEST GAM – LOGIKA
// ==========================================

let selectedScales = [];
let correctScale;
let correctScaleBaseIndex;
let lastScaleNotes = null;
let correctCount = 0;
let incorrectCount = 0;
let activeAudio = [];
let isPlaying = false;
let timeoutIds = [];

// klawiatura 1–88.mp3 + środek
const TOTAL_NOTES = 88;
const CENTER_NOTE = 44;
const CENTER_SPREAD = 18;

function getNotePath(index) {
    return `piano/${index}.mp3`;
}

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
// WZORY SKAL (w półtonach od dźwięku bazowego)
// ------------------------------------------

const scalePatterns = {
    major:         [0, 2, 4, 5, 7, 9, 11, 12], // durowa
    naturalMinor:  [0, 2, 3, 5, 7, 8, 10, 12], // naturalna molowa
    dorian:        [0, 2, 3, 5, 7, 9, 10, 12], // dorycka
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12], // harmoniczna
    melodicMinorUp:[0, 2, 3, 5, 7, 9, 11, 12]  // melodyczna w górę
};

const scaleNamesPL = {
    major:         "Durowa",
    dorian:        "Molowa dorycka",
    harmonicMinor: "Molowa harmoniczna",
    melodicMinor:  "Molowa melodyczna"
};

// historia – żeby nie było cały czas tej samej gamy
let prevScale = null;
let prevPrevScale = null;

// ------------------------------------------
// UI: zaznacz wszystko
// ------------------------------------------

function toggleAllScales() {
    const checkboxes = document.querySelectorAll(".scale-checkbox");
    const allChecked = [...checkboxes].every(ch => ch.checked);
    checkboxes.forEach(ch => ch.checked = !allChecked);
}

// ------------------------------------------
// START TESTU
// ------------------------------------------

function startScaleTest() {
    selectedScales = [...document.querySelectorAll(".scale-checkbox:checked")]
        .map(x => x.value);

    if (selectedScales.length === 0) {
        alert("Wybierz przynajmniej jedną gamę!");
        return;
    }

    correctCount = 0;
    incorrectCount = 0;
    document.getElementById("correct-count").innerText = "0";
    document.getElementById("incorrect-count").innerText = "0";
    document.getElementById("feedback").innerText = "";

    prevScale = null;
    prevPrevScale = null;

    playNewScale();
}

// ------------------------------------------
// LOSOWANIE GAMY (z anty-spamem)
// ------------------------------------------

function chooseRandomScale() {
    if (selectedScales.length === 0) return null;

    if (selectedScales.length === 1) {
        const only = selectedScales[0];
        prevPrevScale = prevScale;
        prevScale = only;
        return only;
    }

    let candidate;
    let attempts = 0;

    do {
        candidate = selectedScales[Math.floor(Math.random() * selectedScales.length)];
        attempts++;

        const forbidden =
            candidate === prevScale ||
            candidate === prevPrevScale;

        if (!forbidden || attempts > 20) break;
    } while (true);

    prevPrevScale = prevScale;
    prevScale = candidate;
    return candidate;
}

// ------------------------------------------
// GRANIE NOWEJ GAMY
// ------------------------------------------

function playNewScale() {
    if (selectedScales.length === 0) return;

    stopAllAudio();
    clearAllTimeouts();

    correctScale = chooseRandomScale();
    if (!correctScale) return;

    correctScaleBaseIndex = getRandomBaseIndex(12);
    const scaleNotes = getScaleNotes(correctScale, correctScaleBaseIndex);
    lastScaleNotes = scaleNotes;

    console.log(`🎵 Gama: ${scaleNamesPL[correctScale]} od nuty #${correctScaleBaseIndex}`);

    setTimeout(() => {
        playScale(scaleNotes);
    }, 1500);
}

// budowanie listy nut: góra + dół
function getScaleNotes(scale, baseIndex) {
    const up = [];

    if (scale === "major") {
        scalePatterns.major.forEach(o => up.push(baseIndex + o));
    } else if (scale === "dorian") {
        scalePatterns.dorian.forEach(o => up.push(baseIndex + o));
    } else if (scale === "harmonicMinor") {
        scalePatterns.harmonicMinor.forEach(o => up.push(baseIndex + o));
    } else if (scale === "melodicMinor") {
        scalePatterns.melodicMinorUp.forEach(o => up.push(baseIndex + o));
    } else {
        return [];
    }

    if (scale === "melodicMinor") {
        const down = [];
        scalePatterns.naturalMinor.slice().reverse().forEach(o =>
            down.push(baseIndex + o)
        );
        return [...up, ...down];
    } else {
        const down = [...up].reverse();
        return [...up, ...down];
    }
}

// ------------------------------------------
// ODTWARZANIE GAMY
// ------------------------------------------

function playScale(scaleNotes) {
    activeAudio = [];
    isPlaying = true;

    scaleNotes.forEach((noteIndex, i) => {
        const id = setTimeout(() => {
            if (!isPlaying) return;

            if (noteIndex < 1 || noteIndex > TOTAL_NOTES) {
                console.error("❌ Poza zakresem klawiatury:", noteIndex);
                return;
            }

            const audio = new Audio(getNotePath(noteIndex));
            audio.play().catch(() => {});
            activeAudio.push(audio);

            const stopId = setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 850);

            timeoutIds.push(stopId);
        }, i * 800);

        timeoutIds.push(id);
    });
}

function repeatLastScale() {
    if (!lastScaleNotes || lastScaleNotes.length === 0) return;
    console.log(`🔁 Powtórka gamy: ${scaleNamesPL[correctScale]}`);
    stopAllAudio();
    clearAllTimeouts();
    playScale(lastScaleNotes);
}

// ------------------------------------------
// SPRAWDZANIE ODPOWIEDZI
// ------------------------------------------

function checkScaleAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    const userAnswer = document.getElementById("scale-answer").value;
    if (!userAnswer) return;

    if (userAnswer === correctScale) {
        document.getElementById("feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("feedback").innerText =
            `❌ Źle! To była: ${scaleNamesPL[correctScale]}`;
        incorrectCount++;
    }

    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("feedback").innerText = "";
        playNewScale();
    }, 2000);
}

// ------------------------------------------
// CLEAN-UP
// ------------------------------------------

function stopAllAudio() {
    isPlaying = false;
    activeAudio.forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
    activeAudio = [];
}

function clearAllTimeouts() {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
}
