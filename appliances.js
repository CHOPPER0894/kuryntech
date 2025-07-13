const socketLimits = { 1: 5, 2: 5, 3: 20, 4: 20, 5: 30 };
const dummyCurrents = { 1: 3.8, 2: 4.9, 3: 19.5, 4: 15, 5: 29.5 };
const voltage = 220;
const socketLabels = ['12AM', '3AM', '6AM', '9AM'];
const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

function renderChart(id, dataPoints, color) {
  new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: {
      labels: socketLabels,
      datasets: [{
        label: 'Power (W)',
        data: dataPoints,
        borderColor: color,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

// Display info + chart
document.querySelectorAll('.appliance-card').forEach((card, index) => {
  const socketNum = index + 1;
  const current = dummyCurrents[socketNum] || 0;
  const power = current * voltage;
  const percent = (current / socketLimits[socketNum]) * 100;

  card.querySelector('.voltage').textContent = `${voltage}V`;
  card.querySelector('.current').textContent = `${current.toFixed(1)}A`;
  card.querySelector('.power').textContent = `${Math.round(power)}W`;

  const alert = card.querySelector('.alert-msg');
  alert.style.display = percent >= 80 ? 'block' : 'none';

  renderChart(`socket${socketNum}Chart`, [
    Math.round(power * 0.85),
    Math.round(power * 0.9),
    Math.round(power),
    Math.round(power)
  ], chartColors[index]);
});

// Timer + Toggle logic
document.querySelectorAll('.appliance-card').forEach(card => {
  const button = card.querySelector('.toggle-btn');
  const timerDisplay = card.querySelector('.timer-display');
  const startIcon = card.querySelector('.start-btn');

  let countdown = null;

  function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  function parseTime(value) {
    const [h, m, s] = value.split(':').map(Number);
    if ([h, m, s].some(isNaN)) return 0;
    return h * 3600 + m * 60 + s;
  }

  function startTimer(duration) {
    clearInterval(countdown);
    let remaining = duration;

    countdown = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(countdown);
        timerDisplay.value = "00:00:00";
        button.classList.remove('on');
        button.classList.add('off');
        button.textContent = 'Off';
        return;
      }

      remaining--;
      timerDisplay.value = formatTime(remaining);
    }, 1000);
  }

  button.addEventListener('click', () => {
    const isOn = button.classList.contains('on');
    const inputSeconds = parseTime(timerDisplay.value.trim());

    if (!isOn) {
      button.classList.add('on');
      button.classList.remove('off');
      button.textContent = 'On';

      if (inputSeconds > 0) {
        startTimer(inputSeconds);
      }

    } else {
      button.classList.remove('on');
      button.classList.add('off');
      button.textContent = 'Off';
      clearInterval(countdown);
    }
  });

  startIcon.addEventListener('click', () => {
    const inputSeconds = parseTime(timerDisplay.value.trim());
    if (inputSeconds > 0) {
      button.classList.add('on');
      button.classList.remove('off');
      button.textContent = 'On';
      startTimer(inputSeconds);
    }
  });

  timerDisplay.addEventListener('blur', () => {
    const seconds = parseTime(timerDisplay.value.trim());
    timerDisplay.value = formatTime(seconds);
  });
});
