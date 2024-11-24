const inputBox = document.getElementById('dietary-restrictions');
const saveButton = document.getElementById('save-button');
const toggleSwitch = document.getElementById('toggle-switch');
const toggleLabels = document.querySelectorAll('.toggle-container .toggle-label');

// Load saved data when the extension popup is opened
document.addEventListener('DOMContentLoaded', function () {
    // Load the saved dietary restrictions and toggle state
    chrome.storage.local.get(['dietaryRestrictions', 'toggleState', 'ingredientsToAvoid'], function (result) {
        if (result.dietaryRestrictions && result.toggleState) {
            inputBox.value = result.dietaryRestrictions; // Set input box value
        }
        if (typeof result.toggleState === 'boolean') {
            toggleSwitch.checked = result.toggleState; // Set toggle state
            updateToggleLabelColors(result.toggleState);
        }

        // If ingredientsToAvoid is saved and toggle is on, use it
        if (result.toggleState && result.ingredientsToAvoid) {
            // Do something with the ingredientsToAvoid (e.g., display them or process further)
            console.log("Ingredients to avoid:", result.ingredientsToAvoid);
        }
    });

    // Ensure that the toggle label colors are updated after DOM is ready
    updateToggleLabelColors(toggleSwitch.checked);
});

// Event listener for the Save button
saveButton.addEventListener('click', function () {
    // Get the value from the input box
    const userInput = inputBox.value.trim();

    // Only save the dietary restrictions if the toggle is "On"
    if (toggleSwitch.checked) {
        chrome.storage.local.set({ dietaryRestrictions: userInput }, function () {
            console.log('Dietary restrictions saved:', userInput); // Print the input to the console
        });

        // HARD CODED REPLACE WITH CHATGPT API MECHANISM Optionally, save ingredientsToAvoid here, if you have this string from the API
        const ingredientsToAvoid = "peanut, dairy"; // Example, replace with actual logic to fetch this from your API

        chrome.storage.local.set({ ingredientsToAvoid: ingredientsToAvoid }, function () {
            console.log('Ingredients to avoid saved:', ingredientsToAvoid); // Print to the console
        });
    } else {
        console.log('Toggle is OFF. No data saved.');
    }

    // Update the button text and style
    saveButton.textContent = 'Saved';
    saveButton.classList.add('saved');
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
        console.log('Toggle state saved:', isChecked); // Print the toggle state to the console
    });

    // Update label colors
    updateToggleLabelColors(isChecked);
});
