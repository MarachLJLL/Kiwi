export class ProductCollection {
    getProducts() {
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

    getProductDivs() {
        return null;
    }

    getCompleteUrl(div) {
        return null
    }

    getImageElement(div) {
        return null
    }

    getRawImageLink(img) {
        return null;
    }
}