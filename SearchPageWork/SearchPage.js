import { Product } from "./Product";

function getProducts() {
    const productDivs = document.querySelectorAll("#\\30 > section > div > div");
    productDivs.forEach(div => {
        try {
            let link = getCompleteUrl(div.getElementsByTagName("a")[0]);
            let imageHTMLElement = "";
        } catch (error) {
            
        }
        
    });
    return productDivs;
}

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

function getProductLinks() {
    let productLinks = []
    const children = getProductDivs();

    // Iterate through the NodeList to perform actions on each child
    try {
        productLinks.push(getCompleteUrl(child.getElementsByTagName("a")[0])); // Logs each child element
    } catch (error) {
        
    }    
    return productLinks    
}