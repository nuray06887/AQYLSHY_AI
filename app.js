// ДЕРЕКТЕРДІ САҚТАУ
let data = JSON.parse(localStorage.getItem("aqylshyData") || "{}");

data = {
    goalName: data.goalName || "Арманға алғашқы қадам",
    goalTarget: Number(data.goalTarget) || 300000,
    goalSaved: Number(data.goalSaved) || 0,
    income: Number(data.income) || 0,
    expenses: Number(data.expenses) || 0,
    streak: Number(data.streak) || 0,
    streakDate: data.streakDate || "",
    userName: data.userName || "",
    userAge: data.userAge || "",
    userStatus: data.userStatus || "Студент"
};

function saveData() {
    localStorage.setItem("aqylshyData", JSON.stringify(data));
    updateDashboard();
}

// БЕТТЕР АРАСЫНДА АУЫСУ
const pageNames = {
    home: "Басты бет",
    plan: "Менің жоспарым",
    game: "Ақша жинау ойыны",
    test: "Қаржылық тест",
    chat: "AI көмекші",
    profile: "Профиль"
};

function openPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    document.querySelectorAll(".nav").forEach(button => {
        if (button.dataset.page === page) {
            button.classList.add("active");
        }
    });

    document.getElementById("pageTitle").textContent = pageNames[page];
}

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

// АҚША ФОРМАТЫ
function money(number) {
    return new Intl.NumberFormat("kk-KZ").format(number) + " ₸";
}

// БАСТЫ БЕТТІ ЖАҢАРТУ
function updateDashboard() {
    const balance = data.income - data.expenses;

    const percent = data.goalTarget > 0
        ? Math.min(100, Math.round(data.goalSaved / data.goalTarget * 100))
        : 0;

    document.getElementById("balance").textContent = money(balance);
    document.getElementById("incomeStat").textContent = money(data.income);
    document.getElementById("expenseStat").textContent = money(data.expenses);
    document.getElementById("goalPercent").textContent = percent + "%";

    document.getElementById("homeGoal").textContent = data.goalName;
    document.getElementById("homeSaved").textContent = money(data.goalSaved);
    document.getElementById("homeTarget").textContent = money(data.goalTarget);
    document.getElementById("homeProgress").style.width = percent + "%";

    document.getElementById("streak").textContent = data.streak;
    document.getElementById("gameProgress").style.width =
        (data.streak / 7 * 100) + "%";

    document.getElementById("plant").textContent =
        data.streak >= 7 ? "🌳" :
        data.streak >= 5 ? "🪴" :
        data.streak >= 3 ? "🌿" :
        data.streak >= 1 ? "🌱" : "🌰";
}

// МАҚСАТТЫ САҚТАУ
function saveGoal() {
    const name = document.getElementById("goalName").value.trim();
    const target = Number(document.getElementById("goalTarget").value);
    const saved = Number(document.getElementById("goalSaved").value);

    if (!name || !Number.isFinite(target) || !Number.isFinite(saved)
        || target <= 0 || saved < 0) {
        alert("Мақсат атауы мен сомаларды дұрыс енгіз!");
        return;
    }

    data.goalName = name;
    data.goalTarget = target;
    data.goalSaved = saved;

    saveData();
    alert("Мақсатың сәтті сақталды! 💚");
}

// БЮДЖЕТТІ САҚТАУ
function saveBudget() {
    const income = Number(document.getElementById("income").value);
    const expenses = Number(document.getElementById("expenses").value);

    if (!Number.isFinite(income) || !Number.isFinite(expenses)
        || income < 0 || expenses < 0) {
        alert("Кіріс пен шығысты дұрыс енгіз!");
        return;
    }

    data.income = income;
    data.expenses = expenses;

    saveData();

    const result = income - expenses;

    document.getElementById("budgetResult").textContent =
        "Ай соңындағы қалдық: " + money(result);
}

// ОЙЫН
function completeDay() {
    const today = new Date().toLocaleDateString("en-CA");

    if (data.streakDate === today) {
        document.getElementById("gameMessage").textContent =
            "Бүгінгі қадамың белгіленген! Ертең қайта кел 💚";
        return;
    }

    data.streak = Math.min(7, data.streak + 1);
    data.streakDate = today;

    saveData();

    document.getElementById("gameMessage").textContent =
        data.streak === 7
            ? "Құттықтаймыз! Сен — Жинақ шеберісің! 🏆"
            : "Керемет! Тағы бір қадам жасадың! 🌱";
}

// ҚАРЖЫЛЫҚ ТЕСТ
const questions = [
    {
        q: "Бюджет дегеніміз не?",
        a: ["Ақшаны жоспарлау", "Несие түрі", "Банк картасы"],
        c: 0
    },
    {
        q: "Жинақ дегеніміз не?",
        a: ["Барлық ақшаны жұмсау", "Болашаққа сақталған ақша", "Қарыз"],
        c: 1
    },
    {
        q: "Кіріс дегеніміз не?",
        a: ["Жұмсалған ақша", "Алынған ақша", "Қарыз"],
        c: 1
    },
    {
        q: "50/30/20 ережесіндегі 20% не үшін?",
        a: ["Ойын-сауық", "Жинақ пен қарызды өтеу", "Тамақ"],
        c: 1
    },
    {
        q: "Қаржылық мақсат не үшін керек?",
        a: ["Ақшаны жоспарлау", "Ақшаны жоғалту", "Қарыз алу"],
        c: 0
    }
];

let questionIndex = 0;
let score = 0;
let answered = false;

function showQuestion() {
    const q = questions[questionIndex];

    document.getElementById("questionNumber").textContent =
        (questionIndex + 1) + " / " + questions.length;

    document.getElementById("question").textContent = q.q;
    document.getElementById("answerInfo").textContent = "";
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("answers").innerHTML = "";

    answered = false;

    q.a.forEach((answer, index) => {
        const button = document.createElement("button");

        button.className = "answer";
        button.textContent = answer;

        button.onclick = () => selectAnswer(index);

        document.getElementById("answers").appendChild(button);
    });
}

function selectAnswer(index) {
    if (answered) return;

    answered = true;

    const q = questions[questionIndex];
    const buttons = document.querySelectorAll(".answer");

    buttons.forEach((button, i) => {
        button.disabled = true;

        if (i === q.c) {
            button.classList.add("correct");
        }

        if (i === index && index !== q.c) {
            button.classList.add("wrong");
        }
    });

    if (index === q.c) {
        score++;
        document.getElementById("answerInfo").textContent =
            "Дұрыс жауап! ✓";
    } else {
        document.getElementById("answerInfo").textContent =
            "Дұрыс жауап: " + q.a[q.c];
    }

    document.getElementById("nextBtn").disabled = false;
}

function nextQuestion() {
    if (!answered) return;

    questionIndex++;

    if (questionIndex < questions.length) {
        showQuestion();
    } else {
        document.getElementById("question").textContent = "Тест аяқталды!";
        document.getElementById("answers").innerHTML = "";
        document.getElementById("questionNumber").textContent = "НӘТИЖЕ";

        document.getElementById("answerInfo").textContent =
            "Сенің нәтижең: " + score + " / 5";

        document.getElementById("nextBtn").hidden = true;
        document.getElementById("restartBtn").hidden = false;
    }
}

function restartQuiz() {
    questionIndex = 0;
    score = 0;

    document.getElementById("nextBtn").hidden = false;
    document.getElementById("restartBtn").hidden = true;

    showQuestion();
}

// AI КӨМЕКШІ — ДЕМО
function getBotAnswer(message) {
    const text = message.toLowerCase();

    if (text.includes("жина") || text.includes("ақша")) {
        return "Ақша жинау үшін нақты мақсат қой. Мысалы, 3 айда 30 000 ₸ жинағың келсе, айына 10 000 ₸ бөлуге болады.";
    }

    if (text.includes("бюджет")) {
        return "Бюджет құру үшін алдымен кірісің мен шығысыңды жаз. Содан кейін қажеттіліктерге, қалауыңа және жинаққа ақша бөл.";
    }

    if (text.includes("несие") || text.includes("қарыз")) {
        return "Несие алмас бұрын пайыздық мөлшерлемені, жалпы қайтарылатын соманы және ай сайынғы төлемді мұқият есепте.";
    }

    if (text.includes("студент") || text.includes("оқушы")) {
        return "Студентке қарапайым бюджеттен бастаған дұрыс. Жолақы, тамақ және оқу шығындарын есептеп, аз болса да жинақ жаса.";
    }

    return "Мақсатыңды нақтылап көрейік! Қанша ақша жинағың келеді және оған қанша уақыт бөлесің?";
}

document.getElementById("chatForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    const messages = document.getElementById("messages");

    const user = document.createElement("div");
    user.className = "user-message";
    user.textContent = message;

    messages.appendChild(user);

    const bot = document.createElement("div");
    bot.className = "bot-message";
    bot.textContent = getBotAnswer(message);

    messages.appendChild(bot);

    input.value = "";
    messages.scrollTop = messages.scrollHeight;
});

// ПРОФИЛЬ
function saveProfile() {
    const name = document.getElementById("userName").value.trim();
    const age = document.getElementById("userAge").value;
    const status = document.getElementById("userStatus").value;

    if (!name || !age || Number(age) <= 0) {
        alert("Атың мен жасыңды дұрыс енгіз!");
        return;
    }

    data.userName = name;
    data.userAge = age;
    data.userStatus = status;

    saveData();

    document.getElementById("profileMessage").textContent =
        "Сақталды! Сәлем, " + name + " 💚";
}

// БҰРЫН САҚТАЛҒАН МӘЛІМЕТТЕРДІ ШЫҒАРУ
function loadInputs() {
    document.getElementById("goalName").value = data.goalName;
    document.getElementById("goalTarget").value = data.goalTarget;
    document.getElementById("goalSaved").value = data.goalSaved;

    document.getElementById("income").value = data.income || "";
    document.getElementById("expenses").value = data.expenses || "";

    document.getElementById("userName").value = data.userName;
    document.getElementById("userAge").value = data.userAge;
    document.getElementById("userStatus").value = data.userStatus;
}

// БАҒДАРЛАМАНЫ ІСКЕ ҚОСУ
loadInputs();
updateDashboard();
showQuestion();