const apiURL = 'https://quickchart.io/watermark';
const markedIMG = 'https://i.postimg.cc/4NHhhwkJ/XKiwi.png'

console.log('Product.js loaded');

class Product {
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

// this works
async function walmartExtractIngredients(url) {
    try {
      // Fetch the HTML content of the page
      const response = await fetchHtml(url);
  
      if (!response) {
        return "Failed to fetch the HTML content.";
      }
  
      // Create a DOM parser to parse the HTML
      const parser = new DOMParser();
      const document = parser.parseFromString(response, "text/html");
  
      // Find the <script> tag with id="__NEXT_DATA__"
      const scriptTag = document.querySelector("script#__NEXT_DATA__");
      if (!scriptTag) {
        return "Script tag with id='__NEXT_DATA__' not found";
      }
  
      const scriptContent = scriptTag.textContent;
      if (!scriptContent) {
        return "No content found inside <script> tag";
      }
  
      // Parse the JSON content from the script
      const data = JSON.parse(scriptContent);
  
      // Extract ingredients
      const ingredients =
        data?.props?.pageProps?.initialData?.data?.idml?.ingredients?.ingredients?.value;
  
      // Get the product title
      const titleElement = document.querySelector("#main-title");
      const productTitle = titleElement ? titleElement.textContent.trim() : "No title found";
  
      // Return ingredients or title if no ingredients found
      if (!ingredients || ingredients.toLowerCase().trim() === "none") {
        return `${productTitle}`;
      }
  
      return `${ingredients}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  
  // Utility function to fetch HTML using XMLHttpRequest
function fetchHtml(url) {
    return new Promise((resolve, reject) => {
      console.log('1');
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      console.log('2');
      // Removed the User-Agent header setting
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(`Failed to fetch: ${xhr.status} ${xhr.statusText}`));
        }
      };
      console.log('3');
      xhr.onerror = function () {
        reject(new Error("Network error occurred while fetching the HTML."));
      };
      console.log('4');
      xhr.send();
      console.log('5');
    });
}
class WalmartSearchPage {
    constructor(document) {
        this.document = document;
    }

    async getProducts() {
        const productDivs = this.getProductElements();
        const products = [];

        for (const div of productDivs) {
            const p = await this.divToProduct(div); // Await the async result
            if (p) {
                products.push(p);
            }
        }

        return products; // Return an array of Product objects
    }

    async divToProduct(div) {
        try {
            let productPageLink = this.getCompleteUrl(div);
            let ingredients = await walmartExtractIngredients(productPageLink); // Await the async function
            console.log(ingredients);
            let imageHTMLElement = this.getImageElement(div);
            let rawImageLink = this.getRawImageLink(div);
            if (productPageLink && imageHTMLElement && rawImageLink) {
                return new Product(div, productPageLink, imageHTMLElement, rawImageLink, ingredients);
            }
        } catch (error) {
            console.error('Error processing product:', error);
            return null; // Ensure null is returned on failure
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

(async () => {
    let wsp = new WalmartSearchPage(document);
    let ps = await wsp.getProducts();
    ps.forEach(p => {
        //console.log(p)
        p.addWarningHover();
        p.processImage();
    })
})();

/*
(async () => {
let wsp = new WalmartSearchPage(document);
let fst = wsp.getProductElements()[0];
let p0 = await wsp.divToProduct(fst);
p0.addWarningHover();
p0.processImage();
})();







*/