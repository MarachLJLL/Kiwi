const apiURL = 'https://quickchart.io/watermark';
const markedIMG = 'https://static.vecteezy.com/system/resources/thumbnails/017/785/303/small/creative-wrong-icon-3d-render-png.png'

class Product {
    constructor(div, imageHTMLElement, rawImageLink, processedImage) {
        this.div = div;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.processedImage;
    }

    async processImage() {
        const params = {
            mainImageUrl: this.rawImageLink,
            markImageUrl: markedIMG, 
            position: 'center', 
            opacity: 0.8, 
            markRatio: 1.0,
        };

        fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        })

        .then((response) => {
            const contentType = response.headers.get('Content-Type');
            return response.blob();
        })
        
        .then((data) => {
            if (data instanceof Blob) {
                const imageUrl = URL.createObjectURL(data);
                this.processedImage = imageUrl;
                this.imageHTMLElement.src = this.processedImage
                } else {
                    console.error('error from API:', data);
                }
        })
        .catch((error) => {
            console.error('error creating overlay:', error);
        });
    }
}