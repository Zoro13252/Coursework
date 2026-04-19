let Valute = {};
const CBR_XML_Daily_Ru = (rates) => {
    Valute = rates.Valute;

    const trend = (current, previous) => {
        if (current > previous) return ' ▲';
        if (current < previous) return ' ▼';
        return '';
    }

    const currencies = [
        { id: 'USD', code: 'USD', symbol: '$' },
        { id: 'EUR', code: 'EUR', symbol: '€' },
        { id: 'GBP', code: 'GBP', symbol: '£' },
        { id: 'JPY', code: 'JPY', symbol: '¥' },
        { id: 'CNY', code: 'CNY', symbol: '¥' }
    ];

    currencies.forEach(item => {
        if (Valute[item.code]) {
            const rate = Valute[item.code].Value.toFixed(4).replace('.', ',');
            const elem = document.getElementById(item.id);
            if (elem) {
                elem.innerHTML = `${item.code} ${item.symbol} — ${rate} руб.`;
                elem.innerHTML += trend(Valute[item.code].Value, Valute[item.code].Previous);
            }
        }
    });

    document.getElementById('rates-timestamp').textContent = 
        `Курсы обновлены: ${new Date().toLocaleString('ru-RU')}`;
}

// Основная функция конвертации валют
const convertCurrency = () => {
    const amountInput = document.getElementById('currency-amount');
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;
    const resultBox = document.getElementById('currency-result');

    const amount = parseFloat(amountInput.value);

    if (amount <= 0) {
        resultBox.innerHTML = 'Введите сумму больше нуля';
        return;
    }else if(!amount){
        resultBox.innerHTML = 'Введите число';
        return;
    }


    if (Object.keys(Valute).length === 0) {
        resultBox.innerHTML = 'Курсы валют ещё загружаются... Подождите немного';
        return;
    }

    let result;

    if (from === 'RUB' && to === 'RUB') {
        result = amount;
    } else if (from === 'RUB') {
        result = amount / Valute[to].Value;
    } else if (to === 'RUB') {
        result = amount * Valute[from].Value;
    } else {
        const amountInRub = amount * Valute[from].Value;
        result = amountInRub / Valute[to].Value;
    }

    resultBox.innerHTML = `
        ${amount.toFixed(2)} ${from} = 
        <strong>${result.toFixed(2)} ${to}</strong>
    `;


}
//КОНВЕРТЕР ЕДИНИЦ

// Конвертация расстояния (км/мили)
const convertDistance = () => {
  const value = parseFloat(document.getElementById('distance-value').value);
  const from = document.getElementById('distance-from').value;
  const to = document.getElementById('distance-to').value;

  if (!value && value !== 0) return;

  const km = from === 'km' ? value : value * 1.609344;
  const result = to === 'km' ? km : km / 1.609344;

  document.getElementById('distance-result').textContent = 
    `${value} ${from} = ${result.toFixed(3)} ${to}`;
}

// Конвертация веса (кг/фунты)
const convertWeight = () => {
  const value = parseFloat(document.getElementById('weight-value').value);
  const from = document.getElementById('weight-from').value;
  const to = document.getElementById('weight-to').value;

  if (!value && value !== 0) return;

  const kg = from === 'kg' ? value : value * 0.45359237;
  const result = to === 'kg' ? kg : kg / 0.45359237;

  document.getElementById('weight-result').textContent = 
    `${value} ${from} = ${result.toFixed(3)} ${to}`;
}

// ПОЕЗДКИ
let expenses = [];

// Добавление расхода
const addExpense = () => {
    const categorySelect = document.getElementById('expense-category');
    const category = categorySelect.options[categorySelect.selectedIndex].text;
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const currency = document.getElementById('expense-currency').value;

    if (!name || isNaN(amount) || amount <= 0) {
        return alert('Заполните корректные данные: название и сумму > 0');
    }

    let amountInRub;
    if (currency === 'RUB') {
        amountInRub = amount;
    } else if (Valute[currency]) {
        amountInRub = amount * Valute[currency].Value;
    } else {
        return alert(`Курс для ${currency} не загружен`);
    }

    expenses.push({ category, name, amount, currency, amountInRub });

    renderExpenses();
    updateTotal();
    clearForm();
};

// Очистка формы
const clearForm = () => {
  document.getElementById('expense-name').value = '';
  document.getElementById('expense-amount').value = '';
}

// Обновление списка расходов
const renderExpenses = () => {
  const tbody = document.getElementById('expenses-body');
  tbody.innerHTML = '';
  expenses.forEach((exp, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.category}</td>
      <td>${exp.name}</td>
      <td>${exp.amount}</td>
      <td>${exp.currency}</td>
      <td>${exp.amountInRub.toFixed(2)} RUB</td>
      <td><button onclick="deleteExpense(${i})" style="background-color: #6366f1; color: white; border-radius: 10px; height:40px; width: 90px; border-style: none;">Удалить</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Удаление расхода
const deleteExpense = (index) => {
  expenses.splice(index, 1);
  renderExpenses();
  updateTotal();
}

// Обновление итога
const updateTotal = () => {
  const total = expenses.reduce((sum, exp) => sum + exp.amountInRub, 0);
  document.getElementById('total-rub').textContent = `${total.toFixed(2)} RUB`;
}

// Сохранение в localStorage
const saveBudget = () => {
  if (expenses.length === 0){
    localStorage.setItem('travelBudget', JSON.stringify(expenses));
    return alert('Вы сохронили пустой список расходов');
  }else{
    localStorage.setItem('travelBudget', JSON.stringify(expenses));
    return alert('Бюджет сохранён');
  }
   

}

// Загрузка сохранённого бюджета
const loadBudget = () => {
  const saved = localStorage.getItem('travelBudget');
  if (saved) {
    expenses = JSON.parse(saved);
    renderExpenses();
    updateTotal();
  }
}

window.onload = () => {
    loadBudget();

    // Авто-конвертация единиц измерения
    document.getElementById('distance-value').oninput = convertDistance;
    document.getElementById('distance-from').onchange = convertDistance;
    document.getElementById('distance-to').onchange = convertDistance;

    document.getElementById('weight-value').oninput = convertWeight;
    document.getElementById('weight-from').onchange = convertWeight;
    document.getElementById('weight-to').onchange = convertWeight;

    // Конвертация валют
    const convertBtn = document.getElementById('convert-btn');
    convertBtn.addEventListener('click', convertCurrency);
    document.getElementById('currency-from').onchange = convertCurrency;
    document.getElementById('currency-to').onchange = convertCurrency;
    document.getElementById('currency-amount').oninput = convertCurrency;

    // Кнопка "Обновить курсы"
    document.getElementById('update-rates-btn').addEventListener('click', () => {
        location.reload();
    });

    // Добавление расхода
    document.getElementById('add-expense-btn').addEventListener('click', addExpense);

    // Сохранение и очистка бюджета
    document.getElementById('save-budget-btn').addEventListener('click', saveBudget);
    document.getElementById('clear-budget-btn').addEventListener('click', () => {
        if (confirm('Очистить весь бюджет?')) {
            expenses = [];
            renderExpenses();
            updateTotal();
        }
    });
};