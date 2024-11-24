/**
 * Retrieves the stored data (user input and foods to avoid) from Chrome's storage.
 * @returns {Promise<{userInput: string, foodsToAvoid: string[]}>} - The stored data.
 */

async function loadApiKey() {
    try {
        const response = await fetch(chrome.runtime.getURL('api/api.txt'));
        if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.statusText}`);
        }
        const apiKey = await response.text();
        console.log('🔑 API Key:', apiKey);
        return apiKey.trim(); // Ensure any trailing whitespace is removed
    } catch (error) {
        console.error('❌ Error loading API key:', error.message);
        return null;
    }
}

const groceryIngredients = "peanuts, water, salt, oil"
function getStoredData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['userInput', 'foodsToAvoid'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Saves the final output data to Chrome's storage.
 * @param {object} finalData - The data to save.
 * @returns {Promise<void>}
 */
function saveFinalData(finalData) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ finalData }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Constructs a verification prompt incorporating both the original prompt and the generated list.
 * @param {string} userInput - The original user input.
 * @param {string[]} foodsToAvoid - The list of foods to avoid.
 * @param {string} groceryIngredients - The grocery item's ingredients.
 * @returns {string} - The constructed prompt for OpenAI.
 */
function constructVerificationPrompt(userInput, foodsToAvoid, groceryIngredients) {
    const foodsList = foodsToAvoid.map(item => `    "${item}"`).join(',\n');

    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. You have previously provided a list of foods to avoid based on the user's dietary goal and specific allergies or restrictions.

**User Statement:**
"${userInput}"

**Previously Generated Foods to Avoid:**
Foods_to_avoid = [
${foodsList}
]

**Grocery Item Ingredients:**
"${groceryIngredients}"

**Task:**
1. **Determine Fitness:** Based on the provided grocery item's ingredients, determine if it is fit for the user to consume considering both their dietary goals and specific allergies or restrictions.
    - If the grocery item is **UNFIT**, set "Unfit" to **true**.
    - If it is **FIT**, set "Unfit" to **false**.
2. **Identify Reasons:** If the item is unfit, list the specific ingredients that make it unfit along with the corresponding restriction (e.g., Allergy, Keto Diet). Do not include explanations—only the ingredients themselves with their restrictions, separated by commas.

**Response Format:**
Provide the response exactly in the following JSON format without any additional text or code blocks:

{
    "Unfit": true/false,
    "Reason": "Ingredient1 (Restriction), Ingredient2 (Restriction), ..."
}

**Instructions:**
- **Exhaustive and Accurate:** Ensure the assessment is comprehensive and includes all relevant factors.
- **Specificity:** Mention exact ingredients causing the issue.
- **Safety and Thoroughness:** Prioritize the user's health by being meticulous.
- **No Explanations:** Provide only the required information in the specified format.
`;
}

/**
 * Main function to handle the grocery item check process.
 */
async function handleGroceryCheck() {
    try {
        // Step 1: Retrieve stored data from Chrome storage
        const { userInput, foodsToAvoid } = await getStoredData();

        if (!userInput || !foodsToAvoid) {
            console.error("❌ Stored data is incomplete.");
            return;
        }

        // Step 2: Prompt the user to input the grocery item's ingredients
        const groceryIngredients = prompt('📝 Enter the grocery item ingredients (e.g., peanut butter, canola oil, sugar, water):');
        if (!groceryIngredients) {
            alert('No ingredients entered. Exiting.');
            return;
        }

        // Step 3: Construct the verification prompt
        const verificationPrompt = constructVerificationPrompt(userInput, foodsToAvoid, groceryIngredients);

        // Step 4: Send the prompt to OpenAI API
        console.log("🔄 Sending verification prompt to OpenAI...");
        const openAIResponse = await getChatCompletion(verificationPrompt);

        if (!openAIResponse) {
            console.error("❌ Failed to retrieve a response from OpenAI.");
            return;
        }

        console.log('📄 Raw AI Response:', openAIResponse);

        // Step 5: Parse the AI's response
        const response = parseAIResponse(openAIResponse);

        if (!response) {
            console.error("❌ Failed to parse the AI response.");
            return;
        }

        // Step 6: Save the final output to Chrome's storage
        const finalOutput = {
            userInput,
            foodsToAvoid,
            groceryIngredients,
            response
        };

        await saveFinalData(finalOutput);

        // Step 7: Display the results
        console.log('✅ Final Output Saved:', finalOutput);
        alert(`Final Output: ${JSON.stringify(finalOutput.response, null, 2)}`);
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
    }
}

// Trigger the grocery check process
handleGroceryCheck();
