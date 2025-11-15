document.addEventListener('DOMContentLoaded', function () {
  const loginTypeItems = document.querySelectorAll('.login-type-item');
  const loginTitle = document.getElementById('loginTitle');
  const loginTypeInput = document.getElementById('loginType');

  if (!loginTypeItems.length) return;

  loginTypeItems.forEach((item) => {
    item.addEventListener('click', function () {
      loginTypeItems.forEach((element) => element.classList.remove('active'));
      this.classList.add('active');
      const title = this.getAttribute('data-title');
      const type = this.getAttribute('data-type');
      if (loginTitle && title) loginTitle.textContent = title;
      if (loginTypeInput && type) loginTypeInput.value = type;
    });
  });
});