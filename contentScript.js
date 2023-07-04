console.log("====I am in content script");

let words = [];

let dictionary = new Typo("en_US");

// chrome.storage.local.get("words", function (data) {
//   words = data.words || [];
// });

function saveWord(word) {
  chrome.runtime.sendMessage(
    { action: "checkSpelling", word: word },
    function (response) {
      word = response.word;
      if (word.includes("-") && !words.includes(word)) {
        words.push(word); // Add the word to the array
        chrome.storage.local.set({ words: words }, function () {
          console.log("Word is saved");
        });
      }
    }
  );
}

document.body.addEventListener("input", function (e) {
  if (
    e.target.tagName.toLowerCase() === "input" ||
    e.target.tagName.toLowerCase() === "textarea"
  ) {
    var inputType = e.target.type;
    if (inputType !== "password") {
      // Do not save password inputs for privacy reasons
      var inputValue = e.target.value;
      if (inputValue.endsWith(" ") || inputValue.endsWith("\n")) {
        // Save the last word when the user types a space or a new line
        var inputWords = inputValue.trim().split(/\s+/);
        var lastWord = inputWords[inputWords.length - 1];
        saveWord(lastWord);
      }
    }
  }
});

document.body.addEventListener(
  "blur",
  function (e) {
    // Save the last word when the input field loses focus
    if (
      e.target.tagName.toLowerCase() === "input" ||
      e.target.tagName.toLowerCase() === "textarea"
    ) {
      var inputType = e.target.type;
      if (inputType !== "password") {
        var inputValue = e.target.value;
        var inputWords = inputValue.trim().split(/\s+/);
        var lastWord = inputWords[inputWords.length - 1];
        saveWord(lastWord);
      }
    }
  },
  true
);
