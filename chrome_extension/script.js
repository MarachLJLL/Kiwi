const inputBox = document.getElementById('dietary-restrictions');
const saveButton = document.getElementById('save-button');
const toggleSwitch = document.getElementById('toggle-switch');
const toggleLabels = document.querySelectorAll('.toggle-container .toggle-label');

const logoImages = document.querySelectorAll('.logo');
const staticLogo = 'https://media.discordapp.net/attachments/1302360576281808900/1310016172518932490/Untitled_Artwork_14.png?ex=6743af22&is=67425da2&hm=a7d423b6d7ad65f6049d2fbf9e8d71529ab7875569fea0ecad634f295f896637&=&format=webp&quality=lossless&width=936&height=936';
const gifLogo = 'https://media.discordapp.net/attachments/1302360576281808900/1309987897520291932/Loading.gif?ex=674394cd&is=6742434d&hm=4aa860d3451f308611e75aaf7ad026cc34afa6b163006796b8e81b58f0511d5c&=&width=1248&height=936'; // Replace with the actual GIF URL


// LOAD SAVED DATA
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['dietaryRestrictions', 'toggleState', 'ingredientsToAvoid'], function (result) {
        if (result.dietaryRestrictions && result.toggleState) {
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

        if (result.toggleState && result.ingredientsToAvoid) {
            console.log("Ingredients to avoid:", result.ingredientsToAvoid);
        }
    });

    updateToggleLabelColors(toggleSwitch.checked); // Ensure label colors are updated
});


// Event listener for the Save button
saveButton.addEventListener('click', function () {
    // Get the value from the input box
    const userInput = inputBox.value.trim();
    // Update the button text and style

    if (userInput){
        saveButton.textContent = 'Saved';
        saveButton.classList.add('saved');
    }

    chrome.storage.local.set({ dietaryRestrictions: userInput }, function () {
        if (chrome.runtime.lastError) {
            console.error("Error saving dietaryRestrictions:", chrome.runtime.lastError.message);
        } else {
            console.log('Dietary restrictions saved:', userInput);
        }
    });
    
    const ingredientsToAvoid = handleSaveButtonClick(userInput)

    chrome.storage.local.set({ ingredientsToAvoid: ingredientsToAvoid }, function () {
        console.log('Ingredients to avoid saved:', ingredientsToAvoid); // Print to the console
    })
});

// Event listener for input box changes
inputBox.addEventListener('input', function () {
    // Reset the Save button if the input changes
    saveButton.textContent = 'Save';
    saveButton.classList.remove('saved');
});

function updateToggleLabelColors(isChecked) {
    if (toggleLabels.length !== 2) {
        console.error("Expected 2 toggle labels, but found:", toggleLabels.length);
        return; // Exit if labels are not found
    }

    // Set label colors only if there are two labels
    toggleLabels[0].style.color = isChecked ? '#ccc' : '#36440f'; // "On" label
    toggleLabels[1].style.color = isChecked ? '#36440f' : '#ccc'; // "Off" label
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
});


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


function constructPrompt(userInput) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. Your mission is to help individuals maintain a healthy diet by identifying foods they should avoid based on their dietary goals and specific allergies or restrictions.
MAKE SURE TO LOOK AT BOTH THE DIET TO FOLLOW AND THE INGREDIENTS TO AVOID. If only a diet is provided then just provide ingredients to avoid following that diet. If only the allergan/foods were sent, then just provide ingredients to avoid if you are avoiding that food. If both are provided, then provide comprehensive lists seperately, don't try to find overlap, just find all possible ingredients to avoid.
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
    return ingredientsToAvoid
}


function constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients) {
    const foodsList = ingredientsToAvoid

    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. You have previously provided a list of foods to avoid based on the user's dietary goal and specific allergies or restrictions.

User Statement:
"${userInput}"

Previously Generated Foods to Avoid:
Foods_to_avoid = [
${foodsList}
]

Grocery Item Ingredients:
"${groceryIngredients}"

Task:
Determine Fitness: Based on the provided grocery item's ingredients, determine if it is fit for the user to consume considering both their dietary goals and specific allergies or restrictions.
If the grocery item is UNFIT, set "Unfit" to true.
If it is FIT, set "Unfit" to false.
Identify Reasons: If the item is unfit, list the specific ingredients that make it unfit along with the corresponding restriction (e.g., Allergy, Keto Diet). Do not include explanations—only the ingredients themselves with their restrictions, separated by commas.

Response Format:
Provide the response exactly in the following JSON format without any additional text or code blocks:

{
    "Unfit": true/false,
    "Reason": "Ingredient1 (Restriction), Ingredient2 (Restriction), ..."
}

Instructions:
Exhaustive and Accurate: Ensure the assessment is comprehensive and includes all relevant factors.
Specificity: Mention exact ingredients causing the issue.
Safety and Thoroughness: Prioritize the user's health by being meticulous.
No Explanations: Provide only the required information in the specified format.
`;
}

async function checkGroceryOk(userInput, ingredientsToAvoid, groceryIngredients) {
    const verificationPrompt = constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients);

    // Await the second API call
    const returnedJSON = await getChatCompletion(verificationPrompt);

    if (!returnedJSON) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    return returnedJSON;
}


// Construct the prompt for verification
function constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. You have previously provided a list of foods to avoid based on the user's dietary goal and specific allergies or restrictions.

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
Provide the response exactly in the following JSON format without any additional text or code blocks:

{
    "Unfit": true/false,
    "Reason": "Ingredient1 (Restriction), Ingredient2 (Restriction), ..."
}

Instructions:
Exhaustive and Accurate: Ensure the assessment is comprehensive and includes all relevant factors.
Specificity: Mention exact ingredients causing the issue.
Safety and Thoroughness: Prioritize the user's health by being meticulous.`;
}

// Check if a grocery item is fit
async function checkGroceryOk(userInput, ingredientsToAvoid, groceryIngredients) {
    const verificationPrompt = constructVerificationPrompt(userInput, ingredientsToAvoid, groceryIngredients);

    // Await the API call
    const returnedJSON = await getChatCompletion(verificationPrompt);

    if (!returnedJSON) {
        alert('Failed to retrieve a response from OpenAI. Please try again later.');
        return;
    }

    return returnedJSON;
}

// Load saved data from Chrome storage
function loadSavedData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['dietaryRestrictions', 'toggleState', 'ingredientsToAvoid'], function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error("Error retrieving saved variables: " + chrome.runtime.lastError.message));
                return;
            }

            resolve({
                dietaryRestrictions: result.dietaryRestrictions || '',
                toggleState: result.toggleState !== undefined ? result.toggleState : false,
                ingredientsToAvoid: result.ingredientsToAvoid || '',
            });
        });
    });
}

// Save data to Chrome storage
function saveDataToChromeStorage(data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, function () {
            if (chrome.runtime.lastError) {
                reject(new Error("Error saving data to Chrome storage: " + chrome.runtime.lastError.message));
                return;
            }
            resolve();
        });
    });
}

// Main workflow for loading and saving data
async function mainWorkflow(userInput, groceryIngredients) {
    try {
        // Load the API key
        await loadApiKey();
        console.log("AAAAAAAAAAA");
        // Load saved data
        const { dietaryRestrictions, toggleState, ingredientsToAvoid } = await loadSavedData();
        console.log('Loaded data:', { dietaryRestrictions, toggleState, ingredientsToAvoid });

        // Save the user input if provided
        if (userInput) {
            await saveDataToChromeStorage({ dietaryRestrictions: userInput });
            console.log('Dietary restrictions saved:', userInput);

            // Generate ingredients to avoid
            const generatedIngredients = await getChatCompletion(constructVerificationPrompt(userInput, '', ''));
            if (generatedIngredients) {
                await saveDataToChromeStorage({ ingredientsToAvoid: generatedIngredients });
                console.log('Ingredients to avoid saved:', generatedIngredients);
            }
        }

        // Perform grocery check if ingredients and input are available
        if (dietaryRestrictions && ingredientsToAvoid && groceryIngredients) {
            const result = await checkGroceryOk(dietaryRestrictions, ingredientsToAvoid, groceryIngredients);
            console.log('Grocery check result:', result);
        }
    } catch (error) {
        console.error('❌ Error in main workflow:', error.message);
    }
}
