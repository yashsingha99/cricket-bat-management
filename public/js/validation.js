// Client-side validation using Bootstrap

document.addEventListener('DOMContentLoaded', function() {
    // Fetch all forms that need validation
    const forms = document.querySelectorAll('.needs-validation');
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      }, false);
    });
  
    // Password match validation for registration form
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');
    
    if (password && password2) {
      password2.addEventListener('input', function() {
        if (password.value !== password2.value) {
          password2.setCustomValidity('Passwords do not match');
        } else {
          password2.setCustomValidity('');
        }
      });
    }
  
    // Image file type validation
    const imageInput = document.getElementById('image');
    if (imageInput) {
      imageInput.addEventListener('change', function() {
        const file = this.files[0];
        const fileType = file.type;
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        
        if (!validImageTypes.includes(fileType)) {
          this.value = '';
          alert('Please select a valid image file (jpeg, jpg, png, gif)');
        }
  
        // Check file size (max 1MB)
        if (file.size > 1000000) {
          this.value = '';
          alert('File size should be less than 1MB');
        }
      });
    }
  
    // Add Bootstrap form validation classes to forms
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
      registerForm.classList.add('needs-validation');
      registerForm.setAttribute('novalidate', '');
    }
  
    const loginForm = document.querySelector('form[action="/auth/login"]');
    if (loginForm) {
      loginForm.classList.add('needs-validation');
      loginForm.setAttribute('novalidate', '');
    }
  
    const newBatForm = document.querySelector('form[action="/bats"]');
    if (newBatForm) {
      newBatForm.classList.add('needs-validation');
      newBatForm.setAttribute('novalidate', '');
    }
  });