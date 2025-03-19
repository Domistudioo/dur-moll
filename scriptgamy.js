let selectedScales = [];
let correctScale;
let correctCount = 0;
let incorrectCount = 0;
let activeAudio = []; // Przechowywanie aktywnych dźwięków
let isPlaying = false; // Flaga oznaczająca, czy aktualnie coś gra
let timeoutIds = []; // Przechowywanie timeoutów, żeby je czyścić

// ✅ Mapowanie nut do plików `.mp3`
const notes = {
    'C3': 'piano/28.mp3', 'C#3': 'piano/29.mp3', 'D3': 'piano/30.mp3', 'D#3': 'piano/31.mp3',
    'E3': 'piano/32.mp3', 'F3': 'piano/33.mp3', 'F#3': 'piano/34.mp3', 'G3': 'piano/35.mp3',
    'G#3': 'piano/36.mp3', 'A3': 'piano/37.mp3', 'A#3': 'piano/38.mp3', 'B3': 'piano/39.mp3',
    'C4': 'piano/40.mp3', 'C#4': 'piano/41.mp3', 'D4': 'piano/42.mp3', 'D#4': 'piano/43.mp3',
    'E4': 'piano/44.mp3', 'F4': 'piano/45.mp3', 'F#4': 'piano/46.mp3', 'G4': 'piano/47.mp3'
};

// ✅ Kolejność nut w gamach
const scales = {
    'major': ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'], // Durowa
    'naturalMinor': ['C3', 'D3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4'], // Naturalna molowa
    'dorian': ['C3', 'D3', 'D#3', 'F3', 'G3', 'A3', 'B3', 'C4'], // Dorycka
    'harmonicMinor': ['C3', 'D3', 'D#3', 'F3', 'G3', 'G#3', 'B3', 'C4'], // Harmoniczna
    'melodicMinor': ['C3', 'D3', 'D#3', 'F3', 'G3', 'A3', 'B3', 'C4'], // Melodyczna (w górę)
};

// ✅ Mapowanie nazw gam na polski
const scaleNamesPL = {
    'major': "Durowa",
    'naturalMinor': "Molowa naturalna",
    'dorian': "Molowa dorycka",
    'harmonicMinor': "Molowa harmoniczna",
    'melodicMinor': "Molowa melodyczna"
};

// ✅ Zaznaczanie/Odznaczanie wszystkich gam
function toggleAllScales() {
    let checkboxes = document.querySelectorAll(".scale-checkbox");
    let allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => (checkbox.checked = !allChecked));
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

    playNewScale();
}

// ✅ Odtwarzanie losowej gamy
function playNewScale() {
    if (selectedScales.length === 0) return;

    stopAllAudio(); // Natychmiast zatrzymuje granie poprzednich dźwięków
    clearAllTimeouts(); // Usuwa wszystkie zaplanowane dźwięki

    correctScale = selectedScales[Math.floor(Math.random() * selectedScales.length)];
    console.log(`🎵 Odtwarzanie gamy: ${scaleNamesPL[correctScale]}`);

    let scaleNotes = getScaleNotes(correctScale);

    if (!scaleNotes) {
        console.error(`❌ Błąd: Nie znaleziono gamy ${correctScale}`);
        return;
    }

    setTimeout(() => {
        playScale(scaleNotes);
    }, 1500); // Czekamy 1,5 sekundy przed nową gamą
}

// ✅ Pobranie nut gamy (gra w górę i w dół)
function getScaleNotes(scale) {
    let up = scales[scale];
    let down = [...up].reverse(); // Gra w dół
    if (scale === 'melodicMinor') {
        return [...up, ...scales.naturalMinor.reverse()]; // Melodyczna w dół wraca do naturalnej molowej
    }
    return [...up, ...down];
}

// ✅ Odtwarzanie gamy (ucina dźwięki 100 ms przed następnym)
function playScale(scaleNotes) {
    activeAudio = []; // Resetujemy aktywne dźwięki
    isPlaying = true; // Ustawiamy, że teraz coś gra

    scaleNotes.forEach((note, index) => {
        let timeoutId = setTimeout(() => {
            if (!isPlaying) return; // Jeśli użytkownik kliknął "Sprawdź", to nie graj dalej

            let audio = new Audio(notes[note]);
            console.log(`▶️ Odtwarzam: ${note}`);
            audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${notes[note]}:`, error));
            activeAudio.push(audio); // Dodajemy dźwięk do listy aktywnych

            // 🛑 Ucinamy dźwięk 100ms przed kolejnym
            let stopTimeout = setTimeout(() => {
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
    if (!correctScale) return;
    console.log(`🔁 Powtórzenie gamy: ${scaleNamesPL[correctScale]}`);
    playScale(getScaleNotes(correctScale));
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

    let userAnswer = document.getElementById("scale-answer").value;

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
