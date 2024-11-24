// WalmartSearchPage.js

console.log("WalmartSearchPage.js is running");

// Load the API key
let apiKey; // Declare apiKey at the top so it's accessible in all functions
async function loadApiKey() {
    try {
        const response = await fetch(chrome.runtime.getURL('api.txt'));
        if (!response.ok) throw new Error('Failed to fetch the API key');
        apiKey = (await response.text()).trim();
        console.log('API Key loaded:', apiKey);
    } catch (error) {
        console.error('❌ Error loading API key:', error.message);
    }
}

// Initialize by loading the API key
loadApiKey();

// Function to check if the extension is toggled on
function isExtensionToggledOn() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['toggleState'], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(Boolean(result.toggleState));
            }
        });
    });
}

// Listen for storage changes to toggleState
chrome.storage.onChanged.addListener(async function (changes, areaName) {
    if (areaName === 'local' && changes.toggleState) {
        const toggleState = changes.toggleState.newValue;
        console.log('Toggle state changed:', toggleState);
        if (toggleState) {
            // If toggled on, start processing products
            initializeProductProcessing();
        } else {
            // If toggled off, remove any modifications
            removeAllModifications();
        }
    }
});

// Function to remove all modifications made by the extension
function removeAllModifications() {
    console.log('Removing all modifications...');
    // For simplicity, reload the page to revert changes
    window.location.reload();
}

// Main function to initialize product processing
async function initializeProductProcessing() {
    const isToggledOn = await isExtensionToggledOn();
    if (!isToggledOn) {
        console.log('Extension is toggled off. Exiting...');
        return;
    }

    // Proceed with product processing
    const walmartSearchPage = new WalmartSearchPage(document);
    await walmartSearchPage.init();
}

// On script load, check if extension is toggled on, and if so, start processing
(async function () {
    const isToggledOn = await isExtensionToggledOn();
    if (isToggledOn) {
        initializeProductProcessing();
    } else {
        console.log('Extension is toggled off on load.');
    }
})();

// Define the Product class
class Product {
    constructor(div, productPageLink, imageHTMLElement, rawImageLink, ingredients) {
        this.div = div;
        this.productPageLink = productPageLink;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.ingredients = ingredients;
        this.processedImage = null;
        this.isProcessed = false;
    }

    async processProduct() {
        try {
            const isToggledOn = await isExtensionToggledOn();
            if (!isToggledOn) {
                console.log('Extension is toggled off. Skipping product processing.');
                return;
            }

            const returnJson = await checkDataAvailability(mainFunction, this.ingredients);
            console.log("Raw returnJson:", returnJson);

            if (returnJson && returnJson.Unfit) {
                await this.processImage();
                console.log("Image is processing");
                this.addWarningHover(returnJson.Reason);
            }
            this.isProcessed = true;
        } catch (error) {
            console.error("Error processing product:", error);
        }
    }

    addWarningHover(reason) {
        const targetSpan = this.div.querySelector('.mb1.mt2.b.f6.black.mr1.lh-copy');
        const originalBrand = targetSpan ? targetSpan.textContent : '';

        this.div.addEventListener('mouseenter', () => {
            if (targetSpan) {
                targetSpan.textContent = reason;
                targetSpan.style.color = 'red';
            }
        });

        this.div.addEventListener('mouseleave', () => {
            if (targetSpan) {
                targetSpan.textContent = originalBrand;
                targetSpan.style.color = '';
            }
        });
    }

    async processImage(retries = 2) {
        const params = {
            mainImageUrl: this.rawImageLink,
            markImageUrl: 'https://i.postimg.cc/4NHhhwkJ/XKiwi.png', // Your watermark image
            position: 'center',
            opacity: 1.0,
            markRatio: 1.0,
        };

        const makeRequest = async (attempt) => {
            try {
                const response = await fetch('https://quickchart.io/watermark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(params),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.blob();
                if (data instanceof Blob) {
                    const imageUrl = URL.createObjectURL(data);
                    this.processedImage = imageUrl;

                    if (this.imageHTMLElement.hasAttribute('srcset')) {
                        this.imageHTMLElement.removeAttribute('srcset');
                    }
                    if (this.imageHTMLElement.hasAttribute('src')) {
                        this.imageHTMLElement.src = this.processedImage;
                    }
                }
            } catch (error) {
                console.error(`Error on attempt ${attempt}:`, error);

                if (attempt < retries) {
                    console.log(`Retrying... (${attempt + 1}/${retries})`);
                    await makeRequest(attempt + 1);
                } else {
                    console.error("Max retries reached. Failed to process image.");
                }
            }
        };

        await makeRequest(1);
    }
}

// Function to check if the required data is available
function checkDataAvailability(callback, groceryIngredients) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['dietaryRestrictions', 'ingredientsToAvoid', 'toggleState'], function (result) {
            if (result.dietaryRestrictions && result.ingredientsToAvoid && result.toggleState !== undefined) {
                const returnJson = callback(result, groceryIngredients);
                resolve(returnJson);
            } else {
                console.log('Data not available yet. Setting up listener...');
                chrome.storage.onChanged.addListener(function onStorageChange(changes, namespace) {
                    if (namespace === 'local') {
                        const hasDietaryRestrictions = 'dietaryRestrictions' in changes || result.dietaryRestrictions;
                        const hasIngredientsToAvoid = 'ingredientsToAvoid' in changes || result.ingredientsToAvoid;
                        const hasToggleState = 'toggleState' in changes || result.toggleState !== undefined;

                        if (hasDietaryRestrictions && hasIngredientsToAvoid && hasToggleState) {
                            chrome.storage.local.get(['dietaryRestrictions', 'ingredientsToAvoid', 'toggleState'], function (newResult) {
                                chrome.storage.onChanged.removeListener(onStorageChange);
                                const returnJson = callback(newResult, groceryIngredients);
                                resolve(returnJson);
                            });
                        }
                    }
                });
            }
        });
    });
}

// Main functionality that requires the data
async function mainFunction(result, groceryIngredients) {
    const isToggledOn = await isExtensionToggledOn();
    if (!isToggledOn) {
        console.log('Extension is toggled off. Skipping mainFunction.');
        return null;
    }

    const dietaryRestrictions = result.dietaryRestrictions;
    const ingredientsToAvoid = result.ingredientsToAvoid;

    if (!apiKey) {
        console.error('API Key is not loaded. Exiting mainFunction.');
        return null;
    }

    const returnJson2 = await checkGroceryOk(dietaryRestrictions, ingredientsToAvoid, groceryIngredients);

    if (returnJson2) {
        console.log('Check Grocery OK Result:', returnJson2);
    } else {
        console.error('Failed to get a response from OpenAI.');
    }

    return returnJson2;
}

// Function to call OpenAI API
async function getChatCompletion(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Error with OpenAI API call:', error.message);
        return null;
    }
}

// Function to construct the verification prompt
function constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. You have previously provided a list of foods to avoid based on the user's dietary goal and specific allergies or restrictions.
EVEN IF THERE IS INSUFFICIENT INFORMATION YOU NEED TO DO YOUR BEST.
User Statement:
"${userInput}"

Previously Generated Foods to Avoid:
Foods_to_avoid = [
${ingredientsToAvoid}
]

Grocery Item Ingredients:
"${groceryIngredients}"

Task:
Determine Fitness: Based on the provided grocery item's ingredients, determine if it is fit for the user to consume considering both their dietary goals and specific allergies or restrictions.
If the grocery item is UNFIT, set "Unfit" to true.
If it is FIT, set "Unfit" to false.
Identify Reasons: If the item is unfit, list the specific ingredients that make it unfit along with the corresponding restriction (e.g., Allergy, Keto Diet). Do not include explanations—only the ingredients themselves with their restrictions, separated by commas.

Response Format:
Provide the response exactly in the following String format without any additional text or code blocks:

"
{
    "Unfit": true/false,
    "Reason": "Ingredient1 (Restriction), Ingredient2 (Restriction), ..."
}
"

Instructions:
Exhaustive and Accurate: Ensure the assessment is comprehensive and includes all relevant factors.
Specificity: Mention exact ingredients causing the issue.
Safety and Thoroughness: Prioritize the user's health by being meticulous.`;
}

// Check if a grocery item is fit
async function checkGroceryOk(userInput, ingredientsToAvoid, groceryIngredients) {
    const verificationPrompt = constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients);

    // Await the API call
    const returnedText = await getChatCompletion(verificationPrompt);

    if (!returnedText) {
        console.error('Failed to retrieve a response from OpenAI. Please try again later.');
        return null;
    }

    // Parse the string into an object
    return parseReturnJSON(returnedText);
}

// Function to parse the returned text into JSON
function parseReturnJSON(returnedText) {
    try {
        // Use regex to extract JSON from the response
        const jsonMatch = returnedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const parsed = JSON.parse(jsonString);
            return parsed;
        } else {
            console.error('Failed to extract JSON from the response.');
            return null;
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}

// Class for handling the Walmart Search Page
class WalmartSearchPage {
    constructor(document) {
        this.document = document;
        this.productContainerSelector = "#\\30 > section > div > div";
        this.processedProducts = new Set();
    }

    async init() {
        console.log("Initializing product processing...");
        await this.processExistingProducts();
    }

    async processExistingProducts() {
        const productDivs = this.getProductElements();

        for (const div of Array.from(productDivs)) {
            if (!this.processedProducts.has(div)) {
                try {
                    const product = await this.divToProduct(div);
                    if (product) {
                        await product.processProduct();
                        this.processedProducts.add(div);
                    }
                } catch (error) {
                    console.error("Error processing product div:", error);
                }
            }
        }
    }

    getProductElements() {
        return this.document.querySelectorAll(this.productContainerSelector);
    }

    async divToProduct(div) {
        try {
            let productPageLink = this.getCompleteUrl(div);
            let ingredients = await walmartExtractIngredients(productPageLink);
            let imageHTMLElement = this.getImageElement(div);
            let rawImageLink = this.getRawImageLink(div);
            if (productPageLink && imageHTMLElement && rawImageLink) {
                return new Product(div, productPageLink, imageHTMLElement, rawImageLink, ingredients);
            }
        } catch (error) {
            console.error("Error processing product:", error);
            return null;
        }
    }

    getCompleteUrl(div) {
        const anchorElements = div.getElementsByTagName("a");
        if (anchorElements.length <= 0) {
            return null;
        }
        const anchorElement = anchorElements[0];
        if (!anchorElement || !anchorElement.getAttribute("href")) {
            return null;
        }

        const baseUrl = window.location.origin;
        return baseUrl + anchorElement.getAttribute("href");
    }

    getImageElement(div) {
        return div ? div.querySelector('[id*="productImage"]') : null;
    }

    getRawImageLink(div) {
        const imageElement = this.getImageElement(div);
        return imageElement ? imageElement.src : null;
    }
}

// Fetch HTML content with rate-limiting and error handling
async function fetchHtmlWithRateLimit(url, delayMs = 1000, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await delay(delayMs); // Delay before making the request
            return await fetchHtml(url); // Fetch the HTML
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                throw new Error(`Failed to fetch after ${retries} attempts`);
            }
            delayMs *= 2; // Exponential backoff
        }
    }
}

// Delay function implementation
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "text/html,application/json");
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Failed to fetch: ${xhr.status} ${xhr.statusText}`));
            }
        };
        xhr.onerror = function () {
            reject(new Error("Network error occurred while fetching the HTML."));
        };
        xhr.send();
    });
}

async function walmartExtractIngredients(url, delayMs = 1000) {
    try {
        const response = await fetchHtml(url);
        if (!response) {
            return 'Failed to fetch the HTML content.';
        }

        const parser = new DOMParser();
        const document = parser.parseFromString(response, 'text/html');
        const scriptTag = document.querySelector("script#__NEXT_DATA__");
        if (!scriptTag) {
            console.error("Script tag with id='__NEXT_DATA__' not found. Response:", response);
            return 'Script tag not found';
        }

        const scriptContent = scriptTag.textContent;
        const data = JSON.parse(scriptContent);
        const ingredients = data?.props?.pageProps?.initialData?.data?.idml?.ingredients?.ingredients?.value;

        const titleElement = document.querySelector('#main-title');
        const productTitle = titleElement ? titleElement.textContent.trim() : 'No title found';

        return ingredients?.toLowerCase().trim() === 'none' ? productTitle : ingredients;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}
