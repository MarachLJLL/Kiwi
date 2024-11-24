// script.js

// DOM Elements
const inputBox = document.getElementById('dietary-restrictions');
const saveButton = document.getElementById('save-button');
const toggleSwitch = document.getElementById('toggle-switch');
const toggleLabels = document.querySelectorAll('.toggle-container .toggle-label');
const logoImages = document.querySelectorAll('.logo');
const staticLogo = 'https://media.discordapp.net/attachments/1302360576281808900/1310016172518932490/Untitled_Artwork_14.png?ex=6743af22&is=67425da2&hm=a7d423b6d7ad65f6049d2fbf9e8d71529ab7875569fea0ecad634f295f896637&=&format=webp&quality=lossless&width=936&height=936';
const gifLogo = 'https://media.discordapp.net/attachments/1302360576281808900/1309987897520291932/Loading.gif?ex=674394cd&is=6742434d&hm=4aa860d3451f308611e75aaf7ad026cc34afa6b163006796b8e81b58f0511d5c&=&width=1248&height=936'; // Replace with the actual GIF URL

// Load saved data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['dietaryRestrictions', 'toggleState', 'ingredientsToAvoid'], function (result) {
        if (result.dietaryRestrictions) {
            inputBox.value = result.dietaryRestrictions; // Set input box value
        }
        if (typeof result.toggleState === 'boolean') {
            toggleSwitch.checked = result.toggleState; // Set toggle state
            updateToggleLabelColors(result.toggleState);

            // Set all logo images based on the saved toggle state
            logoImages.forEach((logo) => {
                logo.src = result.toggleState ? gifLogo : staticLogo;
            });
        }
    });
    updateToggleLabelColors(toggleSwitch.checked); // Ensure label colors are updated
});

// Event listener for the Save button
saveButton.addEventListener('click', async function () {
    // Get the value from the input box
    const userInput = inputBox.value.trim();

    if (userInput) {
        saveButton.textContent = 'Saved';
        saveButton.classList.add('saved');
    }

    // Save dietary restrictions
    chrome.storage.local.set({ dietaryRestrictions: userInput }, function () {
        if (chrome.runtime.lastError) {
            console.error("Error saving dietaryRestrictions:", chrome.runtime.lastError.message);
        } else {
            console.log('Dietary restrictions saved:', userInput);
        }
    });

    // Generate ingredients to avoid using OpenAI API
    const ingredientsToAvoid = await handleSaveButtonClick(userInput);

    // Save ingredients to avoid
    chrome.storage.local.set({ ingredientsToAvoid: ingredientsToAvoid }, function () {
        console.log('Ingredients to avoid saved:', ingredientsToAvoid);
    });
});

// Event listener for input box changes
inputBox.addEventListener('input', function () {
    // Reset the Save button if the input changes
    saveButton.textContent = 'Save';
    saveButton.classList.remove('saved');
});

// Update toggle label colors
function updateToggleLabelColors(isChecked) {
    if (toggleLabels.length !== 2) {
        console.error("Expected 2 toggle labels, but found:", toggleLabels.length);
        return; // Exit if labels are not found
    }

    // Set label colors only if there are two labels
    toggleLabels[0].style.color = isChecked ? '#ccc' : '#36440f'; // "Off" label
    toggleLabels[1].style.color = isChecked ? '#36440f' : '#ccc'; // "On" label
}

// Event listener for the toggle switch
toggleSwitch.addEventListener('change', function () {
    const isChecked = this.checked;

    // Save the toggle state to chrome.storage.local
    chrome.storage.local.set({ toggleState: isChecked }, function () {
        console.log('Toggle state saved:', isChecked); // Log toggle state
    });

    // Update all logo images based on the toggle state
    logoImages.forEach((logo) => {
        logo.src = isChecked ? gifLogo : staticLogo;
    });

    // Update label colors
    updateToggleLabelColors(isChecked);

    // Send a message to content scripts to notify about the toggle state change
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleStateChanged', toggleState: isChecked });
        });
    });
});

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

// Function to construct the prompt
function constructPrompt(userInput) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. Your mission is to help individuals maintain a healthy diet by identifying foods they should avoid based on their dietary goals and specific allergies or restrictions.
MAKE SURE TO LOOK AT BOTH THE DIET TO FOLLOW AND THE INGREDIENTS TO AVOID. If only a diet is provided then just provide ingredients to avoid following that diet. If only the allergen/foods were sent, then just provide ingredients to avoid if you are avoiding that food. If both are provided, then provide comprehensive lists separately, don't try to find overlap, just find all possible ingredients to avoid.
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
- **No examples:** Do not provide any additional examples. For this: Grains and grain products (wheat, rice, oats, pasta, bread, etc.) we would only want you to reply with:
Foods_to_avoid = [
    "grains",
    "wheat",
    "rice",
    "oats",
    "pasta",
    "bread",
    ...
]

Take note that there is no etc. and no extra words that aren't ingredients.
`;
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

// Handle save button click
async function handleSaveButtonClick(userInput) {
    if (!userInput) {
        alert('Please enter your dietary goals and restrictions.');
        return;
    }

    console.log('🔄 Received user input:', userInput);

    // Create the prompt
    const prompt = constructPrompt(userInput);

    // Send to OpenAI
    console.log("🔄 Sending prompt to OpenAI...");
    const ingredientsToAvoid = await getChatCompletion(prompt);

    if (!ingredientsToAvoid) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    return ingredientsToAvoid;
}
