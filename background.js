// Mock data for development - Remove when real backend is ready
const mockSegmentationData = {
    segmented_text: [
        { word: "今天", translation: "today"},
        { word: "天气", translation: "weather" },
        { word: "很好", translation: "very good"},
        { word: "今天", translation: "today"},
        { word: "天气", translation: "weather" },
        { word: "很好", translation: "very good"},
        { word: "今天", translation: "today"},
        { word: "天气", translation: "weather" },
        { word: "很好", translation: "very good"}
    ]
};

// Simulate API call delay
const simulateAPIDelay = () => new Promise(resolve => setTimeout(resolve, 800));

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "segmentChinese") {
        handleSegmentationRequest(request.text, sendResponse);
        return true; 
    }
});

async function handleSegmentationRequest(text, sendResponse) {
    try {
        // For now,it is mock data
        await simulateAPIDelay();

        // TODO: Replace with real API call when backend is ready
        // const realData = await callRealAIBackend(text);
        // sendResponse({ data: realData });

        sendResponse({ data: mockSegmentationData });

    } catch (error) {
        console.error('Segmentation error:', error);
        sendResponse({ error: error.message });
    }
}

// Real API call function (for future use)
async function callRealAIBackend(chineseText) {
    const response = await fetch('http://localhost:8080/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chineseText })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}