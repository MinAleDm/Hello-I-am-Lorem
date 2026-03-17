const {
    normalizeName,
    reverseText,
    getNameMetrics,
    buildNameProfile,
    computeDashboard,
    getRandomGreeting,
    greetUser,
    reset,
    reverseName,
    generateRandomGreeting,
    clearStoredHistory
} = require('../src/scripts/app.js');

describe('Hello, I am Lorem', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="nameForm">
                <input type="text" id="nameInput">
                <select id="modeSelect">
                    <option value="focus" selected>Фокус</option>
                    <option value="creative">Креатив</option>
                </select>
            </form>
            <h2 id="greetingTitle"></h2>
            <p id="greetingMessage" class="message"></p>
            <div id="messagePill"></div>
            <p id="errorMessage" class="error"></p>
            <ul id="profileInsights"></ul>
            <div id="historyList"></div>
            <span id="statsSessions"></span>
            <span id="statsUniqueNames"></span>
            <span id="statsFavoriteMood"></span>
            <button id="randomGreetingButton" type="button"></button>
            <button id="reverseNameButton" type="button"></button>
            <button id="resetButton" type="button"></button>
            <button id="clearHistoryButton" type="button"></button>
        `;

        localStorage.clear();
        clearStoredHistory();
    });

    test('normalizeName убирает лишние пробелы', () => {
        expect(normalizeName('   Анна   Мария  ')).toBe('Анна Мария');
    });

    test('reverseText отражает имя', () => {
        expect(reverseText('Александр')).toBe('рднаскелА');
    });

    test('getNameMetrics считает длину, гласные и согласные', () => {
        expect(getNameMetrics('Анна')).toEqual({
            length: 4,
            vowels: 2,
            consonants: 2,
            firstLetter: 'А'
        });
    });

    test('buildNameProfile собирает устойчивый профиль', () => {
        const fixedDate = new Date('2026-03-17T10:00:00.000Z');
        const profile = buildNameProfile('Александр', 'focus', fixedDate);

        expect(profile).toMatchObject({
            normalizedName: 'Александр',
            mode: 'focus',
            modeLabel: 'Фокус',
            reversedName: 'рднаскелА'
        });
        expect(profile.headline).toContain('Александр');
        expect(profile.greeting).toContain('Александр');
    });

    test('computeDashboard считает базовую аналитику', () => {
        const dashboard = computeDashboard([
            { name: 'Анна', modeLabel: 'Фокус' },
            { name: 'Иван', modeLabel: 'Креатив' },
            { name: 'Анна', modeLabel: 'Фокус' }
        ]);

        expect(dashboard).toEqual({
            totalSessions: 3,
            uniqueNames: 2,
            favoriteMood: 'Фокус'
        });
    });

    test('getRandomGreeting возвращает одну из заготовленных фраз', () => {
        const greeting = getRandomGreeting();

        expect(typeof greeting).toBe('string');
        expect(greeting.length).toBeGreaterThan(10);
    });

    test('greetUser создаёт профиль, обновляет DOM и историю', () => {
        document.getElementById('nameInput').value = 'Александр';

        const profile = greetUser();

        expect(profile.normalizedName).toBe('Александр');
        expect(document.getElementById('greetingTitle').textContent).toContain('Александр');
        expect(document.getElementById('greetingMessage').textContent).toContain('Александр');
        expect(document.getElementById('errorMessage').textContent).toBe('');
        expect(document.getElementById('historyList').textContent).toContain('Александр');
        expect(document.getElementById('statsSessions').textContent).toBe('1');
    });

    test('greetUser показывает ошибку при пустом имени', () => {
        document.getElementById('nameInput').value = '';

        const profile = greetUser();

        expect(profile).toBeNull();
        expect(document.getElementById('errorMessage').textContent).toBe('Введите имя, в котором есть хотя бы одна буква.');
    });

    test('reverseName показывает отражённое имя', () => {
        document.getElementById('nameInput').value = 'Александр';

        const reversed = reverseName();

        expect(reversed).toBe('рднаскелА');
        expect(document.getElementById('greetingMessage').textContent).toContain('Имя в зеркале: рднаскелА');
    });

    test('generateRandomGreeting обновляет интерфейс случайной фразой', () => {
        const greeting = generateRandomGreeting();

        expect(typeof greeting).toBe('string');
        expect(document.getElementById('greetingTitle').textContent).toBe('Случайный импульс от Лорема');
        expect(document.getElementById('greetingMessage').textContent).toContain(greeting);
    });

    test('reset очищает форму и возвращает стартовое состояние', () => {
        document.getElementById('nameInput').value = 'Анна';
        greetUser();

        reset();

        expect(document.getElementById('nameInput').value).toBe('');
        expect(document.getElementById('greetingTitle').textContent).toBe('Здесь появится история после первой сессии.');
    });
});
