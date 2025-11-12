let selectedScales = [];
let correctScale;
let correctScaleBaseIndex;
let lastScaleNotes = null;
let correctCount = 0;
let incorrectCount = 0;
let activeAudio = []; // Przechowywanie aktywnych dźwięków
let isPlaying = false; // Flaga oznaczająca, czy aktualnie coś gra
let timeoutIds = []; // Przechowywanie timeoutów, żeby je czyścić

// ✅ Konfiguracja – 1.mp3 ... 88.mp3
const TOTAL_NOTES = 88;

function getNotePath(index) {
    return `piano/${index}.mp3`;
}

// ✅ Wzory skal jako odległości w półtonach od dźwięku bazowego
const scalePatterns = {
    major: [0, 2, 4, 5, 7, 9, 11, 12],            // Durowa
    naturalMinor: [0, 2, 3, 5, 7, 8, 10, 12],    // Naturalna molowa
    dorian: [0, 2, 3, 5, 7, 9, 10, 12],          // Dorycka
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],   // Harmoniczna
    melodicMinorUp: [0, 2, 3, 5, 7, 9, 11, 12]   // Melodyczna w górę
};

// ✅ Mapowanie nazw gam na polski
const scaleNamesPL = {
    'major': "Durowa",
    'dorian': "Molowa dorycka",
    'harmonicMinor': "Molowa harmoniczna",
    'melodicMinor': "Molowa melodyczna"
};

// Historia, żeby nie powtarzać w kółko tych samych skal
let prevScale = null;
let prevPrevScale = null;

// ✅ Zaznaczanie/Odznaczanie wszystkich gam
function toggleAllScales() {
    const checkboxes = document.querySelectorAll(".scale-checkbox");
    const allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => (checkbox.checked = !allChecked));
}

function getRandomBaseIndex(maxOffset) {
    const maxBase = TOTAL_NOTES - maxOffset;
    return Math.floor(Math.random() * maxBase) + 1;
}

// ✅ Start testu gam
function startScaleTest() {
    selectedScales = Array.from(document.querySelectorAll(".scale-checkbox:checked"))
        .map(input => input.value);

    if (selectedScales.length === 0) {
        alert("Wybierz przynajmniej jedną gamę!");
        return;
    }

    correctCount = 0;
    incorrectCount = 0;
    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;
    document.getElementById("feedback").innerText = "";

    prevScale = null;
    prevPrevScale = null;

    playNewScale();
}

// ✅ Wybór gamy z ograniczeniem powtarzalności
function chooseRandomScale() {
    if (selectedScales.length === 0) return null;
    if (selectedScales.length === 1) {
        const only = selectedScales[0];
        prevPrevScale = prevScale;
        prevScale = only;
        return only;
    }

    let candidate = null;
    let attempts = 0;

    do {
        candidate = selectedScales[Math.floor(Math.random() * selectedScales.length)];
        attempts++;

        const forbidden =
            (prevScale !== null && candidate === prevScale) ||
            (prevScale !== null && prevPrevScale !== null && candidate === prevPrevScale);

        if (!forbidden || attempts > 20) break;
    } while (true);

    prevPrevScale = prevScale;
    prevScale = candidate;

    return candidate;
}

// ✅ Odtwarzanie losowej gamy
function playNewScale() {
    if (selectedScales.length === 0) return;

    stopAllAudio(); // Natychmiast zatrzymuje granie poprzednich dźwięków
    clearAllTimeouts(); // Usuwa wszystkie zaplanowane dźwięki

    correctScale = chooseRandomScale();
    if (!correctScale) return;

    // ustalamy maksymalny offset w półtonach: 12 (oktawa)
    correctScaleBaseIndex = getRandomBaseIndex(12);

    const scaleNotes = getScaleNotes(correctScale, correctScaleBaseIndex);
    lastScaleNotes = scaleNotes;

    console.log(`🎵 Odtwarzanie gamy: ${scaleNamesPL[correctScale]} od nuty #${correctScaleBaseIndex}`);

    setTimeout(() => {
        playScale(scaleNotes);
    }, 1500); // Czekamy 1,5 sekundy przed nową gamą
}

// ✅ Pobranie nut gamy (gra w górę i w dół)
function getScaleNotes(scale, baseIndex) {
    const up = [];

    if (scale === 'major') {
        scalePatterns.major.forEach(offset => up.push(baseIndex + offset));
    } else if (scale === 'dorian') {
        scalePatterns.dorian.forEach(offset => up.push(baseIndex + offset));
    } else if (scale === 'harmonicMinor') {
        scalePatterns.harmonicMinor.forEach(offset => up.push(baseIndex + offset));
    } else if (scale === 'melodicMinor') {
        scalePatterns.melodicMinorUp.forEach(offset => up.push(baseIndex + offset));
    } else {
        return [];
    }

    // dół:
    if (scale === 'melodicMinor') {
        // w dół wracamy naturalną molową
        const down = [];
        scalePatterns.naturalMinor.slice().reverse().forEach(offset => down.push(baseIndex + offset));
        return [...up, ...down];
    } else {
        const down = [...up].reverse();
        return [...up, ...down];
    }
}

// ✅ Odtwarzanie gamy (ucina dźwięki 100 ms przed następnym)
function playScale(scaleNotes) {
    activeAudio = []; // Resetujemy aktywne dźwięki
    isPlaying = true; // Ustawiamy, że teraz coś gra

    scaleNotes.forEach((noteIndex, index) => {
        const timeoutId = setTimeout(() => {
            if (!isPlaying) return; // Jeśli użytkownik kliknął "Sprawdź", to nie graj dalej

            if (noteIndex < 1 || noteIndex > TOTAL_NOTES) {
                console.error(`❌ Indeks nuty poza zakresem: ${noteIndex}`);
                return;
            }

            const audio = new Audio(getNotePath(noteIndex));
            console.log(`▶️ Odtwarzam nutę #${noteIndex}`);
            audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${getNotePath(noteIndex)}:`, error));
            activeAudio.push(audio); // Dodajemy dźwięk do listy aktywnych

            // 🛑 Ucinamy dźwięk 100ms przed kolejnym
            const stopTimeout = setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 850); // 800ms (czas trwania nuty) - 100ms

            timeoutIds.push(stopTimeout);
        }, index * 800); // Opóźnienie między nutami = 800ms

        timeoutIds.push(timeoutId);
    });
}

// ✅ Powtórzenie ostatniej gamy
function repeatLastScale() {
    if (!lastScaleNotes || lastScaleNotes.length === 0) return;
    console.log(`🔁 Powtórzenie gamy: ${scaleNamesPL[correctScale]} (ta sama baza i przebieg)`);
    stopAllAudio();
    clearAllTimeouts();
    playScale(lastScaleNotes);
}

// ✅ Zatrzymanie wszystkich dźwięków (kliknięcie "Sprawdź" lub nowa gra)
function stopAllAudio() {
    isPlaying = false; // Ustawiamy, że nie ma grania
    activeAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    activeAudio = [];
}

// ✅ Usunięcie wszystkich zaplanowanych timeoutów
function clearAllTimeouts() {
    timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutIds = [];
}

// ✅ Sprawdzanie odpowiedzi użytkownika
function checkScaleAnswer() {
    stopAllAudio(); // Zatrzymuje granie aktualnej gamy!
    clearAllTimeouts(); // Czyści wszystkie dźwięki, żeby nie odpaliły się stare!

    const userAnswer = document.getElementById("scale-answer").value;

    if (userAnswer === correctScale) {
        document.getElementById("feedback").innerText = "✅ Poprawnie!";
        correctCount++;
    } else {
        document.getElementById("feedback").innerText = `❌ Niepoprawnie! To była: ${scaleNamesPL[correctScale]}`;
        incorrectCount++;
    }

    document.getElementById("correct-count").innerText = correctCount;
    document.getElementById("incorrect-count").innerText = incorrectCount;

    setTimeout(() => {
        document.getElementById("feedback").innerText = "";
        playNewScale();
    }, 2000);
}
