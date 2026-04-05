// script.js — простая версия для новичка

// === 1. КОНВЕРТЕР ВАЛЮТ ===
const API_KEY = 'YOUR_API_KEY_HERE';           // ← замени на свой ключ
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/RUB`;

let exchangeRates = {};   // сюда будем сохранять курсы

// Показываем курсы на странице
const updateRatesDisplay = () => {
    const container = document.getElementById('rates-display');
    container.innerHTML = '';

    const important = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

    important.forEach(code => {
        if (exchangeRates[code]) {
            const div = document.createElement('div');
            div.className = 'rate-item';
            div.innerHTML = `
                <strong>${code}</strong><br>
                ${exchangeRates[code].toFixed(2)} RUB
            `;
            container.appendChild(div);
        }
    });
};

// Загружаем курсы (пока закомментирована, чтобы не ломалась без ключа)
const fetchExchangeRates = async () => {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === "success") {
            exchangeRates = data.conversion_rates;
            updateRatesDisplay();
            document.getElementById('rates-timestamp').textContent = 
                `Курсы обновлены: ${new Date().toLocaleString('ru-RU')}`;
        }
    } catch (err) {
        console.log('Не удалось загрузить курсы');
    }
};

// Конвертация валют
document.getElementById('convert-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('currency-amount').value);
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;

    if (!amount || amount <= 0) {
        alert('Введите сумму больше 0');
        return;
    }

    if (!exchangeRates[from] || !exchangeRates[to]) {
        alert('Курсы пока не загружены');
        return;
    }

    const amountInRub = amount * exchangeRates[from];   // переводим в рубли
    const result = amountInRub / exchangeRates[to];     // переводим в нужную валюту

    document.getElementById('currency-result').innerHTML = 
        `${amount.toFixed(2)} ${from} = <strong>${result.toFixed(2)} ${to}</strong>`;
});

// Кнопка обновления курсов
document.getElementById('update-rates-btn').addEventListener('click', fetchExchangeRates);


// === 2. КОНВЕРТЕР ЕДИНИЦ ===

const convertDistance = () => {
    const value = parseFloat(document.getElementById('distance-value').value);
    const from = document.getElementById('distance-from').value;
    const to = document.getElementById('distance-to').value;

    if (!value && value !== 0) return;

    const km = from === 'km' ? value : value * 1.609344;
    const result = to === 'km' ? km : km / 1.609344;

    document.getElementById('distance-result').textContent = 
        `${value} ${from} = ${result.toFixed(3)} ${to}`;
};

const convertWeight = () => {
    const value = parseFloat(document.getElementById('weight-value').value);
    const from = document.getElementById('weight-from').value;
    const to = document.getElementById('weight-to').value;

    if (!value && value !== 0) return;

    const kg = from === 'kg' ? value : value * 0.45359237;
    const result = to === 'kg' ? kg : kg / 0.45359237;

    document.getElementById('weight-result').textContent = 
        `${value} ${from} = ${result.toFixed(3)} ${to}`;
};

// Автоматическая конвертация при вводе
['distance-value', 'distance-from', 'distance-to'].forEach(id => {
    document.getElementById(id).addEventListener('input', convertDistance);
});

['weight-value', 'weight-from', 'weight-to'].forEach(id => {
    document.getElementById(id).addEventListener('input', convertWeight);
});


// === 3. БЮДЖЕТ ПОЕЗДКИ ===

let expenses = [];

const addExpense = () => {
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const currency = document.getElementById('expense-currency').value;
    const category = document.getElementById('expense-category').value;

    if (!name || !amount || amount <= 0) {
        alert('Заполните название и сумму');
        return;
    }

    // Простая конвертация в рубли (если курсы загружены)
    let amountInRub = amount;
    if (currency === 'USD' && exchangeRates.USD) amountInRub = amount * exchangeRates.USD;
    if (currency === 'EUR' && exchangeRates.EUR) amountInRub = amount * exchangeRates.EUR;

    expenses.push({ name, amount, currency, category, amountInRub });

    renderExpenses();
    updateTotal();
    clearForm();
};

const clearForm = () => {
    document.getElementById('expense-name').value = '';
    document.getElementById('expense-amount').value = '';
};

const renderExpenses = () => {
    const tbody = document.getElementById('expenses-body');
    tbody.innerHTML = '';

    expenses.forEach((exp, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exp.category}</td>
            <td>${exp.name}</td>
            <td>${exp.amount.toFixed(2)}</td>
            <td>${exp.currency}</td>
            <td>${exp.amountInRub.toFixed(2)} RUB</td>
            <td><button class="delete-btn" data-index="${index}">Удалить</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Удаление
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            expenses.splice(idx, 1);
            renderExpenses();
            updateTotal();
        });
    });
};

const updateTotal = () => {
    const total = expenses.reduce((sum, exp) => sum + exp.amountInRub, 0);
    document.getElementById('total-rub').textContent = `${total.toFixed(2)} RUB`;
};

// Кнопки бюджета
document.getElementById('add-expense-btn').addEventListener('click', addExpense);

document.getElementById('clear-budget-btn').addEventListener('click', () => {
    if (confirm('Очистить весь бюджет?')) {
        expenses = [];
        renderExpenses();
        updateTotal();
    }
});

document.getElementById('save-budget-btn').addEventListener('click', () => {
    if (expenses.length === 0) {
        alert('Бюджет пуст');
        return;
    }
    localStorage.setItem('travelBudget', JSON.stringify(expenses));
    alert('Бюджет сохранён!');
});

const loadSavedBudget = () => {
    const saved = localStorage.getItem('travelBudget');
    if (saved) {
        expenses = JSON.parse(saved);
        renderExpenses();
        updateTotal();
    }
};


// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // fetchExchangeRates();        // раскомментируй когда вставишь настоящий API_KEY
    loadSavedBudget();
});