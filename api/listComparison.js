import { getChatCompletion } from './api-call.js'; // Ensure the relative path is correct
import readline from 'readline';

/**
 * Prompts the user to input a list of items they cannot consume.
 * @returns {Promise<string>} - The raw user input as a single string.
 */

function getUserList() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter the list of items you cannot consume separated by commas: ', (answer) => { /**HERE WE HAVE A QUESTION */
            rl.close();
            const userInput = answer.trim();
            if (userInput.length === 0) {
                console.log('No items entered. Exiting the program.');
                process.exit(0);
            }
            console.log('Received list from user:', userInput);
            resolve(userInput);
        });
    });
}

/**
 * Constructs a detailed prompt incorporating the user's input.
 * @param {string} userInput - The raw list of items the user cannot consume.
 * @returns {string} - The constructed prompt for OpenAI.
 */
function constructPrompt(userInput) {
    return `Hello ChatGPT, you are a licensed nutritionist and the best in your field. 
    You want to ensure that your patients do not consume foods they are allergic to, and you want to help your patients lose weight. 
    Based on the following list of items the user cannot consume, identify each item and return a comprehensive 
    list of additional foods to avoid in the following format:
Foods_to_avoid = [
    "Item1",
    "Item2",
    "Item3",
    ...
]

Ensure that each item you give is an item that can be found when analyzing the ingredients tag of an item in the grocery store, for example
In the case of Lays Chips we have: Specially Selected Potatoes, Vegetable Oil, Salt
For chips ahoy: Wheat flour, Semi-sweet chocolate chips (sugar, unsweetened chocolate, cocoa butter, dextrose, milk ingredients, soy lecithin), Sugars (sugar and/or golden sugar, glucose-fructose), Shortening (vegetable oil, modified palm oil), Salt, Baking soda, Ammonium phosphate, Ammonium bicarbonate, Artificial flavour, Caramel colour. Contains: Wheat, Milk, Soy.

Ensure the list is exhaustive, accurate, redundant, and consistent, prioritizing safety and thoroughness. 
Avoid general answers like Certain Snack Foods (e.g.nut-based snacks or those with nut flavorings) or Certain Candies (e.g.those with nuts or nut flavors)
Account for any items with similar names such as kiwi and Chinese gooseberry. 
This is a matter of life and death!

User input:
${userInput}
`;
}

/**
 * Parses the AI's response to extract the list of foods to avoid.
 * @param {string} text - The raw text response from OpenAI.
 * @returns {string[]} - An array of foods to avoid.
 */
function parseAIResponse(text) {
    // Use a regular expression to extract the list within the square brackets
    const regex = /Foods_to_avoid\s*=\s*\[(.*?)\]/s;
    const match = text.match(regex);
    if (match && match[1]) {
        // Split the items by comma and remove any surrounding quotes and whitespace
        return match[1]
            .split(',')
            .map(item => item.trim().replace(/^["']|["']$/g, ''))
            .filter(item => item.length > 0);
    } else {
        console.error("Failed to parse AI response. Please ensure the response is in the correct format.");
        return [];
    }
}

// Main asynchronous function to orchestrate the steps
(async () => {
    try {
        // Step 1: Prompt the user to enter their list
        const userInput = await getUserList();

        // Step 2: Construct the prompt incorporating the user's input
        const prompt = constructPrompt(userInput);

        
        // console.log('\nConstructed Prompt:\n', prompt);

        
        console.log("Sending prompt to OpenAI...");
        const openAIResponse = await getChatCompletion(prompt);

        if (!openAIResponse) {
            console.error("Failed to retrieve list from OpenAI.");
            process.exit(1);
        }

        console.log('Received response from OpenAI.');
        // console.log('Raw AI Response:', openAIResponse);

        // Step 4: Parse the AI's response to extract the list of foods to avoid
        const foodsToAvoid = parseAIResponse(openAIResponse);

        if (foodsToAvoid.length === 0) {
            console.log('No foods to avoid were identified.');
            process.exit(1);
        }

        //AI RESPOINSE STORED IN foodsToAvoid

        // Step 6: Output the results
        console.log('\nYour Dietary Recommendations:');
        console.log('----------------------------------');

        console.log('\nYou cannot eat:');
        foodsToAvoid.forEach(item => console.log(`- ${item}`));

    } catch (error) {
        console.error('An unexpected error occurred:', error.message);
    }
})();
