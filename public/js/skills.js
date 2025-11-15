document.addEventListener('DOMContentLoaded', function() {
  let skillCount = document.querySelectorAll('.skill-entry').length || (window.existingSkills && window.existingSkills.length > 0 ? window.existingSkills.length : 1);

  // Populate existing skills data
  if (window.existingSkills && window.existingSkills.length > 0) {
    window.existingSkills.forEach((skill, index) => {
      if (index > 0) {
        addSkill();
      }
      setTimeout(() => {
        const skillInput = document.querySelector(`input[name="skills[${index}][skill_name]"]`);
        if (skillInput) {
          skillInput.value = skill.skill_name || '';
        }
      }, 100);
    });
  }

  function addSkill() {
    const container = document.getElementById('skillsContainer');
    const skillIndex = skillCount++;

    const skillHtml = `
      <div class="skill-entry">
        <input type="text" name="skills[${skillIndex}][skill_name]" class="skill-input" placeholder="e.g. Python" required>
        <span class="error-message">Please enter a skill.</span>
        <button type="button" class="remove-skill" onclick="removeSkill(this)">Remove</button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', skillHtml);
  }

  function removeSkill(button) {
    button.closest('.skill-entry').remove();
    skillCount--;
  }

  // Form validation
  const skillsForm = document.getElementById('skillsForm');
  if (skillsForm) {
    skillsForm.addEventListener('submit', function(e) {
      let valid = true;

      // Validate all skill inputs
      const skillInputs = document.querySelectorAll('.skill-input');
      skillInputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          input.nextElementSibling.style.display = 'block';
          valid = false;
        } else {
          input.classList.remove('is-invalid');
          input.nextElementSibling.style.display = 'none';
        }
      });

      if (!valid) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Make functions global
  window.addSkill = addSkill;
  window.removeSkill = removeSkill;
});
