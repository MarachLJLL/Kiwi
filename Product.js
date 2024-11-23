const apiURL = 'https://quickchart.io/watermark';
const markedIMG = 'https://i.postimg.cc/4NHhhwkJ/XKiwi.png'

class Product {
    constructor(div, productPageLink, imageHTMLElement, rawImageLink) {
        this.div = div;
        this.productPageLink = productPageLink;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.processedImage;
        this.isProcessed = false;
        
    }

    async processProduct(){
        if (this.isDangerous) {
            this.processImage;
            this.addWarningHover;
        }
        this.isProcessed =  true;
    }

    async isDangerous() {
        return true;
    }

    addWarningHover() {
        // Select the outer span (w_vi_D)
        const targetSpan = this.div.querySelector('.mb1.mt2.b.f6.black.mr1.lh-copy');
        const originalBrand = targetSpan.textContent;
        // Add event listeners for hover (mouseenter and mouseleave)
        this.div.addEventListener('mouseenter', () => {
            targetSpan.textContent = 'Contains: '; // Change the text
            targetSpan.style.color = 'red'; // Change the text color
        });

        this.div.addEventListener('mouseleave', () => {
            targetSpan.textContent = originalBrand; // Restore the original text
            targetSpan.style.color = ''; // Reset to default color
        });
    }

    async processImage() {
        const params = {
            mainImageUrl: this.rawImageLink,
            markImageUrl: markedIMG, 
            position: 'center', 
            opacity: 1.0, 
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