const elements = {
    totalTests: document.getElementById("totalTests"),
    passedTests: document.getElementById("passedTests"),
    failedTests: document.getElementById("failedTests"),
    totalSuites: document.getElementById("totalSuites"),
    passRate: document.getElementById("passRate"),
    statusMessage: document.getElementById("statusMessage"),
    testSuites: document.getElementById("testSuites")
};

function setSummaryValue(key, value) {
    if (elements[key]) {
        elements[key].textContent = String(value);
    }
}

function renderEmpty(message) {
    elements.passRate.textContent = "Нет свежего отчёта";
    elements.passRate.classList.add("warning");
    elements.statusMessage.textContent = message;
    elements.testSuites.innerHTML = "";
}

function createAssertionItem(assertion) {
    const item = document.createElement("article");
    item.className = "assertion";

    const title = document.createElement("strong");
    title.textContent = assertion.title;

    const meta = document.createElement("span");
    meta.className = `assertion-status ${assertion.status}`;
    meta.textContent = `${assertion.status} · ${assertion.duration ?? 0} мс`;

    item.appendChild(title);
    item.appendChild(meta);
    return item;
}

function renderReport(results) {
    const total = results.numTotalTests ?? 0;
    const passed = results.numPassedTests ?? 0;
    const failed = results.numFailedTests ?? 0;
    const suites = results.numTotalTestSuites ?? 0;
    const ratio = total > 0 ? Math.round((passed / total) * 100) : 0;

    setSummaryValue("totalTests", total);
    setSummaryValue("passedTests", passed);
    setSummaryValue("failedTests", failed);
    setSummaryValue("totalSuites", suites);

    elements.passRate.textContent = `${ratio}% pass rate`;
    elements.passRate.classList.toggle("warning", failed > 0);
    elements.passRate.classList.toggle("success", failed === 0 && total > 0);
    elements.statusMessage.textContent = failed === 0
        ? "Тестовый набор выглядит стабильно. Это хороший сигнал перед публикацией на GitHub."
        : "Есть упавшие проверки. Перед публикацией лучше ещё раз прогнать пакет локально.";

    elements.testSuites.innerHTML = "";

    (results.testResults || []).forEach((suite) => {
        const card = document.createElement("section");
        card.className = "suite-card";

        const title = document.createElement("h3");
        title.textContent = suite.name;

        const list = document.createElement("div");
        list.className = "assertion-list";

        (suite.assertionResults || []).forEach((assertion) => {
            list.appendChild(createAssertionItem(assertion));
        });

        card.appendChild(title);
        card.appendChild(list);
        elements.testSuites.appendChild(card);
    });
}

fetch("test-results.json", { cache: "no-store" })
    .then((response) => {
        if (!response.ok) {
            throw new Error("report_not_found");
        }
        return response.text();
    })
    .then((text) => {
        if (!text.trim()) {
            throw new Error("report_empty");
        }
        return JSON.parse(text);
    })
    .then(renderReport)
    .catch(() => {
        renderEmpty("Отчёт пока не сформирован. Запусти `npm install`, затем `npm run test:report`, и панель обновится.");
    });
