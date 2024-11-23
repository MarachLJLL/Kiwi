function getCompleteUrl(anchorElement) {
    // Ensure the anchor element exists
    if (!anchorElement || !anchorElement.getAttribute("href")) {
        console.error("Invalid anchor element.");
        return null;
    }

    // Concatenate the base URL with the href
    const baseUrl = window.location.origin; // Gets the base URL of the current page
    const completeUrl = baseUrl + anchorElement.getAttribute("href");

    return completeUrl;
}

function getHyperLinks() {
    let productLinks = []
    const children = document.querySelectorAll("#\\30 > section > div > div");

    // Iterate through the NodeList to perform actions on each child
    children.forEach(child => {
        console.log(getCompleteUrl(child.getElementsByTagName("a")[0])); // Logs each child element
    });
}