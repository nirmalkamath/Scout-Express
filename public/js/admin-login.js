document.addEventListener('DOMContentLoaded', function () {
  const loginTypeItems = document.querySelectorAll('.login-type-item');
  const loginTitle = document.getElementById('loginTitle');
  const loginTypeInput = document.getElementById('loginType');
  const loginForm = document.getElementById('loginForm');

  if (!loginTypeItems.length) return;

  loginTypeItems.forEach((item) => {
    item.addEventListener('click', function () {
      loginTypeItems.forEach((element) => element.classList.remove('active'));
      this.classList.add('active');
      const title = this.getAttribute('data-title');
      const type = this.getAttribute('data-type');
      
      if (loginTitle && title) loginTitle.textContent = title;
      if (loginTypeInput && type) loginTypeInput.value = type;
      
      // Handle login type switching
      if (type === 'admin') {
        // Redirect to admin login page
        window.location.href = '/admin-login';
      } else {
        // Keep form action as /md-login for MD login
        if (loginForm) {
          loginForm.action = '/md-login';
        }
      }
    });
  });
});