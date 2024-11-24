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
let url = "https://www.walmart.ca/en/ip/Que-Pasa-Organic-Salted-Tortilla-Chips/6000196741845?selectedSellerId=0&from=/search";
console.log(fetchHtml(url));
console.log(walmartExtractIngredients(url));
  