// background.js

// Example function to perform some action
function doSomething(message) {
    console.log("Background script received:", message);
    return `Processed message: ${message}`;
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "doSomething") {
        const result = doSomething(request.data);
        sendResponse({ result });
    }

    if (request.action === "walmartExtractIngredients") {
        console.log(request.data)
        const result = fetchHtml(request.data);
        sendResponse({ result });
    }
    // Return true to indicate an asynchronous response if needed
    return true;
});

  
  // Utility function to fetch HTML using XMLHttpRequest
  async function fetchHtml(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch HTML. Status: ${response.status}`);
        }

        const html = await response.text();
        return html;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    }
}
  
