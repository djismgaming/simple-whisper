document.addEventListener('DOMContentLoaded', function() {
    const MODELS_KEY = 'whisper-model-configs';

    const DEFAULT_MODEL_CONFIG = {
        id: 'model-1',
        name: 'whispercpp',
        temperature: '0.0',
        temperature_inc: '0.2',
        serverUrl: 'http://localhost:8080/v1/audio/transcriptions'
    };

    const DEFAULT_MODELS = [
        { ...DEFAULT_MODEL_CONFIG },
        { id: 'model-2', name: 'whispercpp1', temperature: '0.0', temperature_inc: '0.2', serverUrl: 'http://localhost:8080/v1/audio/transcriptions' },
        { id: 'model-3', name: 'whispercpp2', temperature: '0.0', temperature_inc: '0.2', serverUrl: 'http://localhost:8080/v1/audio/transcriptions' }
    ];

    const form = document.getElementById('transcription-form');
    const fileInput = document.getElementById('file-input');
    const modelSelect = document.getElementById('model-select');
    const submitBtn = document.getElementById('submit-btn');
    const fileInfo = document.getElementById('file-info');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const errorContainer = document.getElementById('error-container');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copySuccess = document.getElementById('copy-success');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const settingsError = document.getElementById('settings-error');
    const settingsSuccess = document.getElementById('settings-success');

    function getModelConfigs() {
        const stored = localStorage.getItem(MODELS_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                // Invalid JSON, fall through to defaults
            }
            localStorage.removeItem(MODELS_KEY);
        }
        return [...DEFAULT_MODELS];
    }

    function saveModelConfigs(configs) {
        localStorage.setItem(MODELS_KEY, JSON.stringify(configs));
    }

    function populateModelSelect() {
        const configs = getModelConfigs();
        const previousValue = modelSelect.value;
        modelSelect.innerHTML = '';
        configs.forEach(function(config) {
            const option = document.createElement('option');
            option.value = config.id;
            option.textContent = config.name;
            modelSelect.appendChild(option);
        });
        if (previousValue) {
            const stillExists = configs.some(function(c) { return c.id === previousValue; });
            if (stillExists) {
                modelSelect.value = previousValue;
            }
        }
    }

    function loadSettingsIntoModal() {
        const configs = getModelConfigs();
        configs.forEach(function(config, index) {
            const slot = index + 1;
            document.getElementById('model-name-' + slot).value = config.name;
            document.getElementById('temperature-' + slot).value = config.temperature;
            document.getElementById('temperature-inc-' + slot).value = config.temperature_inc;
            document.getElementById('server-url-' + slot).value = config.serverUrl || DEFAULT_MODEL_CONFIG.serverUrl;
        });
    }

    function showSettingsError(message) {
        settingsError.textContent = message;
        settingsError.classList.add('show');
        setTimeout(function() {
            settingsError.classList.remove('show');
        }, 3000);
    }

    function showSettingsSuccess(message) {
        settingsSuccess.textContent = message;
        settingsSuccess.classList.add('show');
        setTimeout(function() {
            settingsSuccess.classList.remove('show');
        }, 2000);
    }

    function openSettings() {
        console.log('openSettings called');
        try {
            loadSettingsIntoModal();
            settingsModal.classList.add('show');
            settingsError.classList.remove('show');
            settingsSuccess.classList.remove('show');
        } catch (e) {
            console.error('Error in openSettings:', e);
        }
    }

    function closeSettings() {
        settingsModal.classList.remove('show');
    }

    function saveSettings() {
        const existingConfigs = getModelConfigs();
        const configs = [];
        for (let i = 1; i <= 3; i++) {
            const name = document.getElementById('model-name-' + i).value.trim();
            const temperature = document.getElementById('temperature-' + i).value.trim();
            const temperatureInc = document.getElementById('temperature-inc-' + i).value.trim();
            const serverUrl = document.getElementById('server-url-' + i).value.trim();

            if (!name) {
                showSettingsError('Model name is required for slot ' + i);
                return;
            }

            const existingConfig = existingConfigs[i - 1];
            configs.push({
                id: existingConfig ? existingConfig.id : 'model-' + i,
                name: name,
                temperature: temperature || '0.0',
                temperature_inc: temperatureInc || '0.2',
                serverUrl: serverUrl || DEFAULT_MODEL_CONFIG.serverUrl
            });
        }

        saveModelConfigs(configs);
        populateModelSelect();
        showSettingsSuccess('Settings saved successfully!');
    }

    function restoreDefault(slot) {
        document.getElementById('model-name-' + slot).value = DEFAULT_MODEL_CONFIG.name;
        document.getElementById('temperature-' + slot).value = DEFAULT_MODEL_CONFIG.temperature;
        document.getElementById('temperature-inc-' + slot).value = DEFAULT_MODEL_CONFIG.temperature_inc;
        document.getElementById('server-url-' + slot).value = DEFAULT_MODEL_CONFIG.serverUrl;
    }

    populateModelSelect();

    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);

    document.querySelectorAll('.restore-default-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const slot = parseInt(btn.getAttribute('data-slot'));
            restoreDefault(slot);
        });
    });

    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });

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

        const selectedModelId = modelSelect.value;
        const configs = getModelConfigs();
        const selectedConfig = configs.find(function(c) { return c.id === selectedModelId; }) || DEFAULT_MODEL_CONFIG;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('temperature', selectedConfig.temperature);
        formData.append('temperature_inc', selectedConfig.temperature_inc);
        formData.append('model', selectedConfig.name);

        const serverUrl = selectedConfig.serverUrl || DEFAULT_MODEL_CONFIG.serverUrl;

        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
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

    clearBtn.addEventListener('click', function() {
        hideResult();
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
        clearBtn.disabled = false;
    }

    function hideResult() {
        resultContainer.classList.remove('show');
        clearBtn.disabled = true;
    }

    function showCopySuccess(message) {
        copySuccess.textContent = message;
        copySuccess.classList.add('show');
    }

    function hideCopySuccess() {
        copySuccess.classList.remove('show');
    }
});