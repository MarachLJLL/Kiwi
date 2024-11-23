document.getElementById('changeColor').addEventListener('click', async () => {
    const color = document.getElementById('colorPicker').value;
  
    // Inject a script to change the background color of the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (color) => {
          document.body.style.backgroundColor = color;
        },
        args: [color],
      });
    });
  });