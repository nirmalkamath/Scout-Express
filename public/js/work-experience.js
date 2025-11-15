document.addEventListener('DOMContentLoaded', function () {
  const workExperienceForm = document.getElementById('workExperienceForm');
  const workEntries = document.getElementById('workEntries');
  let entryCount = document.querySelectorAll('.work-entry').length || (window.existingExperience && window.existingExperience.length > 0 ? window.existingExperience.length : 1);

  // Populate existing experience data
  if (window.existingExperience && window.existingExperience.length > 0) {
    window.existingExperience.forEach((exp, index) => {
      if (index === 0) {
        // Populate first entry
        const companyEl = document.getElementById('company_0');
        const positionEl = document.getElementById('position_0');
        const startDateEl = document.getElementById('start_date_0');
        const endDateEl = document.getElementById('end_date_0');
        const descriptionEl = document.getElementById('description_0');
        const currentlyWorkingEl = document.getElementById('currently_working_0');

        if (companyEl) companyEl.value = exp.company || '';
        if (positionEl) positionEl.value = exp.position || '';
        if (startDateEl) startDateEl.value = exp.start_date || '';
        if (endDateEl) endDateEl.value = exp.end_date || '';
        if (descriptionEl) descriptionEl.value = exp.description || '';
        if (currentlyWorkingEl && exp.currently_working === 'on') {
          currentlyWorkingEl.checked = true;
          if (endDateEl) endDateEl.disabled = true;
        }
      } else {
        // Add and populate additional entries
        //addWorkEntry();
        setTimeout(() => {
          const companyEl = document.getElementById(`company_${index}`);
          const positionEl = document.getElementById(`position_${index}`);
          const startDateEl = document.getElementById(`start_date_${index}`);
          const endDateEl = document.getElementById(`end_date_${index}`);
          const descriptionEl = document.getElementById(`description_${index}`);
          const currentlyWorkingEl = document.getElementById(`currently_working_${index}`);

          if (companyEl) companyEl.value = exp.company || '';
          if (positionEl) positionEl.value = exp.position || '';
          if (startDateEl) startDateEl.value = exp.start_date || '';
          if (endDateEl) endDateEl.value = exp.end_date || '';
          if (descriptionEl) descriptionEl.value = exp.description || '';
          if (currentlyWorkingEl && exp.currently_working === 'on') {
            currentlyWorkingEl.checked = true;
            if (endDateEl) endDateEl.disabled = true;
          }
        }, 100);
      }
    });
  }

  function toggleEndDate(index) {
    const endDate = document.getElementById(`end_date_${index}`);
    const currentlyWorking = document.getElementById(`currently_working_${index}`);
    endDate.disabled = currentlyWorking.checked;
    if (currentlyWorking.checked) {
      endDate.value = '';
    }
  }

  window.toggleEndDate = toggleEndDate;

  function addWorkEntry() {
    const entryIndex = entryCount++;
    const entryDiv = document.createElement('div');
    entryDiv.className = 'work-entry';
    entryDiv.innerHTML = `
      <div class="work-entry-header">
        <h4>Work Experience ${entryIndex + 1}</h4>
        <button type="button" class="remove-entry">Remove</button>
      </div>
      <div class="auth-grid">
        <div class="auth-field">
          <label for="company_${entryIndex}">Company Name <span class="required">*</span></label>
          <input id="company_${entryIndex}" name="work_experience[${entryIndex}][company]" type="text" placeholder="e.g. Google Inc." required>
          <span class="error-message">Please enter company name.</span>
        </div>
        <div class="auth-field">
          <label for="position_${entryIndex}">Position <span class="required">*</span></label>
          <input id="position_${entryIndex}" name="work_experience[${entryIndex}][position]" type="text" placeholder="e.g. Software Engineer" required>
          <span class="error-message">Please enter your position.</span>
        </div>
        <div class="auth-field">
          <label for="start_date_${entryIndex}">Start Date <span class="required">*</span></label>
          <input id="start_date_${entryIndex}" name="work_experience[${entryIndex}][start_date]" type="date" required>
          <span class="error-message">Please select start date.</span>
        </div>
        <div class="auth-field">
          <label for="end_date_${entryIndex}">End Date</label>
          <input id="end_date_${entryIndex}" name="work_experience[${entryIndex}][end_date]" type="date">
          <span class="error-message">End date cannot be before start date.</span>
        </div>
       
        <div class="auth-field full-width">
          <label for="description_${entryIndex}">Job Description <span class="required">*</span></label>
          <textarea id="description_${entryIndex}" name="work_experience[${entryIndex}][description]" rows="3" placeholder="Describe your responsibilities and achievements." required></textarea>
          <span class="error-message">Please provide job description.</span>
        </div>
         <div>
          <label>
            <strong>I currently work here </strong><input id="currently_working_${entryIndex}" name="work_experience[${entryIndex}][currently_working]" type="checkbox" value="on">
            
          </label>
        </div>
      </div>
    `;
    workEntries.appendChild(entryDiv);

    // Add event listener for remove button
    entryDiv.querySelector('.remove-entry').addEventListener('click', function () {
      entryDiv.remove();
      updateEntryHeaders();
      entryCount--;
    });

    // Add event listener for currently working checkbox
    const currentlyWorking = entryDiv.querySelector(`#currently_working_${entryIndex}`);
    const endDate = entryDiv.querySelector(`#end_date_${entryIndex}`);
    currentlyWorking.addEventListener('change', function () {
      endDate.disabled = this.checked;
      if (this.checked) {
        endDate.value = '';
      }
    });

    updateEntryHeaders();
  }

  function updateEntryHeaders() {
    const entries = workEntries.querySelectorAll('.work-entry');
    entries.forEach((entry, index) => {
      const header = entry.querySelector('h4');
      header.textContent = `Work Experience ${index + 1}`;
      const removeBtn = entry.querySelector('.remove-entry');
      removeBtn.style.display = entries.length > 1 ? 'block' : 'none';
    });
  }

  // Add entry button
  const addButton = document.querySelector('.add-entry');
  if (addButton) {
    addButton.addEventListener('click', addWorkEntry);
  }

  // Form validation
  if (workExperienceForm) {
    workExperienceForm.addEventListener('submit', function (e) {
      let valid = true;
      const entries = workEntries.querySelectorAll('.work-entry');

      entries.forEach((entry, entryIndex) => {
        const fields = [
          { id: `company_${entryIndex}`, name: 'Company Name' },
          { id: `position_${entryIndex}`, name: 'Position' },
          { id: `start_date_${entryIndex}`, name: 'Start Date' },
          { id: `description_${entryIndex}`, name: 'Job Description' }
        ];

        fields.forEach((field) => {
          const el = entry.querySelector(`#${field.id}`);
          const msg = el.nextElementSibling;
          if (!el.value.trim()) {
            el.classList.add('is-invalid');
            if (msg) msg.style.display = 'block';
            valid = false;
          } else {
            el.classList.remove('is-invalid');
            if (msg) msg.style.display = 'none';
          }
        });

        // Date validation
        const startDate = entry.querySelector(`#start_date_${entryIndex}`);
        const endDate = entry.querySelector(`#end_date_${entryIndex}`);
        const currentlyWorking = entry.querySelector(`#currently_working_${entryIndex}`);

        if (startDate.value && endDate.value && !currentlyWorking.checked) {
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

  // Initially hide remove button for first entry
  updateEntryHeaders();
});

 function removeWorkEntry(button) {
      button.closest('.work-entry').remove();
      entryCount--;

      // Hide remove button if only one entry remains
      if (entryCount === 1) {
        const removeButtons = document.querySelectorAll('.remove-entry');
        removeButtons.forEach(btn => btn.style.display = 'none');
      }
    }

function skipWorkExperience() {
      window.location.href = '/education';
}