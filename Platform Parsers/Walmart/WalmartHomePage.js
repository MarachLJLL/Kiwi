import { Product } from "../../Product";

class WalmartHomePage {
    constructor(document) {
        this.document = document;
    }

    getProducts() {
        const productDivs = this.getProductElements();
        const products = [];
        productDivs.forEach(div => {
            try {
                let productPageLink = this.getCompleteUrl(div);
                let imageHTMLElement = this.getImageElement(div);
                let rawImageLink = imageHTMLElement ? imageHTMLElement.src : null;
                if (productPageLink && imageHTMLElement && rawImageLink) {
                    products.push(new Product(productPageLink, imageHTMLElement, rawImageLink));
                }
            } catch (error) {
                console.error("Error processing product:", error);
            }
        });
        return products;
    }

    getProductElements() {
        // Select all carousel elements with the specific class
        const carousels = this.document.querySelectorAll('[class="list ma0 pl0 overflow-x-scroll hidesb hidesb-wk relative overflow-y-hidden carousel-peek-2 carousel-6-l carousel-3-m pr3-m"]');
        
        // Initialize an empty array to hold the <li> elements
        const allListItems = [];

        // Iterate over each carousel
        carousels.forEach(carousel => {
            // Find all <li> elements within the current carousel
            const listItems = carousel.querySelectorAll('li');
            
            // Add the found <li> elements to the array
            listItems.forEach(item => allListItems.push(item));
        });

        return allListItems;
    }

    getProductCarousels() {
        return this.document.querySelectorAll('[class="list ma0 pl0 overflow-x-scroll hidesb hidesb-wk relative overflow-y-hidden carousel-peek-2 carousel-6-l carousel-3-m pr3-m"]');
    }

    getCompleteUrl(div) {
        const anchorElements = div.getElementsByTagName("a");
        if (anchorElements.length <= 0) {
            return null;
        }
        const anchorElement = anchorElements[0];
        if (!anchorElement || !anchorElement.getAttribute("href")) {
            return null;
        }

        // Concatenate the base URL with the href
        const baseUrl = window.location.origin; // Gets the base URL of the current page
        return baseUrl + anchorElement.getAttribute("href");
    }

    getImageElement(div) {
        // Use div.querySelectorAll to search within the div
        const imageElements = div.querySelectorAll('[data-testid="productTileImage"]');
        return imageElements.length > 0 ? imageElements[0] : null;
    }

    getRawImageLink(div) {
        const imageElement = this.getImageElement(div);
        return imageElement ? imageElement.src : null;
    }
}

// Example usage
let whp = new WalmartHomePage(document);
let productDivs = whp.getProductElements();

// Debugging output
productDivs.forEach(div => {
    console.log("Processing div:", div);
    console.log("Product URL:", whp.getCompleteUrl(div));
    console.log("Image Element:", whp.getImageElement(div));
    console.log("Raw Image Link:", whp.getRawImageLink(div));
});