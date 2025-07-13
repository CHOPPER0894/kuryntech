const username = localStorage.getItem('username');

async function loadSettings() {
  try {
    const res = await fetch(`http://localhost:5000/api/settings/${username}`);
    const settings = await res.json();

    // Fill preferences
    document.querySelector(".pref-grid select:nth-of-type(1)").value = settings.timezone || "Asia/Manila (GMT+8)";
    document.querySelector(".pref-grid select:nth-of-type(2)").value = settings.unit || "kWh (Kilowatt-hour)";
    document.querySelectorAll(".pref-grid .pref-btn.green")[0].textContent = settings.notifications_enabled ? "Enabled" : "Disabled";
    document.querySelectorAll(".pref-grid .pref-btn.green")[1].textContent = settings.language || "English";

    // Fill account info
    document.getElementById("admin-name").value = settings.name || "";
    document.getElementById("admin-email").value = settings.email || "";

  } catch (err) {
    console.error("Failed to load settings:", err);
  }
}

async function saveSettings() {
  const name = document.getElementById("admin-name").value.trim();
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;
  const confirm = document.getElementById("confirm-password").value;

  const timezone = document.querySelector(".pref-grid select:nth-of-type(1)").value;
  const unit = document.querySelector(".pref-grid select:nth-of-type(2)").value;
  const notifications = document.querySelectorAll(".pref-grid .pref-btn.green")[0].textContent === "Enabled";
  const language = document.querySelectorAll(".pref-grid .pref-btn.green")[1].textContent;

  if (!name || !email) return alert("Please enter name and email.");
  if (password && password !== confirm) return alert("Passwords do not match.");

  try {
    await fetch("http://localhost:5000/api/settings/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username, name, email, password, timezone, unit, notifications, language
      })
    });

    alert("✅ Settings saved successfully.");
  } catch (err) {
    console.error("Save error:", err);
    alert("❌ Failed to save settings.");
  }
}

document.querySelectorAll(".pref-btn.green")[0].addEventListener("click", () => {
  const btn = document.querySelectorAll(".pref-btn.green")[0];
  btn.textContent = btn.textContent === "Enabled" ? "Disabled" : "Enabled";
});

window.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector(".save-btn-container button").addEventListener("click", saveSettings);
