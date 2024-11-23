const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

async function extractIngredientsFromScript(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
      }
    });
    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const scriptTag = document.querySelector("script#__NEXT_DATA__");
    if (!scriptTag) {
      return "Script tag with id='__NEXT_DATA__' not found";
    }

  
    const scriptContent = scriptTag.textContent;
    if (!scriptContent) {
      return "No content found inside <script> tag";
    }

    const data = JSON.parse(scriptContent);

    const ingredients =
      data?.props?.pageProps?.initialData?.data?.idml?.ingredients?.ingredients?.value;


    const titleElement = document.querySelector("#main-title");
    const productTitle = titleElement ? titleElement.textContent.trim() : "No title found";


    if (!ingredients || ingredients.toLowerCase().trim() === "none") {
      return `${productTitle}`;
    }

    return `${ingredients}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
