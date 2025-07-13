let chart;
let months = [];
let currentMonthIndex = 0;

// ✅ Use native WebSocket API for AWS
const socket = new WebSocket("wss://srapks38a9.execute-api.ap-southeast-2.amazonaws.com/production");

// Connected to WebSocket
socket.onopen = () => {
  console.log("🔌 Connected to AWS WebSocket API");
};

// Message received from backend
socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("📡 New energy data received:", data);

    const energy = parseFloat(data.energy || 0).toFixed(4);
    const cost = parseFloat(data.cost || 0).toFixed(2);

    document.getElementById("realtime-energy").textContent = energy;
    document.getElementById("realtime-cost").textContent = `₱${cost}`;

    updateUsageBar(parseFloat(energy));
  } catch (e) {
    console.error("❌ Error parsing WebSocket message:", e);
  }
};

// Error handling
socket.onerror = (error) => {
  console.error("❌ WebSocket error:", error);
};

// === Update Usage Progress Bar ===
function updateUsageBar(currentUsage) {
  const monthlyLimit = 150;
  const percentUsed = (currentUsage / monthlyLimit) * 100;
  const remaining = (monthlyLimit - currentUsage).toFixed(1);

  const progressBar = document.getElementById("progress-bar");
  const summaryText = document.getElementById("progress-summary");
  const remainingText = document.getElementById("remaining");

  progressBar.style.width = `${percentUsed}%`;

  if (percentUsed < 70) {
    progressBar.style.backgroundColor = "#00b894"; // Green
  } else if (percentUsed < 90) {
    progressBar.style.backgroundColor = "#fdcb6e"; // Yellow
  } else {
    progressBar.style.backgroundColor = "#d63031"; // Red
  }

  summaryText.textContent = `${currentUsage.toFixed(1)} kWh of 150 kWh used`;
  remainingText.textContent = `${remaining} kWh remaining this month`;
}

// === Fetch from API & Render Chart ===
async function fetchMonthlyUsage() {
  const res = await fetch('/api/data/monthly'); // ✅ Fixed path
  if (!res.ok) return {};
  return await res.json();
}

async function renderChart() {
  const monthlyData = await fetchMonthlyUsage();
  months = Object.keys(monthlyData);
  currentMonthIndex = months.length - 1;

  const values = Object.values(monthlyData);
  const labels = months.map(m =>
    new Date(m + "-01").toLocaleString('default', { month: 'short', year: 'numeric' })
  );

  const pointColors = months.map((_, i) =>
    i === currentMonthIndex ? "#0984e3" : "#dfe6e9"
  );

  const ctx = document.getElementById("monthlyUsageChart")?.getContext("2d");
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Monthly Usage (₱)",
        data: values,
        borderColor: "#00b894",
        backgroundColor: "rgba(0, 184, 148, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: pointColors,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  const currentDate = new Date(months[currentMonthIndex] + "-01");
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById("monthLabel").textContent = monthLabel;

  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  document.getElementById("averageCostSummary").textContent = `Average Monthly Fee: ₱${avg}`;

  const currentFee = monthlyData[months[currentMonthIndex]];
  document.getElementById("mobileCurrentMonthFee").textContent =
    `${monthLabel.split(" ")[0]} Usage: ₱${currentFee.toFixed(2)}`;
}

// === Chart Navigation ===
function prevMonth() {
  if (currentMonthIndex > 0) {
    currentMonthIndex--;
    renderChart();
  }
}

function nextMonth() {
  if (currentMonthIndex < months.length - 1) {
    currentMonthIndex++;
    renderChart();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderChart();
});
