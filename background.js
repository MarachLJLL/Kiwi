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
        const result = walmartExtractIngredients(request.data);
        sendResponse({ result });
    }
    // Return true to indicate an asynchronous response if needed
    return true;
});

async function walmartExtractIngredients(url) {
    try {
      // Fetch the HTML content of the page
      const response = await getHtmlDocument(url);
  
      if (!response) {
        return "Failed to fetch the HTML content.";
      }
  
      
      const document = response;
  
      // Find the <script> tag with id="__NEXT_DATA__"
      const scriptTag = document.querySelector("script#__NEXT_DATA__");
      if (!scriptTag) {
        return "Script tag with id='__NEXT_DATA__' not found";
      }
  
      const scriptContent = scriptTag.textContent;
      if (!scriptContent) {
        return "No content found inside <script> tag";
      }
  
      // Parse the JSON content from the script
      const data = JSON.parse(scriptContent);
  
      // Extract ingredients
      const ingredients =
        data?.props?.pageProps?.initialData?.data?.idml?.ingredients?.ingredients?.value;
  
      // Get the product title
      const titleElement = document.querySelector("#main-title");
      const productTitle = titleElement ? titleElement.textContent.trim() : "No title found";
  
      // Return ingredients or title if no ingredients found
      if (!ingredients || ingredients.toLowerCase().trim() === "none") {
        return `${productTitle}`;
      }
  
      return `${ingredients}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  
  // Utility function to fetch HTML using XMLHttpRequest
async function getHtmlDocument(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch the page. Status: ${response.status}`);
        }

        const html = await response.text(); // Get the HTML content as text
        return html;
    } catch (error) {
        console.error("Error fetching the HTML content:", error);
        return null;
    }
}
  
