import { Product } from "../../Product";

class WalmartSearchPage {
    constructor(document) {
        this.document = document;
    }

    getProducts() {
        const productDivs = this.getProductElements();
        const products = [];
        productDivs.forEach(div => {
            let p = this.divToProduct(div);
            if (p) {
                products.push(p);
            }
        });
        return products;
    }

    divToProduct(div) {
        try {
            let productPageLink = this.getCompleteUrl(div);
            let imageHTMLElement = this.getImageElement(div);
            let rawImageLink = this.getRawImageLink(div);
            if (productPageLink && imageHTMLElement && rawImageLink) {
                return new Product(div, productPageLink, imageHTMLElement, rawImageLink);
            }
        } catch (error) {
            console.error('Error processing product:', error);
        }
    }

    getProductElements() {
        return this.document.querySelectorAll("#\\30 > section > div > div");
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

        const baseUrl = window.location.origin;
        return baseUrl + anchorElement.getAttribute("href");
    }

    getImageElement(div) {
        // Ensure 'div' is valid and check for image elements
        if (!div) {
            console.error('Invalid div passed to getImageElement.');
            return null;
        }
        return div.querySelector('[id*="productImage"]');
    }

    getRawImageLink(div) {
        const imageElement = this.getImageElement(div);
        if (!imageElement) {
            console.error('Image element not found in div.');
            return null;
        }
        return imageElement.src;
    }

    addRefresh() {
        const targetElement = document.querySelector("#\\30  > section > div");
        if (targetElement) {
            // Create a MutationObserver
            const observer = new MutationObserver((mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(div => {
                            this.divToProduct(div).processProduct();
                        });
                    }
                }
            });
        
            // Start observing the target element
            observer.observe(targetElement, { childList: true });
        
            console.log('MutationObserver is now monitoring changes to child elements.');
        } else {
            console.error('Target element not found.');
        }        
    }
}


// Example usage
let wsp = new WalmartSearchPage(document);
let ps = wsp.getProducts();
ps.forEach(p => {
    p.processProduct()
})
// Debugging output