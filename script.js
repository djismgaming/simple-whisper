document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('transcription-form');
    const fileInput = document.getElementById('file-input');
    const modelSelect = document.getElementById('model-select');
    const submitBtn = document.getElementById('submit-btn');
    const fileInfo = document.getElementById('file-info');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const errorContainer = document.getElementById('error-container');
    const copyBtn = document.getElementById('copy-btn');
    const copySuccess = document.getElementById('copy-success');

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileInfo.textContent = 'Selected: ' + this.files[0].name;
            submitBtn.disabled = false;
        } else {
            fileInfo.textContent = '';
            submitBtn.disabled = true;
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select a file');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        hideError();
        hideResult();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('temperature', '0.0');
        formData.append('temperature_inc', '0.2');
        formData.append('model', modelSelect.value);

        try {
            const response = await fetch('http://localhost:8080/v1/audio/transcriptions', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.text) {
                showResult(data.text);
            } else {
                showError('No transcription found in response');
            }
        } catch (error) {
            showError('Error: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });

    copyBtn.addEventListener('click', function() {
        const text = resultText.textContent;
        
        if (!text) return;

        navigator.clipboard.writeText(text).then(function() {
            showCopySuccess('Copied to clipboard!');
            
            setTimeout(function() {
                hideCopySuccess();
            }, 2000);
        }).catch(function(err) {
            showError('Failed to copy: ' + err.message);
        });
    });

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.add('show');
    }

    function hideError() {
        errorContainer.classList.remove('show');
    }

    function showResult(text) {
        resultText.textContent = text;
        resultContainer.classList.add('show');
    }

    function hideResult() {
        resultContainer.classList.remove('show');
    }

    function showCopySuccess(message) {
        copySuccess.textContent = message;
        copySuccess.classList.add('show');
    }

    function hideCopySuccess() {
        copySuccess.classList.remove('show');
    }
});