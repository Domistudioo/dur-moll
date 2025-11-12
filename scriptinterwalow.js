// ✅ Lista wybranych interwałów do testu
let selectedIntervals = [];
let correctInterval;
let baseNoteIndex;
let lastBaseNoteIndex, lastInterval;
let correctCount = 0;
let incorrectCount = 0;
let isPlaying = false; // Flaga oznaczająca, czy coś gra
let timeoutIds = []; // Przechowywanie timeoutów

// ✅ Konfiguracja klawiatury – mamy 88 plików: 1.mp3 ... 88.mp3
const TOTAL_NOTES = 88;

// Historia interwałów, żeby unikać powtórek typu: oktawa, oktawa, oktawa / pryma–oktawa–pryma–oktawa
let prevInterval = null;
let prevPrevInterval = null;

// Losowy indeks nuty (1..TOTAL_NOTES)
function getRandomBaseIndex(maxOffset) {
    const maxBase = TOTAL_NOTES - maxOffset;
    return Math.floor(Math.random() * maxBase) + 1; // 1..maxBase
}

// Zwraca ścieżkę do pliku dźwiękowego
function getNotePath(index) {
    return `piano/${index}.mp3`;
}

// Odtwarza pojedynczą nutę (z przycinaniem)
function playNoteAudio(index) {
    if (index < 1 || index > TOTAL_NOTES) {
        console.error(`❌ Nieprawidłowy indeks nuty: ${index}`);
        return;
    }

    const audio = new Audio(getNotePath(index));
    console.log(`▶️ Odtwarzam nutę #${index}`);

    audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${getNotePath(index)}:`, error));

    // Skracamy dźwięk przed kolejnym
    const stopTimeout = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 850);

    timeoutIds.push(stopTimeout);
}

// ✅ Zaznaczanie/Odznaczanie wszystkich interwałów
function toggleAllIntervals() {
    const checkboxes = document.querySelectorAll(".interval-checkbox");
    const allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => (checkbox.checked = !allChecked));
}

// ✅ Wybór interwału z unikaniem powtarzania tych samych schematów
function chooseRandomInterval() {
    if (selectedIntervals.length === 0) return null;
    if (selectedIntervals.length === 1) {
        const only = selectedIntervals[0];
        prevPrevInterval = prevInterval;
        prevInterval = only;
        return only;
    }

    let candidate = null;
    let attempts = 0;

    do {
        candidate = selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];
        attempts++;

        // warunki odrzucenia:
        // 1) taki sam jak poprzedni
        // 2) taki sam jak przed-poprzedni (unika wzoru A–B–A–B)
        const forbidden =
            (prevInterval !== null && candidate === prevInterval) ||
            (prevInterval !== null && prevPrevInterval !== null && candidate === prevPrevInterval);

        if (!forbidden || attempts > 20) break;
    } while (true);

    prevPrevInterval = prevInterval;
    prevInterval = candidate;

    return candidate;
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

    prevInterval = null;
    prevPrevInterval = null;

    playNewInterval();
}

// ✅ Odtwarzanie losowego interwału
function playNewInterval() {
    if (isPlaying) return; // Jeśli dźwięk nadal gra, nie pozwól na nowe odtwarzanie

    stopAllAudio();
    clearAllTimeouts();

    const maxInterval = 12; // największy interwał w półtonach (oktawa)
    baseNoteIndex = getRandomBaseIndex(maxInterval);

    correctInterval = chooseRandomInterval();
    if (correctInterval === null) return;

    lastBaseNoteIndex = baseNoteIndex;
    lastInterval = correctInterval;

    const nextNoteIndex = baseNoteIndex + correctInterval;

    console.log(`🎵 Interwał: baza #${baseNoteIndex} → #${nextNoteIndex} (półtonów: ${correctInterval})`);

    isPlaying = true;

    const notesToPlay = [baseNoteIndex, nextNoteIndex];

    notesToPlay.forEach((noteIndex, index) => {
        const timeoutId = setTimeout(() => {
            if (!isPlaying) return; // Jeśli użytkownik kliknął "Sprawdź", to nie graj dalej
            playNoteAudio(noteIndex);
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
    if (isPlaying || !lastBaseNoteIndex || lastInterval === null || lastInterval === undefined) return;

    const nextNoteIndex = lastBaseNoteIndex + lastInterval;

    console.log(`🔁 Powtórzenie interwału: baza #${lastBaseNoteIndex} → #${nextNoteIndex} (półtonów: ${lastInterval})`);

    stopAllAudio();
    clearAllTimeouts();

    isPlaying = true;

    const notesToPlay = [lastBaseNoteIndex, nextNoteIndex];

    notesToPlay.forEach((noteIndex, index) => {
        const timeoutId = setTimeout(() => {
            if (!isPlaying) return;
            playNoteAudio(noteIndex);
        }, index * 800);

        timeoutIds.push(timeoutId);
    });

    timeoutIds.push(setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800));
}

// ✅ Funkcja sprawdzania odpowiedzi użytkownika
function checkAnswer() {
    stopAllAudio();
    clearAllTimeouts();

    const userAnswer = parseInt(document.getElementById("answer").value);

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
