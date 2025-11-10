// State management
const states = {
    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    error: document.getElementById('error'),
    instructions: document.getElementById('instructions')
};

function showState(state) {
    Object.values(states).forEach(s => s.classList.add('hidden'));
    states[state].classList.remove('hidden');
}

// Get selected text from the active tab
async function getSelectedTextFromPage() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, (response) => {
                    resolve(response?.text || '');
                });
            } else {
                resolve('');
            }
        });
    });
}

// Send text to background for processing
async function segmentChineseText(text) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: "segmentChinese",
            text: text
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve(null);
            } else {
                resolve(response?.data);
            }
        });
    });
}

// Display results in the popup
function displayResults(originalText, segmentedData) {
    document.getElementById('originalText').textContent = originalText;

    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';

    segmentedData.segmented_text.forEach(item => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';

        wordElement.innerHTML = `
            <div class="word-chinese">${item.word}</div>
            <div class="word-translation">${item.translation}</div>
        `;

        wordList.appendChild(wordElement);
    });
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showState('error');
}

// Main initialization - runs when popup opens
async function initializePopup() {
    try {
        // Get selected text from current page
        const selectedText = await getSelectedTextFromPage();

        if (!selectedText) {
            showState('instructions');
            return;
        }

        // Show loading state
        showState('loading');

        // Call background script to segment the text
        const segmentedData = await segmentChineseText(selectedText);

        if (!segmentedData) {
            throw new Error('Segmentation service unavailable');
        }

        // Display results
        displayResults(selectedText, segmentedData);
        showState('results');

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to process Chinese text');
    }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initializePopup);