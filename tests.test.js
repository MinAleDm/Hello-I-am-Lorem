const { greetUser, reset, reverseName, generateRandomGreeting } = require('./script.js');

describe('Тесты для веб-приложения', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="text" id="nameInput">
            <p id="greetingMessage" class="message"></p>
            <p id="errorMessage" class="error"></p>
        `;
    });

    test('Приветствие пользователя', () => {
        document.getElementById('nameInput').value = 'Александр';
        greetUser();
        const greetingMessage = document.getElementById('greetingMessage').innerText;
        const errorMessage = document.getElementById('errorMessage').innerText;

        expect(greetingMessage).toBe('Привет, Александр!');
        expect(errorMessage).toBe('');
    });

    test('Проверка на пустой ввод имени', () => {
        document.getElementById('nameInput').value = '';
        greetUser();
        const greetingMessage = document.getElementById('greetingMessage').innerText;
        const errorMessage = document.getElementById('errorMessage').innerText;

        expect(greetingMessage).toBe('');
        expect(errorMessage).toBe('Пожалуйста, введите ваше имя!');
    });

    test('Перевернуть имя', () => {
        document.getElementById('nameInput').value = 'Александр';
        reverseName();
        const greetingMessage = document.getElementById('greetingMessage').innerText;
        const errorMessage = document.getElementById('errorMessage').innerText;

        expect(greetingMessage).toBe('Ваше имя наоборот: рднаскелА');
        expect(errorMessage).toBe('');
    });

    test('Проверка на пустой ввод при перевороте имени', () => {
        document.getElementById('nameInput').value = '';
        reverseName();
        const greetingMessage = document.getElementById('greetingMessage').innerText;
        const errorMessage = document.getElementById('errorMessage').innerText;

        expect(greetingMessage).toBe('');
        expect(errorMessage).toBe('Пожалуйста, введите ваше имя!');
    });

    test('Случайное приветствие', () => {
        generateRandomGreeting();
        const greetingMessage = document.getElementById('greetingMessage').innerText;
        const errorMessage = document.getElementById('errorMessage').innerText;

        const greetings = [
            'Привет, друг!',
            'Здравствуйте!',
            'Добро пожаловать!',
            'Как дела?',
            'Салют!',
        ];

        expect(greetings).toContain(greetingMessage);
        expect(errorMessage).toBe('');
    });
});
