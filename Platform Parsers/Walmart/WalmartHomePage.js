import { ProductCollection } from "../Interface/ProductCollection";

class WalmartHomePage extends ProductCollection {
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
                let rawImageLink = imageHTMLElement.src;
                if (productPageLink && imageHTMLElement && rawImageLink) {
                    products.push(new Product(productPageLink, imageHTMLElement, rawImageLink));
                }
            } catch (error) {
    
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
        return document.querySelectorAll('[class="list ma0 pl0 overflow-x-scroll hidesb hidesb-wk relative overflow-y-hidden carousel-peek-2 carousel-6-l carousel-3-m pr3-m"]')
    }

    getCompleteUrl(div) {
        const anchorElements = div.getElementsByTagName("a");
        if (anchorElements.length <= 0) {
            return null
        }
        const anchorElement = div.getElementsByTagName("a")[0];
        // Ensure the anchor element exists
        if (!anchorElement || !anchorElement.getAttribute("href")) {
            return null;
        }

        // Concatenate the base URL with the href
        const baseUrl = window.location.origin; // Gets the base URL of the current page
        const completeUrl = baseUrl + anchorElement.getAttribute("href");

        return completeUrl;
    }

    getImageElement(div) {
        return querySelectorAll('[data-testid="productTileImage"]')[0];
    }

    getRawImageLink(img) {
        const imageElement = getImageElement(div);
        return imageElement.src
    }
}
