(function (global) {
    const STORAGE_KEY = "hello-i-am-lorem-history-v2";
    const DEFAULT_MODE = "focus";
    const MAX_HISTORY_ITEMS = 6;
    const VOWELS = "аеёиоуыэюяaeiouy";

    const modeConfig = {
        focus: {
            label: "Фокус",
            aura: "Точный ритм",
            greetingStyle: "собранный",
            prompts: [
                "сегодня звучит как человек, который доводит идеи до результата.",
                "собирает хаос в ясную последовательность шагов.",
                "умеет превращать хорошее намерение в понятный план."
            ]
        },
        creative: {
            label: "Креатив",
            aura: "Искра воображения",
            greetingStyle: "изобретательный",
            prompts: [
                "похоже на имя, которое умеет находить неожиданные ракурсы.",
                "включает режим, где идеи приходят быстрее сомнений.",
                "звучит так, будто рядом уже рождается новая история."
            ]
        },
        calm: {
            label: "Спокойствие",
            aura: "Тихая опора",
            greetingStyle: "мягкий",
            prompts: [
                "сегодня приносит в пространство устойчивость и воздух.",
                "звучит как имя, рядом с которым решения принимаются чище.",
                "напоминает, что сила бывает очень спокойной."
            ]
        },
        bold: {
            label: "Смелость",
            aura: "Энергия движения",
            greetingStyle: "дерзкий",
            prompts: [
                "входит в комнату как сигнал, что пора действовать.",
                "несёт в себе ощущение старта и внутреннего импульса.",
                "звучит так, будто осторожность уже уступила место инициативе."
            ]
        }
    };

    const archetypes = [
        "Архитектор идей",
        "Хранитель темпа",
        "Проводник изменений",
        "Коллекционер смыслов",
        "Навигатор внимания",
        "Собиратель импульсов"
    ];

    const compliments = [
        "У твоего имени отличная энергия для сильного первого впечатления.",
        "Это имя хорошо держит ритм и легко запоминается.",
        "В нём есть мягкость, которую поддерживает внутренняя уверенность.",
        "Такое имя звучит как личный бренд, у которого уже есть характер.",
        "Оно оставляет ощущение ясности и аккуратной силы."
    ];

    const recommendations = [
        "Сделай один шаг, который даст результат уже сегодня.",
        "Выбери задачу, которую давно хотелось закрыть красиво.",
        "Оставь место для эксперимента, но не теряй структуру.",
        "Собери внимание вокруг главного и убери шум.",
        "Скажи своей идее не только «интересно», но и «поехали»."
    ];

    const randomGreetings = [
        "Привет! Сегодня отличный день, чтобы обновить собственную историю.",
        "Салют! У хороших проектов всегда есть характер, и у тебя тоже.",
        "Добро пожаловать в студию имени: здесь даже простое приветствие звучит богаче.",
        "Привет! Иногда одно имя уже задаёт настроение всему дню.",
        "На сцене новый сигнал: пора собрать фокус, смелость или креатив."
    ];

    let dom = {};
    let isBound = false;

    function normalizeName(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function hasLetters(value) {
        return /[A-Za-zА-Яа-яЁё]/.test(value);
    }

    function isValidName(value) {
        const normalized = normalizeName(value);
        return normalized.length > 0 && hasLetters(normalized);
    }

    function reverseText(value) {
        return normalizeName(value).split("").reverse().join("");
    }

    function getMode(mode) {
        return modeConfig[mode] || modeConfig[DEFAULT_MODE];
    }

    function hashString(value) {
        let hash = 0;
        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
        }
        return hash;
    }

    function pickByHash(items, hash, offset) {
        if (!items.length) {
            return "";
        }
        return items[(hash + offset) % items.length];
    }

    function getNameMetrics(name) {
        const normalized = normalizeName(name);
        const letters = normalized.replace(/[^A-Za-zА-Яа-яЁё]/g, "");
        const characters = Array.from(letters);
        const vowels = characters.filter((letter) => VOWELS.includes(letter.toLowerCase())).length;
        const consonants = characters.length - vowels;

        return {
            length: characters.length,
            vowels,
            consonants,
            firstLetter: characters[0] ? characters[0].toUpperCase() : "-"
        };
    }

    function buildNameProfile(name, mode, now) {
        const normalizedName = normalizeName(name);
        if (!isValidName(normalizedName)) {
            return null;
        }

        const safeMode = mode || DEFAULT_MODE;
        const activeMode = getMode(safeMode);
        const date = now instanceof Date ? now : new Date();
        const seed = hashString(`${normalizedName}:${safeMode}`);
        const metrics = getNameMetrics(normalizedName);
        const reversedName = reverseText(normalizedName);
        const archetype = pickByHash(archetypes, seed, 0);
        const compliment = pickByHash(compliments, seed, 1);
        const recommendation = pickByHash(recommendations, seed, 2);
        const statement = pickByHash(activeMode.prompts, seed, 3);
        const hour = date.getHours();
        const timeGreeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
        const greeting = `${timeGreeting}, ${normalizedName}. Твой режим сегодня: ${activeMode.label.toLowerCase()}.`;

        return {
            normalizedName,
            mode: safeMode,
            modeLabel: activeMode.label,
            aura: activeMode.aura,
            archetype,
            compliment,
            recommendation,
            reversedName,
            metrics,
            greeting,
            headline: `${normalizedName} — ${archetype}`,
            narrative: `${normalizedName} ${statement}`,
            createdAt: date.toISOString()
        };
    }

    function createHistoryEntry(profile) {
        return {
            id: `${profile.normalizedName}-${profile.mode}-${profile.createdAt}`,
            name: profile.normalizedName,
            mode: profile.mode,
            modeLabel: profile.modeLabel,
            aura: profile.aura,
            archetype: profile.archetype,
            greeting: profile.greeting,
            createdAt: profile.createdAt
        };
    }

    function canUseStorage() {
        return typeof global.localStorage !== "undefined";
    }

    function loadHistory() {
        if (!canUseStorage()) {
            return [];
        }

        try {
            const raw = global.localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveHistory(history) {
        if (!canUseStorage()) {
            return history;
        }

        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return history;
    }

    function clearStoredHistory() {
        return saveHistory([]);
    }

    function pushHistory(entry) {
        const nextHistory = [entry]
            .concat(loadHistory().filter((item) => item.id !== entry.id))
            .slice(0, MAX_HISTORY_ITEMS);

        return saveHistory(nextHistory);
    }

    function computeDashboard(history) {
        const items = Array.isArray(history) ? history : [];

        if (!items.length) {
            return {
                totalSessions: 0,
                uniqueNames: 0,
                favoriteMood: "Пока нет"
            };
        }

        const uniqueNames = new Set(items.map((item) => item.name.toLowerCase())).size;
        const counters = items.reduce((accumulator, item) => {
            accumulator[item.modeLabel] = (accumulator[item.modeLabel] || 0) + 1;
            return accumulator;
        }, {});

        const favoriteMood = Object.entries(counters)
            .sort((left, right) => right[1] - left[1])[0][0];

        return {
            totalSessions: items.length,
            uniqueNames,
            favoriteMood
        };
    }

    function formatDate(isoString) {
        const value = new Date(isoString);
        if (Number.isNaN(value.getTime())) {
            return "в неизвестное время";
        }

        return new Intl.DateTimeFormat("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }).format(value);
    }

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    function ensureDom() {
        if (typeof document === "undefined") {
            return;
        }

        if (!dom.greetingMessage || !dom.greetingMessage.isConnected) {
            cacheDom();
        }
    }

    function setMessage(text, state) {
        if (dom.greetingMessage) {
            dom.greetingMessage.textContent = text;
            dom.greetingMessage.dataset.state = state || "default";
        }
    }

    function renderInsights(lines) {
        if (!dom.profileInsights) {
            return;
        }

        dom.profileInsights.innerHTML = "";
        lines.forEach((line) => {
            const item = document.createElement("li");
            item.textContent = line;
            dom.profileInsights.appendChild(item);
        });
    }

    function renderDashboard(history) {
        const stats = computeDashboard(history);
        setText(dom.statsSessions, String(stats.totalSessions));
        setText(dom.statsUniqueNames, String(stats.uniqueNames));
        setText(dom.statsFavoriteMood, stats.favoriteMood);
    }

    function renderHistory(history) {
        if (!dom.historyList) {
            return;
        }

        dom.historyList.innerHTML = "";

        if (!history.length) {
            const empty = document.createElement("div");
            empty.className = "history-empty";
            empty.textContent = "Пока пусто. Проведи первую сессию, и Лорем начнёт собирать локальную историю.";
            dom.historyList.appendChild(empty);
            return;
        }

        history.forEach((entry) => {
            const wrapper = document.createElement("article");
            wrapper.className = "history-entry";

            const top = document.createElement("div");
            top.className = "history-entry-top";

            const title = document.createElement("strong");
            title.textContent = `${entry.name} — ${entry.archetype}`;

            const badge = document.createElement("span");
            badge.className = "message-pill";
            badge.textContent = entry.modeLabel;

            top.appendChild(title);
            top.appendChild(badge);

            const meta = document.createElement("p");
            meta.className = "history-meta";
            meta.textContent = `${entry.greeting} Сохранено ${formatDate(entry.createdAt)}.`;

            const action = document.createElement("button");
            action.type = "button";
            action.className = "button-ghost button-small history-action";
            action.dataset.historyId = entry.id;
            action.textContent = "Повторить сценарий";

            wrapper.appendChild(top);
            wrapper.appendChild(meta);
            wrapper.appendChild(action);
            dom.historyList.appendChild(wrapper);
        });
    }

    function renderEmptyState() {
        setText(dom.greetingTitle, "Здесь появится история после первой сессии.");
        setMessage(
            "Лорем умеет не только поздороваться, но и превратить имя в маленький цифровой портрет.",
            "default"
        );
        setText(dom.messagePill, "Ожидание");

        renderInsights([
            "Длина, первая буква и зеркальная версия имени появятся здесь.",
            "Режим взаимодействия добавит тон и настроение.",
            "Каждая успешная сессия попадёт в локальную историю."
        ]);
    }

    function renderProfile(profile) {
        setText(dom.greetingTitle, profile.headline);
        setMessage(`${profile.greeting} ${profile.narrative}`, "success");
        setText(dom.messagePill, `${profile.modeLabel} · ${profile.aura}`);

        renderInsights([
            `Первая буква: ${profile.metrics.firstLetter}. Символов в имени: ${profile.metrics.length}.`,
            `Гласных: ${profile.metrics.vowels}, согласных: ${profile.metrics.consonants}. Зеркальная версия: ${profile.reversedName}.`,
            `${profile.compliment} ${profile.recommendation}`
        ]);
    }

    function showError(message) {
        setText(dom.errorMessage, message || "");
    }

    function runProfileFlow(name, mode) {
        if (!isValidName(name)) {
            showError("Введите имя, в котором есть хотя бы одна буква.");
            setText(dom.greetingTitle, "Нужен сигнал для старта.");
            setMessage("Пустой ввод не даёт Лорему материал для персонального сценария.", "default");
            setText(dom.messagePill, "Ожидание");
            return null;
        }

        showError("");
        const profile = buildNameProfile(name, mode, new Date());
        renderProfile(profile);
        const nextHistory = pushHistory(createHistoryEntry(profile));
        renderHistory(nextHistory);
        renderDashboard(nextHistory);
        return profile;
    }

    function greetUser() {
        ensureDom();
        const name = dom.nameInput ? dom.nameInput.value : "";
        const mode = dom.modeSelect ? dom.modeSelect.value : DEFAULT_MODE;
        return runProfileFlow(name, mode);
    }

    function reverseName() {
        ensureDom();
        const name = dom.nameInput ? dom.nameInput.value : "";
        if (!isValidName(name)) {
            showError("Чтобы отразить имя, сначала введи его.");
            setMessage("", "default");
            return "";
        }

        showError("");
        const normalized = normalizeName(name);
        const reversed = reverseText(normalized);
        const mode = dom.modeSelect ? dom.modeSelect.value : DEFAULT_MODE;
        const activeMode = getMode(mode);

        setText(dom.greetingTitle, `${normalized}, твоя зеркальная версия готова.`);
        setMessage(`Имя в зеркале: ${reversed}. Иногда новый ракурс начинается с одной строки.`, "mirror");
        setText(dom.messagePill, `${activeMode.label} · Режим отражения`);

        renderInsights([
            `Исходное имя: ${normalized}. Отражённая форма: ${reversed}.`,
            `Тон выбранного режима: ${activeMode.greetingStyle}. Аура: ${activeMode.aura}.`,
            "Используй отражение как короткий визуальный приём для hero-блоков, карточек или никнейма."
        ]);

        return reversed;
    }

    function getRandomGreeting() {
        const index = Math.floor(Math.random() * randomGreetings.length);
        return randomGreetings[index];
    }

    function generateRandomGreeting() {
        ensureDom();
        showError("");
        const mode = dom.modeSelect ? dom.modeSelect.value : DEFAULT_MODE;
        const activeMode = getMode(mode);
        const greeting = getRandomGreeting();

        setText(dom.greetingTitle, "Случайный импульс от Лорема");
        setMessage(`${greeting} Активный режим: ${activeMode.label.toLowerCase()}.`, "random");
        setText(dom.messagePill, `${activeMode.label} · Быстрый сигнал`);

        renderInsights([
            `Режим ${activeMode.label.toLowerCase()} добавляет сценарию оттенок: ${activeMode.aura}.`,
            "Случайный импульс хорошо подходит для первого экрана, демо или быстрой проверки UI.",
            "Если захочешь глубже, вернись к полному профилю имени и Лорем соберёт более точный портрет."
        ]);

        return greeting;
    }

    function reset() {
        ensureDom();
        if (dom.nameForm) {
            dom.nameForm.reset();
        } else if (dom.nameInput) {
            dom.nameInput.value = "";
        }

        showError("");
        renderEmptyState();

        const history = loadHistory();
        renderHistory(history);
        renderDashboard(history);
        return true;
    }

    function applyHistoryEntry(entryId) {
        ensureDom();
        const history = loadHistory();
        const entry = history.find((item) => item.id === entryId);
        if (!entry) {
            return null;
        }

        if (dom.nameInput) {
            dom.nameInput.value = entry.name;
        }
        if (dom.modeSelect) {
            dom.modeSelect.value = entry.mode;
        }

        const profile = buildNameProfile(entry.name, entry.mode, new Date(entry.createdAt));
        if (profile) {
            showError("");
            renderProfile(profile);
        }

        return profile;
    }

    function handleHistoryClick(event) {
        const target = event.target.closest("[data-history-id]");
        if (!target) {
            return;
        }

        applyHistoryEntry(target.dataset.historyId);
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        navigator.serviceWorker.register("./service-worker.js").catch(function () {
            return null;
        });
    }

    function bindEvents() {
        if (isBound) {
            return;
        }

        if (dom.nameForm) {
            dom.nameForm.addEventListener("submit", function (event) {
                event.preventDefault();
                greetUser();
            });
        }

        if (dom.randomGreetingButton) {
            dom.randomGreetingButton.addEventListener("click", generateRandomGreeting);
        }

        if (dom.reverseNameButton) {
            dom.reverseNameButton.addEventListener("click", reverseName);
        }

        if (dom.resetButton) {
            dom.resetButton.addEventListener("click", reset);
        }

        if (dom.clearHistoryButton) {
            dom.clearHistoryButton.addEventListener("click", function () {
                clearStoredHistory();
                renderHistory([]);
                renderDashboard([]);
            });
        }

        if (dom.historyList) {
            dom.historyList.addEventListener("click", handleHistoryClick);
        }

        isBound = true;
    }

    function cacheDom() {
        dom = {
            nameForm: document.getElementById("nameForm"),
            nameInput: document.getElementById("nameInput"),
            modeSelect: document.getElementById("modeSelect"),
            greetButton: document.getElementById("greetButton"),
            randomGreetingButton: document.getElementById("randomGreetingButton"),
            reverseNameButton: document.getElementById("reverseNameButton"),
            resetButton: document.getElementById("resetButton"),
            greetingTitle: document.getElementById("greetingTitle"),
            greetingMessage: document.getElementById("greetingMessage"),
            messagePill: document.getElementById("messagePill"),
            errorMessage: document.getElementById("errorMessage"),
            profileInsights: document.getElementById("profileInsights"),
            historyList: document.getElementById("historyList"),
            clearHistoryButton: document.getElementById("clearHistoryButton"),
            statsSessions: document.getElementById("statsSessions"),
            statsUniqueNames: document.getElementById("statsUniqueNames"),
            statsFavoriteMood: document.getElementById("statsFavoriteMood")
        };
    }

    function initApp() {
        if (typeof document === "undefined") {
            return;
        }

        cacheDom();

        if (!dom.greetingMessage) {
            return;
        }

        renderEmptyState();
        const history = loadHistory();
        renderHistory(history);
        renderDashboard(history);
        bindEvents();
        registerServiceWorker();
    }

    const api = {
        normalizeName,
        reverseText,
        getNameMetrics,
        buildNameProfile,
        computeDashboard,
        loadHistory,
        saveHistory,
        clearStoredHistory,
        getRandomGreeting,
        greetUser,
        reset,
        reverseName,
        generateRandomGreeting,
        initApp
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    global.HelloIAmLorem = api;

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initApp);
        } else {
            initApp();
        }
    }
})(typeof window !== "undefined" ? window : globalThis);
