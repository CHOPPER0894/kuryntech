document.addEventListener('DOMContentLoaded', () => {
  // Simulated values – replace with actual backend/API values
  const totalUsers = 120;
  const activeDevices = 85;
  const onlineUsers = 34;
  const totalLogs = 2134;
  const reportedIssues = 4;
  const loginThisMonth = 138;
  const loginGoal = 250;

  // Update UI
  document.getElementById('admin-users-count').textContent = totalUsers;
  document.getElementById('admin-devices-count').textContent = activeDevices;
  document.getElementById('admin-progress-summary').textContent = `Logins in July: ${loginThisMonth}`;
  document.getElementById('admin-remaining').textContent = `Goal: ${loginGoal} logins`;

  // Progress bar: Kuryntek green
  const progressPercent = (loginThisMonth / loginGoal) * 100;
  const progressBar = document.getElementById('admin-progress-bar');
  progressBar.style.width = `${progressPercent}%`;
  progressBar.style.backgroundColor = '#00b894'; // Kuryntek green

  // Chart: Blue accent for bars
  const ctx = document.getElementById('adminUsageChart').getContext('2d');
  const adminChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: 'Login Sessions',
        data: [5, 12, 9, 14, 18, 21, 7],
        backgroundColor: '#00b894', // Kuryntek blue
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#2d3436' // dark text
          }
        }
      }
    }
  });

  // Optional month navigation (non-functional for now)
  window.prevMonth = () => alert("Previous month not loaded.");
  window.nextMonth = () => alert("Next month not loaded.");
});
