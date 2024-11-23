// final-comp.js

import { getChatCompletion } from './api-call.js'; // Ensure the relative path is correct
import readline from 'readline';
import fs from 'fs';

/**
 * Reads the generated list from generatedList.json.
 * @returns {object} - An object containing userInput and foodsToAvoid array.
 */
function readGeneratedList() {
    try {
        const data = fs.readFileSync('generatedList.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Failed to read generatedList.json:", error.message);
        process.exit(1);
    }
}

/**
 * Prompts the user to input the grocery item's ingredients.
 * @returns {Promise<string>} - The grocery item's ingredients as a single string.
 */
function getGroceryIngredients() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('📝 Enter the grocery item ingredients (you can enter them as a long string without commas): ', (answer) => {
            rl.close();
            const ingredients = answer.trim();
            if (ingredients.length === 0) {
                console.log('❌ No ingredients provided. Exiting the program.');
                process.exit(0);
            }
            console.log('🔄 Received grocery ingredients:', ingredients);
            resolve(ingredients);
        });
    });
}

/**
 * Constructs a verification prompt incorporating both the original prompt and the generated list.
 * @param {string} userInput - The original user input.
 * @param {string[]} foodsToAvoid - The initially generated list of foods to avoid.
 * @param {string} groceryIngredients - The grocery item's ingredients.
 * @returns {string} - The constructed prompt for OpenAI.
 */
function constructVerificationPrompt(userInput, foodsToAvoid, groceryIngredients) {
    // Convert the list back to a formatted string with proper indentation
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
 * Parses the AI's response to extract the response object.
 * @param {string} text - The raw text response from OpenAI.
 * @returns {object|null} - An object containing Unfit and Reason array or null if parsing fails.
 */
function parseAIResponse(text) {
    // Remove code block formatting if present
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();

    // Now, attempt to parse the cleaned text as JSON
    try {
        // Remove any prefix before JSON
        let jsonString = cleanedText.replace(/^Response\s*=\s*/, '').trim();

        // Normalize boolean values to lowercase to comply with JSON standards
        jsonString = jsonString.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');

        // Parse the JSON string
        const parsed = JSON.parse(jsonString);

        // Ensure the keys exist and have correct types
        if (typeof parsed.Unfit !== 'boolean' || typeof parsed.Reason !== 'string') {
            throw new Error('Invalid data types in response.');
        }

        // Split reasons by comma and trim whitespace
        const reasons = parsed.Reason.split(',').map(reason => reason.trim());

        return {
            Unfit: parsed.Unfit,
            Reason: reasons
        };
    } catch (error) {
        console.error("❌ Failed to parse AI response as JSON. Please ensure the response is in the correct format.");
        console.log('📄 Raw AI Response:', text); // Log the raw response for debugging
        return null;
    }
}

// Main asynchronous function to orchestrate the steps
(async () => {
    try {
        // Step 1: Read the generated list from generatedList.json
        const { userInput, foodsToAvoid } = readGeneratedList();
        console.log('🔄 Read generatedList.json successfully.');

        // Step 2: Prompt the user to enter the grocery item's ingredients
        const groceryIngredients = await getGroceryIngredients();

        // Step 3: Construct the verification prompt
        const verificationPrompt = constructVerificationPrompt(userInput, foodsToAvoid, groceryIngredients);

        // Optional: Log the constructed prompt for debugging
        // console.log('\n📄 Constructed Verification Prompt:\n', verificationPrompt);

        // Step 4: Send the verification prompt to OpenAI
        console.log("🔄 Sending verification prompt to OpenAI...");
        const openAIResponse = await getChatCompletion(verificationPrompt);

        if (!openAIResponse) {
            console.error("❌ Failed to retrieve verification response from OpenAI.");
            process.exit(1);
        }

        console.log('🔄 Received verification response from OpenAI.');

        // Log the raw AI response for debugging
        console.log('📄 Raw AI Response:', openAIResponse);

        // Step 5: Parse the AI's response to extract the response object
        const response = parseAIResponse(openAIResponse);

        if (!response) {
            console.log('❌ No valid response was identified.');
            process.exit(1);
        }

        // Step 6: Construct the final output object (response only)
        const FINALOUTPUT = {
            "response": response
        };

        // Output the FINALOUTPUT variable
        console.log('✅ Final Output has been constructed.');

        // Step 7: Save the other data to final-list.json
        const otherData = {
            userInput: userInput,
            foodsToAvoid: foodsToAvoid,
            groceryIngredients: groceryIngredients
        };

        fs.writeFileSync('final-list.json', JSON.stringify(otherData, null, 2));
        console.log('✅ Other data has been saved to final-list.json');

        // Optional: Log the FINALOUTPUT
        console.log('\n📝 Final Output (Response Only):');
        console.log(JSON.stringify(FINALOUTPUT, null, 2));

        // Now, you can use FINALOUTPUT as needed
        // For example, export it if you're using modules
        // module.exports = FINALOUTPUT;

    } catch (error) {
        console.error('❌ An unexpected error occurred:', error.message);
    }
})();
