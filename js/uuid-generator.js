document.addEventListener('DOMContentLoaded', () => {
    const generatedUuidDisplay = document.getElementById('generated-uuid');
    const generateBtn = document.getElementById('generate-btn');
    const copyUuidBtn = document.getElementById('copy-uuid-btn');
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

    // Toast Notification
    function showToast() {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }
});
