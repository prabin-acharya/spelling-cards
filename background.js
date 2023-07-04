console.log("I am in background script");
importScripts("typo.js");

let affData = null;
let dicData = null;

fetch(chrome.runtime.getURL("./dictionaries/en_US.aff"))
  .then((response) => response.text())
  .then((data) => {
    affData = data;
    // Only initialize Typo after both files have loaded.
    if (dicData) {
      initTypo();
    }
  });

fetch(chrome.runtime.getURL("./dictionaries/en_US.dic"))
  .then((response) => response.text())
  .then((data) => {
    dicData = data;
    // Only initialize Typo after both files have loaded.
    if (affData) {
      initTypo();
    }
  });

let dictionary = null;

function initTypo() {
  dictionary = new Typo("en_US", affData, dicData);
  console.log("dictionary", dictionary);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("======+++++", request);
  if (request.action == "checkSpelling") {
    let word = request.word;
    if (!dictionary.check(word)) {
      let suggestions = dictionary.suggest(word);
      if (suggestions.length > 0) {
        word = word + "-" + suggestions[0]; // If the word is misspelled
      }
    }
    sendResponse({ word: word });
  }
});
