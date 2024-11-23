class WalmartSearchPage {
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
                let rawImageLink = this.getRawImageLink(div);
                if (productPageLink && imageHTMLElement && rawImageLink) {
                    products.push(new Product(productPageLink, imageHTMLElement, rawImageLink));
                }
            } catch (error) {
                console.error('Error processing product:', error);
            }
        });
        return products;
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
}

// Example usage
let wsp = new WalmartSearchPage(document);
let products = wsp.getProducts();