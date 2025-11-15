document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  const districtSelect = document.getElementById('district');
  const citySelect = document.getElementById('city');



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
        // Find the correct ISD code - for countries with multiple entries, find the most common one
        let isdCode = '';

        if (country.toLowerCase() === 'india') {
          // For India, specifically look for +91
          const indiaEntry = data.find(item => item.idd && item.idd.root === '+9' && item.idd.suffixes && item.idd.suffixes.includes('1'));
          if (indiaEntry) {
            isdCode = indiaEntry.idd.root + indiaEntry.idd.suffixes[0];
          }
        } else {
          // For other countries, take the first valid entry
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



  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      let valid = true;

      const fields = [
        { id: 'full_name' },
        { id: 'professionalHeadline' },
        { id: 'professionalSummary' },
        { id: 'phoneNumber', pattern: /^[0-9]{10}$/ },
        { id: 'country' },
        { id: 'state' },
        { id: 'district' },
        { id: 'city' },
        { id: 'pinCode', pattern: /^[0-9]{6}$/ },
        { id: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { id: 'password', min: 8 },
        { id: 'resume' },
      ];

      fields.forEach((field) => {
        const el = document.getElementById(field.id);
        if (!el) return;
        const msg = el.nextElementSibling;
        let isValid = true;

        if (!el.value.trim()) isValid = false;
        if (field.pattern && !field.pattern.test(el.value.trim())) isValid = false;
        if (field.min && el.value.trim().length < field.min) isValid = false;

        if (!isValid) {
          el.classList.add('is-invalid');
          if (msg) msg.style.display = 'block';
          valid = false;
        } else {
          el.classList.remove('is-invalid');
          if (msg) msg.style.display = 'none';
        }
      });

      if (!valid) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});


