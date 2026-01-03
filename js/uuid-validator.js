document.addEventListener('DOMContentLoaded', () => {
    const uuidInput = document.getElementById('uuid-input');
    const validateBtn = document.getElementById('validate-btn');
    const validationResult = document.getElementById('validation-result');

    // Validator Logic
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    function validateUUID() {
        const input = uuidInput.value.trim();
        if (!input) {
            validationResult.style.display = 'none';
            return;
        }

        const isValid = uuidRegex.test(input);
        validationResult.style.display = 'block';

        if (isValid) {
            validationResult.textContent = 'Valid UUID';
            validationResult.className = 'validation-result valid';
        } else {
            validationResult.textContent = 'Invalid UUID';
            validationResult.className = 'validation-result invalid';
        }
    }

    validateBtn.addEventListener('click', validateUUID);
});
