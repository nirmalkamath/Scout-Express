// signup.js — improved validation aware of edit / resume state
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  const districtSelect = document.getElementById('district');
  const citySelect = document.getElementById('city');

  // helper: remove options and set placeholder
  function resetSelect(select, placeholder, disabled = true) {
    if (!select) return;
    select.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    select.appendChild(opt);
    select.disabled = disabled;
  }

  function populateSelect(select, values, placeholder) {
    if (!select) return;
    resetSelect(select, placeholder, false);
    values.forEach((val) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
  }

  async function loadCountries() {
    if (!countrySelect) return;
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
      if (!response.ok) throw new Error();
      const countries = await response.json();
      const names = countries
        .map((item) => item && item.name && item.name.common)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      names.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        countrySelect.appendChild(option);
      });
    } catch (error) {
      countrySelect.innerHTML = '<option value="">Unable to load countries</option>';
      countrySelect.disabled = true;
    }
  }

  async function loadISDCode(country) {
    if (!country) return;

    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=idd`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      if (data && data.length > 0) {
        let isdCode = '';

        if (country.toLowerCase() === 'india') {
          const indiaEntry = data.find(item => item.idd && item.idd.root === '+9' && item.idd.suffixes && item.idd.suffixes.includes('1'));
          if (indiaEntry) {
            isdCode = indiaEntry.idd.root + indiaEntry.idd.suffixes[0];
          }
        } else {
          const validEntry = data.find(item => item.idd && item.idd.root && item.idd.suffixes);
          if (validEntry) {
            isdCode = validEntry.idd.root + (validEntry.idd.suffixes[0] || '');
          }
        }

        const isdInput = document.getElementById('isdCode');
        if (isdInput && isdCode) {
          isdInput.value = isdCode;
        }
      }
    } catch (error) {
      console.error('Error loading ISD code:', error);
    }
  }

  loadCountries().then(() => {
    if (countrySelect) {
      if (countrySelect.dataset.existing) {
        countrySelect.value = countrySelect.dataset.existing;
      }
      if (countrySelect.value) {
        countrySelect.dispatchEvent(new Event('change'));
      }
    }
  });

  if (countrySelect) {
    countrySelect.addEventListener('change', async () => {
      const country = countrySelect.value;
      resetSelect(stateSelect, 'Select state');

      if (!country) return;

      // Load ISD code for the selected country
      await loadISDCode(country);

      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ country: country })
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data.error) throw new Error();

        const states = data.data.states.map(state => state.name);
        if (states.length > 0) {
          populateSelect(stateSelect, states, 'Select state');
          if (stateSelect.dataset.existing) {
            stateSelect.value = stateSelect.dataset.existing;
          }
        }
      } catch (error) {
        console.error('Error loading states:', error);
        stateSelect.innerHTML = '<option value="Not Applicable">Not Applicable</option>';
        stateSelect.disabled = false;
      }
    });
  }

  // ---- Validation logic below ----

  // Read server-provided flags (server must set these in EJS)
  // window.candidateId should be a string or null
  // window.hasResume should be true/false (or 'true'/'false')
  const isReturningCandidate = !!(window.candidateId || window.hasResume === true || window.hasResume === 'true');

  // Utility helpers for errors
  function showError(el, message) {
    if (!el) return;
    el.classList.add('is-invalid');
    const msg = el.nextElementSibling;
    if (msg) {
      msg.textContent = message;
      msg.style.display = 'block';
    }
  }

  function hideError(el) {
    if (!el) return;
    el.classList.remove('is-invalid');
    const msg = el.nextElementSibling;
    if (msg) msg.style.display = 'none';
  }

  // Cleanup initial invalid state for fields that should be optional on edit
  (function cleanupInitialInvalidState() {
    try {
      // If returning candidate, ensure resume/password not visually invalid by default
      if (isReturningCandidate) {
        const resumeEl = document.getElementById('resume');
        if (resumeEl) {
          resumeEl.classList.remove('is-invalid');
          const m = resumeEl.nextElementSibling;
          if (m) m.style.display = 'none';
          resumeEl.required = false;
        }
        const passwordEl = document.getElementById('password');
        if (passwordEl) {
          passwordEl.classList.remove('is-invalid');
          const m2 = passwordEl.nextElementSibling;
          if (m2) m2.style.display = 'none';
          passwordEl.required = false;
        }
      }
    } catch (err) {
      // ignore
      console.warn('cleanupInitialInvalidState failed', err);
    }
  })();

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      let valid = true;

      // Define validation rules dynamically
      const fields = [
        { id: 'full_name', required: true },
        { id: 'professionalHeadline', required: true },
        { id: 'professionalSummary', required: true },
        { id: 'phoneNumber', required: true, pattern: /^[0-9]{10}$/ },
        { id: 'country', required: true },
        { id: 'state', required: true },
        { id: 'district', required: true },
        { id: 'city', required: true },
        { id: 'pinCode', required: true, pattern: /^[0-9]{6}$/ },
        { id: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ];

      // Password rules: required for new users, optional for returning
      fields.push({ id: 'password', required: !isReturningCandidate, min: 8 });

      // Resume rules: required for NEW users who don't already have a resume (server sets hasResume)
      const hasResumeFlag = (window.hasResume === true || window.hasResume === 'true');
      const resumeRequired = !isReturningCandidate && !hasResumeFlag;
      // Do not add resume to generic fields because it's a file input; we'll validate separately below.

      // Validate generic fields
      fields.forEach((field) => {
        const el = document.getElementById(field.id);
        if (!el) return;
        const msg = el.nextElementSibling;
        let isValid = true;
        const val = (typeof el.value === 'string') ? el.value.trim() : el.value;

        if (field.required && (!val || val.length === 0)) isValid = false;
        if (field.pattern && val && !field.pattern.test(val)) isValid = false;
        if (field.min && val && val.length < field.min) isValid = false;

        if (!isValid) {
          el.classList.add('is-invalid');
          if (msg) msg.style.display = 'block';
          valid = false;
        } else {
          el.classList.remove('is-invalid');
          if (msg) msg.style.display = 'none';
        }
      });

      // Resume/file validation (separate)
      const resumeEl = document.getElementById('resume');
      if (resumeRequired) {
        // new user AND no existing resume => require upload
        if (!resumeEl || !resumeEl.files || resumeEl.files.length === 0) {
          if (resumeEl) showError(resumeEl, 'Please upload your resume (PDF or DOC, max 2 MB).');
          valid = false;
        }
      } else {
        // optional on edit: if provided, validate type and size (optional)
        if (resumeEl && resumeEl.files && resumeEl.files.length > 0) {
          const f = resumeEl.files[0];
          // size check (2MB)
          if (f && f.size > 2 * 1024 * 1024) {
            showError(resumeEl, 'Resume must be less than 2 MB.');
            valid = false;
          }
          // type check (basic)
          const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          if (f && !allowed.includes(f.type)) {
            showError(resumeEl, 'Resume must be PDF or DOC/DOCX.');
            valid = false;
          }
        } else {
          // ensure no stale invalid class
          if (resumeEl) {
            hideError(resumeEl);
          }
        }
      }

      if (!valid) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});
