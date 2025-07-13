let container = document.getElementById('container');

const toggle = () => {
  container.classList.toggle('sign-in');
  container.classList.toggle('sign-up');
};

setTimeout(() => {
  container.classList.add('sign-in');
}, 200);

/* ADMIN AND CLIENT LOGIN FUNCTIONALITY */
function loginUser() {
  const roleSelect = document.getElementById('loginRoleSelect');
  
  if (!roleSelect) {
    console.error('Role select dropdown not found!');
    return;
  }

  const role = roleSelect.value;

  if (role === 'admin') {
    window.location.href = 'admin_dashboard.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}
