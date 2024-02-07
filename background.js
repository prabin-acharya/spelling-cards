importScripts("typo.js");

let dictionary = null;

async function loadDictionary() {
  console.log("load dictionary");
  if (dictionary) return;

  try {
    const [affResponse, dicResponse] = await Promise.all([
      fetch(chrome.runtime.getURL("./dictionaries/en_US.aff")),
      fetch(chrome.runtime.getURL("./dictionaries/en_US.dic"))
    ]);

    const [affData, dicData] = await Promise.all([
      affResponse.text(),
      dicResponse.text()
    ]);

    dictionary = new Typo("en_US", affData, dicData);
  } catch (error) {
    console.error("Failed to load dictionary:", error);
  }
}

loadDictionary()

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ suggestionsCount: 1 });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.action == "checkSpelling") {
      let originalWord = request.word;
      let wordWithSuggestions = originalWord; // we are saving words as array of "word-suggestion1-suggestion2"

      if (!dictionary) {
        await loadDictionary()
      }

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

      sendResponse({ word: wordWithSuggestions });
    }
  })();

  return true

});
