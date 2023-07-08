importScripts("typo.js");

let affData = null;
let dicData = null;

fetch(chrome.runtime.getURL("./dictionaries/en_US.aff"))
  .then((response) => response.text())
  .then((data) => {
    affData = data;
    if (dicData) {
      initTypo();
    }
  });

fetch(chrome.runtime.getURL("./dictionaries/en_US.dic"))
  .then((response) => response.text())
  .then((data) => {
    dicData = data;
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
  if (request.action == "checkSpelling") {
    let word = request.word;
    if (dictionary && !dictionary.check(word)) {
      let suggestions = dictionary.suggest(word);
      console.log("suggestions", suggestions);
      if (suggestions.length > 0) {
        word = word + "-" + suggestions[0];
        suggestions.length > 1 && (word = word + "-" + suggestions[1]); // comment it out if you don't want to save the second suggestion
        suggestions.length > 2 && (word = word + "-" + suggestions[2]); // comment it out if you don't want to save the third suggestion
        suggestions.length > 3 && (word = word + "-" + suggestions[3]); // comment it out if you don't want to save the fourth suggestion
      }
    }

    sendResponse({ word: word });
  }
});
