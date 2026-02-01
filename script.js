// Курсы валют (примерные, относительно RUB)
const exchangeRates = {
    RUB: 1,
    USD: 0.011, // 1 USD = 90 RUB (примерно)
    EUR: 0.010, // 1 EUR = 100 RUB (примерно)
    GBP: 0.0086, // 1 GBP = 116 RUB
    JPY: 1.65, // 1 JPY = 0.6 RUB
    CNY: 0.079 // 1 CNY = 12.7 RUB
};

// Функция конвертации
function convertCurrency() {
    // Получаем элементы
    const amount = document.getElementById('currency-amount').value;
    const fromCurrency = document.getElementById('currency-from').value;
    const toCurrency = document.getElementById('currency-to').value;
    
    // Проверка ввода
    if (!amount || amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }
    
    // Конвертация через рубли как базовую валюту
    const amountInRubles = amount / exchangeRates[fromCurrency];
    const convertedAmount = amountInRubles * exchangeRates[toCurrency];
    
    // Округление до 2 знаков после запятой
    const result = convertedAmount.toFixed(2);
    
    // Отображение результата
    displayResult(amount, fromCurrency, result, toCurrency);
}

// Функция отображения результата
function displayResult(amount, from, result, to) {
    // Создаем или находим элемент для результата
    let resultElement = document.getElementById('conversion-result');
    
    if (!resultElement) {
        resultElement = document.createElement('div');
        resultElement.id = 'conversion-result';
        resultElement.className = 'result';
        document.querySelector('#currency .card').appendChild(resultElement);
    }
    
    // Обновляем содержимое
    resultElement.innerHTML = `
        <div class="conversion-result">
            <h3>Результат конвертации:</h3>
            <p>${amount} ${getCurrencyName(from)} = <strong>${result} ${getCurrencyName(to)}</strong></p>
            <p class="rate-info">Курс: 1 ${from} = ${(exchangeRates[to] / exchangeRates[from]).toFixed(4)} ${to}</p>
        </div>
    `;
}

// Функция для получения полного названия валюты
function getCurrencyName(code) {
    const names = {
        RUB: 'Российских рублей',
        USD: 'Долларов США',
        EUR: 'Евро',
        GBP: 'Британских фунтов',
        JPY: 'Японских йен',
        CNY: 'Китайских юаней'
    };
    return names[code] || code;
}

// Функция для обмена валют местами
function swapCurrencies() {
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    
    // Меняем значения местами
    const tempValue = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;
    
    // Если есть сумма, выполняем конвертацию
    const amount = document.getElementById('currency-amount').value;
    if (amount && amount > 0) {
        convertCurrency();
    }
}

// Функция для автоматической конвертации при изменении
function setupAutoConvert() {
    const amountInput = document.getElementById('currency-amount');
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    
    // Добавляем обработчики событий
    amountInput.addEventListener('input', convertCurrency);
    fromSelect.addEventListener('change', convertCurrency);
    toSelect.addEventListener('change', convertCurrency);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setupAutoConvert();
    
    // Добавляем кнопку обмена валютами
    const convertArrow = document.querySelector('.convert-arrow');
    if (convertArrow) {
        convertArrow.style.cursor = 'pointer';
        convertArrow.title = 'Поменять валюты местами';
        convertArrow.addEventListener('click', swapCurrencies);
    }
    
    // Добавляем кнопку конвертации
    const inputGroup = document.querySelector('.input-group');
    const convertButton = document.createElement('button');
    convertButton.innerHTML = '<i class="fas fa-sync-alt"></i> Конвертировать';
    convertButton.className = 'convert-button';
    convertButton.onclick = convertCurrency;
    
    // Вставляем кнопку после группы input
    inputGroup.parentNode.insertBefore(convertButton, inputGroup.nextSibling);
});