let ingredientsToAvoid;
let compatibleWebsite;

const apiUrl = 'https://api.openai.com/v1/chat/completions';
let apiKey;

fetch('api.txt')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch the API key');
    }
    return response.text();
  })
  .then(data => {
    apiKey = data.trim(); // Trim to remove any extra spaces or newline characters
    console.log('API Key loaded:', apiKey);
  })
  .catch(error => {
    console.error('Error:', error);
  });



chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const walmartRegex = /^https?:\/\/(www\.)?walmart\.(com|ca)(\/.*)?$/;

    const currentTab = tabs[0];
    const currentURL = currentTab.url;

    console.log('Current Tab URL:', currentURL); 

    if (walmartRegex.test(currentURL)) {
        compatibleWebsite = true;
    } else{
        compatibleWebsite = false;
    }
});


function constructPrompt(userInput) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. Your mission is to help individuals maintain a healthy diet by identifying foods they should avoid based on their dietary goals and specific allergies or restrictions.
MAKE SURE TO LOOK AT BOTH THE DIET TO FOLLOW AND THE INGREDIENTS TO AVOID.
**User Statement:**
"${userInput}"

**Task:**
Based on the above statement, identify all relevant foods or ingredients that should be avoided to achieve the user's dietary goal while considering their specific allergies or restrictions. Provide the list in the following format:

**Response Format Only:**

Foods_to_avoid = [
    "Item1",
    "Item2",
    "Item3",
    ...
]

**Instructions:**
- **Exhaustive List:** Ensure the list is comprehensive and includes all relevant items. This is a matter of life and death.
- **Specificity:** Mention ingredients that are found on product labels.
- **Variations and Similar Names:** Account for variations or similar names (e.g., "keto and low-carb").
- **Hidden Sources:** Consider hidden sources of carbohydrates or other restricted nutrients.
- **Formatting:** Strictly adhere to the specified format for ease of parsing.
- **Safety and Thoroughness:** Prioritize the user's health by being meticulous and thorough.
- **No Explanations:** Do not provide additional explanations or context beyond the list.
- **No examples:** Do not provide any additional examples. for this: Grains and grain products (wheat
rice
oats
pasta
bread
etc.) we would only want you to reply with:
Foods_to_avoid = [
    "grains",
    "wheat",
    "rice",
    "oats",
    "pasta",
    "bread"
    ...
]

take note that there is no etc. and no extra words that aren't ingredients.
`;
}

async function getChatCompletion(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
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

// only called if the user clicks save
async function handleSaveButtonClick(userInput) {
    // getting the user's input

    if (!userInput) {
        alert('Please enter your dietary goals and restrictions.');
        return;
    }

    console.log('🔄 Received user input:', userInput);

    // creating the prompt
    const prompt = constructPrompt(userInput);

    // sending to openai
    console.log("🔄 Sending prompt to OpenAI...");
    const ingredientsToAvoid = await getChatCompletion(prompt);

    if (!ingredientsToAvoid) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    const resultsDiv = document.getElementById('results');
    const rawResponse = document.createElement('p');
    rawResponse.textContent = ingredientsToAvoid;
    resultsDiv.appendChild(rawResponse);

    console.log('✅ Results displayed on the page.');

    return ingredientsToAvoid
}

// if user is on walmart (add check) FINAL COMP:

const groceryIngredients = "peanuts, water, salt, oil"

function constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients) {
    const foodsList = ingredientsToAvoid

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

async function checkGrocery(userInput, ingredientsToAvoid, groceryIngredients) {
    const verificationPrompt = constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients);

    // Await the second API call
    const returnedJSON = await getChatCompletion(verificationPrompt);

    if (!returnedJSON) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    // Append the correct response to the DOM
    const resultsDiv = document.getElementById('secondResults');
    resultsDiv.innerHTML = ''; // Clear previous results
    const rawResponse = document.createElement('p');
    rawResponse.textContent = returnedJSON; // Use the returned JSON
    resultsDiv.appendChild(rawResponse);

    console.log('✅ Second Prompt Results displayed on the page.');

    return returnedJSON;
}

// Updated Event Listener
document.getElementById('save-button').addEventListener('click', async () => {
    userInput = document.getElementById('input-box').value.trim();
    ingredientsToAvoid = await handleSaveButtonClick(userInput);

    if (ingredientsToAvoid && compatibleWebsite) {
        console.log('🔄 Ingredients to Avoid:', ingredientsToAvoid);

        // call checkGrocery after the first prompt's result is ready
        const groceryCheckResult = await checkGrocery(userInput, ingredientsToAvoid, groceryIngredients);
        console.log('Grocery Check Result:', groceryCheckResult);
    }
});