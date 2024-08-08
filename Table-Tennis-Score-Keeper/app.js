const b1button = document.querySelector('#b1');
const b2button = document.querySelector('#b2');
const resetbutton = document.querySelector('#r1');
const scoreSelect = document.querySelector('#playto');

const p1 = document.querySelector('#p1');
const p2 = document.querySelector('#p2');

let p1Score = 0;
let p2Score = 0;
let winningScore = parseInt(scoreSelect.value);
let isgameOver = false;

function resetGame() {
    isgameOver = false;
    p1Score = 0;
    p2Score = 0;
    updateScores();
    document.querySelectorAll('.click-change').forEach(button => {
        button.classList.remove('active');
        button.querySelector('.c2').textContent = 'Point!';
    });
}

function updateButtonText(button) {
    button.classList.add('active');
    button.querySelector('.c2').textContent = 'Point!';
    setTimeout(() => {
        button.classList.remove('active');
        button.querySelector('.c2').textContent = '+1';
    }, 1000);
}

function updateScores() {
    p1.textContent = p1Score;
    p2.textContent = p2Score;
}

b1button.addEventListener('click', () => {
    if (!isgameOver) {
        p1Score += 1;
        if (p1Score === winningScore) {
            isgameOver = true;
        }
        updateScores();
        updateButtonText(b1button);
    }
});

b2button.addEventListener('click', () => {
    if (!isgameOver) {
        p2Score += 1;
        if (p2Score === winningScore) {
            isgameOver = true;
        }
        updateScores();
        updateButtonText(b2button);
    }
});

scoreSelect.addEventListener('change', (event) => {
    winningScore = parseInt(event.target.value);
    resetGame();
});

resetbutton.addEventListener('click', () => {
    resetGame();
});
