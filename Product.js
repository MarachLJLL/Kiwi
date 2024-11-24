const apiURL = 'https://quickchart.io/watermark';
const markedIMG = 'https://i.postimg.cc/4NHhhwkJ/XKiwi.png'

console.log('Product.js loaded');

export class Product {
    constructor(div, productPageLink, imageHTMLElement, rawImageLink, ingredients) {
        this.div = div;
        this.productPageLink = productPageLink;
        this.imageHTMLElement = imageHTMLElement;
        this.rawImageLink = rawImageLink;
        this.ingredients = ingredients;
        this.processedImage;
        this.isProcessed = false;
    }

    async processProduct(){
        try {
            if (this.isDangerous()) {
                this.processImage();
                this.addWarningHover();
            }
            this.isProcessed =  true;
        } catch (error) {
            
        }
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
            targetSpan.textContent = 'Contains: ' + this.ingredients; // Change the text
            targetSpan.style.color = 'red'; // Change the text color
        });

        this.div.addEventListener('mouseleave', () => {
            targetSpan.textContent = originalBrand; // Restore the original text
            targetSpan.style.color = ''; // Reset to default color
        });
    }

    async processImage(retries = 10) {
        const params = {
            mainImageUrl: this.rawImageLink,
            markImageUrl: markedIMG,
            position: 'center',
            opacity: 1.0,
            markRatio: 1.0,
        };
    
        const makeRequest = async (attempt) => {
            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(params),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }


                const data = await response.blob();
    
                if (data instanceof Blob) {
                    const imageUrl = URL.createObjectURL(data);
                    this.processedImage = imageUrl;
    
                    // Remove srcset and update src
                    if (this.imageHTMLElement.hasAttribute('srcset')) {
                        this.imageHTMLElement.removeAttribute('srcset');
                    }
                    if (this.imageHTMLElement.hasAttribute('src')) {
                        this.imageHTMLElement.src = this.processedImage;
                    }
                } else {
                    console.error("Invalid response data:", data);
                }
            } catch (error) {
                console.error(`Error on attempt ${attempt}:`, error);
    
                if (attempt < retries) {
                    console.log(`Retrying... (${attempt + 1}/${retries})`);
                    await makeRequest(attempt + 1);
                } else {
                    console.error("Max retries reached. Failed to process image.");
                }
            }
        };
    
        await makeRequest(1);
    }
    
}
