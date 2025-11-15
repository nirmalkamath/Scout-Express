document.addEventListener('DOMContentLoaded', function() {
  // Form validation
  const jobPreferencesForm = document.getElementById('jobPreferencesForm');
  if (jobPreferencesForm) {
    jobPreferencesForm.addEventListener('submit', function(e) {
      let valid = true;

      // Validate required fields
      const expectedSalary = document.getElementById('expected_salary');
      const availability = document.getElementById('availability');

      if (!expectedSalary.value.trim()) {
        expectedSalary.classList.add('is-invalid');
        expectedSalary.nextElementSibling.style.display = 'block';
        valid = false;
      } else {
        expectedSalary.classList.remove('is-invalid');
        expectedSalary.nextElementSibling.style.display = 'none';
      }

      if (!availability.value) {
        availability.classList.add('is-invalid');
        availability.nextElementSibling.style.display = 'block';
        valid = false;
      } else {
        availability.classList.remove('is-invalid');
        availability.nextElementSibling.style.display = 'none';
      }

      if (!valid) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});
