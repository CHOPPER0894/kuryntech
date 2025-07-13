/*  SIDEBAR-HIDDEN */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.add('hidden');

    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});
