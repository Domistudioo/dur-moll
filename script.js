// ✅ Zapewnienie, że jedno z pól (Po kolei/Razem) jest zawsze zaznaczone
function toggleOption(selected) {
    if (selected === 'sequential') {
        document.getElementById('together').checked = false;
    } else {
        document.getElementById('sequential').checked = false;
    }
    toggleButtons();
}

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

// ✅ Zmienna kontrolująca aktywne odtwarzanie
let isPlaying = false;
let timeoutIds = [];
let activeAudio = [];

// ✅ Funkcja odtwarzania pojedynczego dźwięku (z przycinaniem)
function playNoteAudio(note) {
    if (!notes[note]) {
        console.error(`❌ Brak pliku dla nuty ${note}`);
        return;
    }

    let audio = new Audio(notes[note]);
    console.log(`▶️ Odtwarzam: ${note}`);
    audio.play().catch(error => console.error(`❌ Błąd odtwarzania ${notes[note]}:`, error));

    activeAudio.push(audio);

    let stopTimeout = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 850); // Skrócenie dźwięku przed kolejnym

    timeoutIds.push(stopTimeout);
}

// ✅ Pobiera bazowy dźwięk na podstawie wyboru
function getBaseNote() {
    let isRandom = document.getElementById("random").checked;
    if (isRandom) {
        return noteNames[Math.floor(Math.random() * (noteNames.length - 12))];
    }
    return "C3"; // Domyślny dźwięk
}

// ✅ Odtwarzanie interwału z uwzględnieniem kierunku
function playInterval(interval) {
    if (isPlaying) return;
    stopAllAudio();

    let baseNote = getBaseNote();
    let nextNote = noteNames[noteNames.indexOf(baseNote) + interval];

    let direction = document.querySelector('input[name="direction"]:checked').id;

    let notesToPlay;
    if (direction === "up") {
        notesToPlay = [baseNote, nextNote];
    } else if (direction === "down") {
        notesToPlay = [nextNote, baseNote];
    } else {
        notesToPlay = [baseNote, nextNote, baseNote]; // Góra → Dół
    }

    let isSequentialMode = document.getElementById("sequential").checked;
    let isTogether = document.getElementById("together").checked;

    isPlaying = true;

    if (isTogether) {
        notesToPlay.forEach(playNoteAudio);
    } else if (isSequentialMode) {
        notesToPlay.forEach((note, index) => {
            let timeoutId = setTimeout(() => {
                if (!isPlaying) return;
                playNoteAudio(note);
            }, index * 800);
            timeoutIds.push(timeoutId);
        });
    }

    timeoutIds.push(setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800));
}

// ✅ Odtwarzanie trójdźwięków z kierunkiem
function playChord(type) {
    if (isPlaying) return;
    stopAllAudio();

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

    let baseNote = getBaseNote();
    let notesToPlay = chords[type].map(i => noteNames[noteNames.indexOf(baseNote) + i]);

    let direction = document.querySelector('input[name="direction"]:checked').id;
    if (direction === "down") {
        notesToPlay.reverse();
    } else if (direction === "updown") {
        notesToPlay = [...notesToPlay, ...notesToPlay.slice(0, -1).reverse()];
    }

    let isSequentialMode = document.getElementById("sequential").checked;
    let isTogether = document.getElementById("together").checked;

    isPlaying = true;

    if (isTogether) {
        notesToPlay.forEach(playNoteAudio);
    } else if (isSequentialMode) {
        notesToPlay.forEach((note, index) => {
            let timeoutId = setTimeout(() => {
                if (!isPlaying) return;
                playNoteAudio(note);
            }, index * 800);
            timeoutIds.push(timeoutId);
        });
    }

    timeoutIds.push(setTimeout(() => {
        isPlaying = false;
    }, notesToPlay.length * 800));
}

// ✅ Funkcja zatrzymywania wszystkich dźwięków
function stopAllAudio() {
    isPlaying = false;
    timeoutIds.forEach(timeout => clearTimeout(timeout));
    timeoutIds = [];

    activeAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    activeAudio = [];
}

// ✅ Blokowanie wyboru kierunku, jeśli wybrano "Razem"
function toggleButtons() {
    let together = document.getElementById("together").checked;
    let directionButtons = document.querySelectorAll('input[name="direction"]');

    directionButtons.forEach(button => {
        button.disabled = together;
    });
}
