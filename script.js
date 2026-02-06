


// 1. КОНВЕРТЕР ВАЛЮТ


const API_KEY = 'YOUR_API_KEY_HERE'; // ← замени на свой ключ
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/RUB`;

let exchangeRates = {};

// Получаем актуальные курсы
const fetchExchangeRates = async () => {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === "success") {
            exchangeRates = data.conversion_rates;
            updateRatesDisplay();
            document.getElementById('rates-timestamp').textContent = 
                `Курсы обновлены: ${new Date().toLocaleString('ru-RU')}`;
        } else {
            showError("Не удалось загрузить курсы валют");
        }
    } catch (err) {
        showError("Ошибка сети при загрузке курсов");
        console.error(err);
    }
};

const updateRatesDisplay = () => {
    const container = document.getElementById('rates-display');
    container.innerHTML = '';

    const importantCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

    importantCurrencies.forEach(code => {
        if (exchangeRates[code]) {
            const div = document.createElement('div');
            div.className = 'rate-item';
            div.innerHTML = `
                <span class="rate-currency">${code}</span>
                <span class="rate-value">${exchangeRates[code].toFixed(2)}</span>
            `;
            container.appendChild(div);
        }
    });
};

// Конвертация валют
document.getElementById('convert-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('currency-amount').value);
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;

    if (!amount || amount <= 0) {
        showError("Введите корректную сумму");
        return;
    }

    if (!exchangeRates[from] || !exchangeRates[to]) {
        showError("Курсы для выбранных валют недоступны");
        return;
    }

    // Конвертируем через RUB
    const amountInRub = amount * exchangeRates[from];
    const result = amountInRub / exchangeRates[to];

    document.getElementById('currency-result').textContent = 
        `${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}`;
});

document.getElementById('update-rates-btn').addEventListener('click', fetchExchangeRates);


// 2. КОНВЕРТЕР ЕДИНИЦ


const distanceFactors = { km: 1, miles: 0.621371 };
const weightFactors   = { kg: 1, pounds: 2.20462 };

const convertDistance = () => {
    const value = parseFloat(document.getElementById('distance-value').value);
    const from  = document.getElementById('distance-from').value;
    const to    = document.getElementById('distance-to').value;

    if (!value && value !== 0) return;

    const inKm = value * distanceFactors[from];
    const result = inKm / distanceFactors[to];

    document.getElementById('distance-result').textContent = 
        `${value} ${from} = ${result.toFixed(3)} ${to}`;
};

const convertWeight = () => {
    const value = parseFloat(document.getElementById('weight-value').value);
    const from  = document.getElementById('weight-from').value;
    const to    = document.getElementById('weight-to').value;

    if (!value && value !== 0) return;

    const inKg = value * weightFactors[from];
    const result = inKg / weightFactors[to];

    document.getElementById('weight-result').textContent = 
        `${value} ${from} = ${result.toFixed(3)} ${to}`;
};

// Автоконвертация при вводе и изменении
['distance-value', 'distance-from', 'distance-to'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', convertDistance);
    el.addEventListener('change', convertDistance);
});

['weight-value', 'weight-from', 'weight-to'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', convertWeight);
    el.addEventListener('change', convertWeight);
});


// 3. БЮДЖЕТ ПОЕЗДКИ


let expenses = [];
let currentRates = { USD: 0, EUR: 0 };

const updateCurrentRates = () => {
    if (exchangeRates.USD) currentRates.USD = exchangeRates.USD;
    if (exchangeRates.EUR) currentRates.EUR = exchangeRates.EUR;
};

const addExpense = () => {
    const name     = document.getElementById('expense-name').value.trim();
    const amount   = parseFloat(document.getElementById('expense-amount').value);
    const currency = document.getElementById('expense-currency').value;
    const category = document.getElementById('expense-category').value;

    if (!name || !amount || amount <= 0) {
        showError("Заполните название и корректную сумму");
        return;
    }

    let amountInRub = amount;
    if (currency === 'USD' && currentRates.USD) amountInRub *= currentRates.USD;
    if (currency === 'EUR' && currentRates.EUR) amountInRub *= currentRates.EUR;

    const expense = { name, amount, currency, category, amountInRub };

    expenses.push(expense);
    renderExpenses();
    updateTotal();
    clearExpenseForm();
};

const clearExpenseForm = () => {
    document.getElementById('expense-name').value = '';
    document.getElementById('expense-amount').value = '';
};

const renderExpenses = () => {
    const tbody = document.getElementById('expenses-body');
    tbody.innerHTML = '';

    expenses.forEach((exp, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="category-badge ${exp.category}">${getCategoryName(exp.category)}</span></td>
            <td>${exp.name}</td>
            <td>${exp.amount.toFixed(2)}</td>
            <td>${exp.currency}</td>
            <td>${exp.amountInRub.toFixed(2)}</td>
            <td><button class="delete-btn" data-index="${index}">Удалить</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Обработчики удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            expenses.splice(idx, 1);
            renderExpenses();
            updateTotal();
        });
    });
};

const getCategoryName = (cat) => {
    const names = {
        accommodation: 'Проживание',
        transport:     'Транспорт',
        food:          'Еда',
        entertainment: 'Развлечения',
        shopping:      'Шоппинг',
        other:         'Другое'
    };
    return names[cat] || cat;
};

const updateTotal = () => {
    const total = expenses.reduce((sum, exp) => sum + exp.amountInRub, 0);
    document.getElementById('total-rub').textContent = `${total.toFixed(2)} RUB`;
};

// События для бюджета
document.getElementById('add-expense-btn').addEventListener('click', addExpense);

document.getElementById('clear-budget-btn').addEventListener('click', () => {
    if (confirm("Очистить весь бюджет?")) {
        expenses = [];
        renderExpenses();
        updateTotal();
    }
});

document.getElementById('save-budget-btn').addEventListener('click', () => {
    if (expenses.length === 0) {
        showError("Бюджет пуст");
        return;
    }
    localStorage.setItem('travelBudget', JSON.stringify(expenses));
    alert("Бюджет сохранён в браузере");
});

const loadSavedBudget = () => {
    const saved = localStorage.getItem('travelBudget');
    if (saved) {
        expenses = JSON.parse(saved);
        renderExpenses();
        updateTotal();
    }
};


// МОДАЛЬНОЕ ОКНО ОШИБОК


const modal = document.getElementById('error-modal');
const closeBtn = document.querySelector('.close');
const errorMsg = document.getElementById('error-message');

const showError = (message) => {
    errorMsg.textContent = message;
    modal.style.display = 'block';
};

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});


// СТАРТ


document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates().then(() => {
        updateCurrentRates();
        loadSavedBudget();
    });
});