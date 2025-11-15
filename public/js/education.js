document.addEventListener('DOMContentLoaded', function() {
  let educationCount = document.querySelectorAll('.education-entry').length || (window.existingEducation && window.existingEducation.length > 0 ? window.existingEducation.length : 1);

  // Populate existing education data
  if (window.existingEducation && window.existingEducation.length > 0) {
    window.existingEducation.forEach((edu, index) => {
      if (index > 0) {
        //addEducationEntry();
      }
      setTimeout(() => {
        const institutionEl = document.getElementById(`institution_${index}`);
        const degreeEl = document.getElementById(`degree_${index}`);
        const fieldOfStudyEl = document.getElementById(`field_of_study_${index}`);
        const startDateEl = document.getElementById(`start_date_${index}`);
        const endDateEl = document.getElementById(`end_date_${index}`);
        const currentlyStudyingEl = document.getElementById(`currently_studying_${index}`);

        if (institutionEl) institutionEl.value = edu.institution || '';
        if (degreeEl) degreeEl.value = edu.degree || '';
        if (fieldOfStudyEl) fieldOfStudyEl.value = edu.field_of_study || '';
        if (startDateEl) startDateEl.value = edu.start_date || '';
        if (endDateEl) endDateEl.value = edu.end_date || '';
        if (currentlyStudyingEl && edu.currently_studying === 'on') {
          currentlyStudyingEl.checked = true;
          if (endDateEl) endDateEl.disabled = true;
        }
      }, 100);
    });
  }

  function addEducationEntry() {
    const container = document.getElementById('educationEntries');
    const entryIndex = educationCount++;

    const entryHtml = `
      <div class="education-entry">
        <div class="education-entry-header">
          <h4>Education ${entryIndex + 1}</h4>
          <button type="button" class="remove-entry" onclick="removeEducationEntry(this)">Remove</button>
        </div>
        
        <div class="auth-grid">
          <div class="auth-field">
            <label for="degree_${entryIndex}">Degree <span class="required">*</span></label>
            <input id="degree_${entryIndex}" name="education[${entryIndex}][degree]" type="text" placeholder="e.g. Bachelor of Science" required>
            <span class="error-message">Please enter your degree.</span>
          </div>

          
          <div class="auth-field">
            <label for="institution_${entryIndex}">Institution <span class="required">*</span></label>
            <input id="institution_${entryIndex}" name="education[${entryIndex}][institution]" type="text" placeholder="e.g. Stanford University" required>
            <span class="error-message">Please enter institution name.</span>
          </div>


          <div class="auth-field">
            <label for="graduation_year_${entryIndex}">Graduation year <span class="required">*</span></label>
            <input id="graduation_year_${entryIndex}" name="education[${entryIndex}][graduation_year]" type="number" min="1900" max="2030" required>
            <span class="error-message">Please enter graduation year.</span>
          </div>  

          <div class="auth-field">
            <label for="grade_${entryIndex}">Grade/Percentage</label>
            <input id="grade_${entryIndex}" name="education[${entryIndex}][grade]" placeholder="e.g. 70% or A+">
            <span class="error-message">Please enter grade.</span>
          </div>

        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', entryHtml);
  }

  function removeEducationEntry(button) {
    button.closest('.education-entry').remove();
    educationCount--;

    // Hide remove button if only one entry remains
    if (educationCount === 1) {
      const removeButtons = document.querySelectorAll('.remove-entry');
      removeButtons.forEach(btn => btn.style.display = 'none');
    }
  }

  function toggleEducationEndDate(index) {
    const checkbox = document.getElementById(`currently_studying_${index}`);
    const endDateInput = document.getElementById(`end_date_${index}`);

    if (checkbox.checked) {
      endDateInput.value = '';
      endDateInput.disabled = true;
      endDateInput.required = false;
    } else {
      endDateInput.disabled = false;
      endDateInput.required = true;
    }
  }

  // Form validation
  const educationForm = document.getElementById('educationForm');
  if (educationForm) {
    educationForm.addEventListener('submit', function(e) {
      let valid = true;

      // Validate all education entries
      const entries = document.querySelectorAll('.education-entry');
      entries.forEach((entry, index) => {
        const institution = entry.querySelector(`[name="education[${index}][institution]"]`);
        const degree = entry.querySelector(`[name="education[${index}][degree]"]`);
        const fieldOfStudy = entry.querySelector(`[name="education[${index}][field_of_study]"]`);
        const startDate = entry.querySelector(`[name="education[${index}][start_date]"]`);
        const endDate = entry.querySelector(`[name="education[${index}][end_date]"]`);
        const currentlyStudying = entry.querySelector(`[name="education[${index}][currently_studying]"]`);

        // Validate required fields
        [institution, degree, fieldOfStudy, startDate].forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('is-invalid');
            field.nextElementSibling.style.display = 'block';
            valid = false;
          } else {
            field.classList.remove('is-invalid');
            field.nextElementSibling.style.display = 'none';
          }
        });

        // Validate date logic
        if (startDate.value && endDate.value && !currentlyStudying.checked) {
          if (new Date(startDate.value) > new Date(endDate.value)) {
            endDate.classList.add('is-invalid');
            endDate.nextElementSibling.style.display = 'block';
            valid = false;
          } else {
            endDate.classList.remove('is-invalid');
            endDate.nextElementSibling.style.display = 'none';
          }
        }
      });

      if (!valid) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function skipEducation() {
    window.location.href = '/job-preferences';
  }

  // Make functions global
  window.addEducationEntry = addEducationEntry;
  window.removeEducationEntry = removeEducationEntry;
  window.toggleEducationEndDate = toggleEducationEndDate;
  window.skipEducation = skipEducation;
});
