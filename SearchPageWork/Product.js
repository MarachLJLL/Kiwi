const watermarkURL = 'https://quickchart.io/watermark'

export class Product {
    constructor(productPageLink, imageHTMLElement, rawImageLink) {
        this.productPageLink = productPageLink;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.processedImageLink;
    }

    changeImage(processedImageLink) {
        this.processedImageLink = processedImageLink;
        this.imageHTMLElement.src = processedImageLink;
    }

    processImage() {
        // pseudocode for changingimageHTMLElement.src("new image")
        
        // fetching


        // found image
        // this.processedImage = 

    }

}