const resultEl  = document.getElementById('result');
const historyEl = document.getElementById('history');
const ledEl     = document.getElementById('led');

let displayValue    = "0";
let firstOperand    = null;
let operator        = null;
let waitingForSecond = false;

const symbols = { '+':'+', '-':'−', '*':'×', '/':'÷' };

function formatNumber(numStr){
  if (numStr === "Error") return numStr;
  const negative = numStr.startsWith('-');
  const clean = negative ? numStr.slice(1) : numStr;
  let [intPart, decPart] = clean.split('.');
  if (intPart.replace(/\D/g,'').length > 12){
    return parseFloat(numStr).toExponential(5);
  }
  const intFormatted = Number(intPart || 0).toLocaleString('en-US');
  let out = decPart !== undefined ? intFormatted + '.' + decPart : intFormatted;
  return negative ? '-' + out : out;
}

function updateDisplay(){
  const formatted = formatNumber(displayValue);
  resultEl.textContent = formatted;
  resultEl.classList.toggle('shrink', formatted.length > 9);
  ledEl.classList.toggle('on', displayValue !== "0" && displayValue !== "Error");
}

function updateHistory(text){
  historyEl.textContent = text || "";
}

function compute(a, b, op){
  switch(op){
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
    default:  return b;
  }
}

function inputDigit(d){
  if (displayValue === "Error" || waitingForSecond){
    displayValue = d;
    waitingForSecond = false;
  } else {
    if (displayValue.replace('-','').replace('.','').length >= 15) return;
    displayValue = displayValue === "0" ? d : displayValue + d;
  }
  updateDisplay();
}

function inputDecimal(){
  if (displayValue === "Error" || waitingForSecond){
    displayValue = "0.";
    waitingForSecond = false;
    updateDisplay();
    return;
  }
  if (!displayValue.includes('.')) displayValue += '.';
  updateDisplay();
}

function setOperator(nextOp){
  if (displayValue === "Error") return;
  const inputValue = parseFloat(displayValue);

  if (operator && waitingForSecond){
    operator = nextOp;
    updateHistory(`${formatNumber(String(firstOperand))} ${symbols[operator]}`);
    return;
  }

  if (firstOperand === null){
    firstOperand = inputValue;
  } else if (operator){
    const result = compute(firstOperand, inputValue, operator);
    if (result === null){
      displayValue = "Error";
      firstOperand = null;
      operator = null;
      waitingForSecond = true;
      updateDisplay();
      updateHistory("");
      return;
    }
    firstOperand = result;
    displayValue = String(result);
  }

  operator = nextOp;
  waitingForSecond = true;
  updateHistory(`${formatNumber(String(firstOperand))} ${symbols[operator]}`);
}

function handleEquals(){
  if (operator === null || firstOperand === null || displayValue === "Error") return;
  const secondOperand = parseFloat(displayValue);
  const result = compute(firstOperand, secondOperand, operator);
  const exprFirst = formatNumber(String(firstOperand));
  const exprSecond = formatNumber(String(secondOperand));
  const sym = symbols[operator];

  if (result === null){
    displayValue = "Error";
    updateHistory(`${exprFirst} ${sym} ${exprSecond} =`);
  } else {
    displayValue = String(result);
    updateHistory(`${exprFirst} ${sym} ${exprSecond} =`);
  }

  firstOperand = null;
  operator = null;
  waitingForSecond = true;
  updateDisplay();
  pulse();
}

function clearAll(){
  displayValue = "0";
  firstOperand = null;
  operator = null;
  waitingForSecond = false;
  updateDisplay();
  updateHistory("");
}

function backspace(){
  if (displayValue === "Error" || waitingForSecond) return;
  displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
  if (displayValue === "-") displayValue = "0";
  updateDisplay();
}

function toggleSign(){
  if (displayValue === "0" || displayValue === "Error") return;
  displayValue = displayValue.startsWith('-') ? displayValue.slice(1) : '-' + displayValue;
  updateDisplay();
}

function percent(){
  if (displayValue === "Error") return;
  displayValue = String(parseFloat(displayValue) / 100);
  updateDisplay();
}

function pulse(){
  resultEl.classList.remove('pulse');
  requestAnimationFrame(() => resultEl.classList.add('pulse'));
}

document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value  = btn.dataset.value;
    if (action === 'digit')     inputDigit(value);
    if (action === 'decimal')   inputDecimal();
    if (action === 'operator')  setOperator(value);
    if (action === 'equals')    handleEquals();
    if (action === 'clear')     clearAll();
    if (action === 'sign')      toggleSign();
    if (action === 'percent')   percent();
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace'){ backspace(); return; }
  const btn = document.querySelector(`[data-key="${e.key}"]`);
  if (!btn) return;
  btn.click();
  flashKey(e.key);
});

function flashKey(key){
  const btn = document.querySelector(`[data-key="${key}"]`);
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 110);
}

updateDisplay();