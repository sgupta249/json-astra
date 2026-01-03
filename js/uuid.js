document.addEventListener('DOMContentLoaded', () => {
    const generatedUuidDisplay = document.getElementById('generated-uuid');
    const generateBtn = document.getElementById('generate-btn');
    const copyUuidBtn = document.getElementById('copy-uuid-btn');
    const uuidInput = document.getElementById('uuid-input');
    const validateBtn = document.getElementById('validate-btn');
    const validationResult = document.getElementById('validation-result');
    const toast = document.getElementById('toast');

    // UUID Generator Function
    function generateUUID() {
        // Use crypto.randomUUID if available (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback for older environments
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function setNewUUID() {
        const newUuid = generateUUID();
        generatedUuidDisplay.textContent = newUuid;
    }

    // Initial generation
    setNewUUID();

    // Event Listeners
    generateBtn.addEventListener('click', setNewUUID);

    copyUuidBtn.addEventListener('click', () => {
        const uuid = generatedUuidDisplay.textContent;
        navigator.clipboard.writeText(uuid).then(() => {
            showToast();
        });
    });

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

    // Toast Notification
    function showToast() {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }
});
