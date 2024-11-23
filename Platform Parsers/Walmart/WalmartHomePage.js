import { ProductCollection } from "../Interface/ProductCollection";

class WalmartSearchPage extends ProductCollection {
    
    getProductDivs() {
        return document.querySelectorAll("#\\30 > section > div > div");
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
        return div.querySelectorAll('[id*="productImage"]')[0];
    }

    getRawImageLink(img) {
        const imageElement = getImageElement(div);
        return imageElement.src
    }
}
