// ====== Static Data (Simulated for now) ======
const energyData = {
  totalConsumption: 3.5,       // Current total kWh
  estimatedCost: 1700,         // Estimated monthly bill
  averageCostPerKwh: 11.5,     // Example electricity rate
  socketUsage: {
    socket1: 0.9,
    socket2: 9.2,               // Simulating heavy usage for alert
    socket3: 0.5,
    socket4: 0.8,
    socket5: 1.1
  },
  realtimeUsage: 0.27,         // kWh at this moment
  realtimeCost: 3.11           // PHP
};

// ====== Default Thresholds ======
let userThresholds = {
  costLimit: 1500,
  consumptionLimit: 3.0,
  usageLimit: 8
};

// ====== Realtime Display ======
document.getElementById("realtime-kwh").textContent = energyData.realtimeUsage.toFixed(2);
document.getElementById("realtime-cost").textContent = `₱${energyData.realtimeCost.toFixed(2)}`;

// ====== Forecast Cost Estimate ======
function forecastMonthlyCost(currentKwh, currentCost) {
  const today = new Date();
  const day = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const kwhForecast = (currentKwh / day) * daysInMonth;
  const costForecast = (currentCost / day) * daysInMonth;
  return { kwh: kwhForecast, cost: costForecast };
}

const forecast = forecastMonthlyCost(energyData.totalConsumption, energyData.estimatedCost);
document.getElementById("forecast-cost").textContent = `₱${forecast.cost.toFixed(2)}`;

// ====== Budget Status ======
const budgetStatus = document.getElementById("budget-status");
if (forecast.cost > userThresholds.costLimit) {
  budgetStatus.textContent = "⚠️ You may exceed your budget.";
  budgetStatus.style.color = "red";
} else {
  budgetStatus.textContent = "✅ You're within your budget.";
  budgetStatus.style.color = "green";
}

// ====== Top Socket Usage ======
function findTopSocket(usageData) {
  let top = { socket: "", value: 0 };
  for (const [socket, value] of Object.entries(usageData)) {
    if (value > top.value) {
      top.socket = socket;
      top.value = value;
    }
  }
  return top;
}

const topSocket = findTopSocket(energyData.socketUsage);
document.getElementById("top-socket").textContent = `Top socket: ${topSocket.socket.toUpperCase()} (${topSocket.value.toFixed(1)} kWh)`;

// ====== Alert System ======
function showAlerts(thresholds) {
  const alerts = [];

  if (energyData.totalConsumption > thresholds.consumptionLimit) {
    alerts.push("Total power consumption exceeded threshold.");
  }
  if (energyData.estimatedCost > thresholds.costLimit) {
    alerts.push(`Monthly cost estimate has exceeded ₱${thresholds.costLimit}`);
  }
  for (const [socket, usage] of Object.entries(energyData.socketUsage)) {
    if (usage > thresholds.usageLimit) {
      alerts.push(`${socket.toUpperCase()} usage time is too high.`);
    }
  }

  const alertList = document.getElementById("alert-list");
  alertList.innerHTML = alerts.length
    ? alerts.map(alert => `<li>${alert}</li>`).join("")
    : "<li>No alerts</li>";
}

showAlerts(userThresholds);

// ====== Apply New Thresholds Button ======
document.getElementById('applyThresholds').addEventListener('click', () => {
  const consumption = parseFloat(document.getElementById('consumption').value);
  const cost = parseFloat(document.getElementById('costLimit').value);
  const usage = parseFloat(document.getElementById('usageLimit').value);

  if (isNaN(consumption) || isNaN(cost) || isNaN(usage)) {
    alert("⚠️ Please fill in all threshold values.");
    return;
  }

  // Update user thresholds
  userThresholds = {
    consumptionLimit: consumption,
    costLimit: cost,
    usageLimit: usage
  };

  alert(`✅ Thresholds Applied:\n• Consumption: ${consumption} kWh\n• Cost: ₱${cost}\n• Usage: ${usage} hrs`);

  // Re-check alerts and budget
  showAlerts(userThresholds);

  if (forecast.cost > userThresholds.costLimit) {
    budgetStatus.textContent = "⚠️ You may exceed your budget.";
    budgetStatus.style.color = "red";
  } else {
    budgetStatus.textContent = "✅ You're within your budget.";
    budgetStatus.style.color = "green";
  }
});
