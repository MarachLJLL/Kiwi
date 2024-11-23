export class ProductCollection {
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