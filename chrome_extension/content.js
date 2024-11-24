// Fetch and apply allergen restrictions from JSON
/*fetch(chrome.runtime.getURL('data/allergens.json'))
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const allergens = data.defaultAllergens;

    console.log('Allergens loaded:', allergens);

    // Example: Hide elements containing allergen keywords
    document.querySelectorAll('div, span, p').forEach((element) => {
      if (allergens.some((word) => element.textContent.toLowerCase().includes(word.toLowerCase()))) {
        element.style.display = 'none'; // Hide the element
      }
    });
  })
  .catch((error) => {
    console.error('Error loading JSON:', error);
  });
*/