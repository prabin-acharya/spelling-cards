importScripts("typo.js");

let dictionary = null;

// Load the dictionary data from the aff and dic files
Promise.all([
  fetch(chrome.runtime.getURL("./dictionaries/en_US.aff")).then((response) =>
    response.text()
  ),
  fetch(chrome.runtime.getURL("./dictionaries/en_US.dic")).then((response) =>
    response.text()
  ),
])
  .then(([affData, dicData]) => {
    dictionary = new Typo("en_US", affData, dicData);
  })
  .catch((error) => {
    console.error("Failed to load dictionary:", error);
  });

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ suggestionsCount: 1 });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "checkSpelling") {
    let originalWord = request.word;
    let wordWithSuggestions = originalWord; // we are saving words as array of "word-suggestion1-suggestion2"

    if (dictionary && !dictionary.check(originalWord)) {
      let suggestions = dictionary
        .suggest(originalWord)
        .map((suggestion) => suggestion.toLowerCase())
        .filter((suggestion) => suggestion !== originalWord)
        .filter((word) => /^[a-zA-Z]+$/.test(word));

      if (suggestions.length > 0) {
        wordWithSuggestions =
          originalWord + "-" + suggestions.slice(0, 4).join("-");
      }
    }

    console.log("bg", wordWithSuggestions)
    sendResponse({ word: wordWithSuggestions });
  }
});
