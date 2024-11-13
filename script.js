function greetUser() {
    const name = document.getElementById('nameInput').value.trim();
    const greetingMessage = document.getElementById('greetingMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (name) {
        greetingMessage.innerText = `Привет, ${name}!`;
        errorMessage.innerText = '';
    } else {
        errorMessage.innerText = 'Пожалуйста, введите ваше имя!';
        greetingMessage.innerText = '';
    }
}

function reset() {
    document.getElementById('nameInput').value = '';
    document.getElementById('greetingMessage').innerText = '';
    document.getElementById('errorMessage').innerText = '';
}

function reverseName() {
    const name = document.getElementById('nameInput').value.trim();
    const greetingMessage = document.getElementById('greetingMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (name) {
        const reversedName = name.split('').reverse().join('');
        greetingMessage.innerText = `Ваше имя наоборот: ${reversedName}`;
        errorMessage.innerText = '';
    } else {
        errorMessage.innerText = 'Пожалуйста, введите ваше имя!';
        greetingMessage.innerText = '';
    }
}

function generateRandomGreeting() {
    const greetings = [
        'Привет, друг!',
        'Здравствуйте!',
        'Добро пожаловать!',
        'Как дела?',
        'Салют!',
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const greetingMessage = document.getElementById('greetingMessage');
    greetingMessage.innerText = randomGreeting;
    document.getElementById('errorMessage').innerText = '';
}

module.exports = { greetUser, reset, reverseName, generateRandomGreeting };