import { Product } from "./Product";

class Product {
    constructor(productPageLink, imageHTMLElement, rawImageLink) {
        this.productPageLink = productPageLink;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.processedImage;
    }
}

function getProducts() {
    const productDivs = document.querySelectorAll("#\\30 > section > div > div");
    const products = [];
    productDivs.forEach(div => {
        try {
            let productPageLink = getCompleteUrl(div);
            let imageHTMLElement = getImageElement(div);
            let rawImageLink = imageHTMLElement.src;
            if (productPageLink && imageHTMLElement && rawImageLink) {
                products.push(new Product(productPageLink, imageHTMLElement, rawImageLink));
            }
        } catch (error) {

        }
    });
    return products;
}

function getCompleteUrl(div) {
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

function getImageElement(div) {
    return div.querySelectorAll('[id*="productImage"]')[0];
}

function getRawImageLink(div) {
    const imageElement = getImageElement(div);
    return imageElement.src
}