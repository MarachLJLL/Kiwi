// script.js

/**
 * Constructs a detailed prompt incorporating the user's input.
 * @param {string} userInput - The raw user input containing both dietary goal and items to avoid.
 * @returns {string} - The constructed prompt for OpenAI.
 */
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

function parseAIResponse(text) {
    const regex = /Foods_to_avoid\s*=\s*\[\s*([\s\S]*?)\s*\]/;
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1]
            .split(',')
            .map(item => item.trim().replace(/^["']|["']$/g, ''))
            .filter(item => item.length > 0);
    } else {
        console.error("❌ Failed to parse AI response. Please ensure the response is in the correct format.");
        return [];
    }
}

/**
 * Sends a prompt to the OpenAI API and retrieves the response.
 * @param {string} prompt - The prompt to send to OpenAI.
 * @returns {Promise<string>} - The raw response from OpenAI.
 */
async function getChatCompletion(prompt) {
    const apiKey = 'chrome_extension/api/api.txt'; // Replace with your OpenAI API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

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

// Main function to handle the input and trigger the API call
async function handleSaveButtonClick() {
    const userInput = document.getElementById('input-box').value.trim();

    if (!userInput) {
        alert('Please enter your dietary goals and restrictions.');
        return;
    }

    console.log('🔄 Received user input:', userInput);

    // Step 1: Construct the prompt
    const prompt = constructPrompt(userInput);

    // Step 2: Send the prompt to OpenAI
    console.log("🔄 Sending prompt to OpenAI...");
    const openAIResponse = await getChatCompletion(prompt);

    if (!openAIResponse) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    console.log('📄 Raw AI Response:', openAIResponse);

    // Step 3: Parse the AI's response
    const foodsToAvoid = parseAIResponse(openAIResponse);

    // Step 4: Display the results on the page
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>You should avoid:</h2>';
    const ul = document.createElement('ul');
    foodsToAvoid.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);

    console.log('✅ Results displayed on the page.');
}

// Attach event listener to the "Save" button
document.getElementById('save-button').addEventListener('click', handleSaveButtonClick);
