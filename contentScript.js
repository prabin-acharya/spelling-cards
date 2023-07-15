let dictionary = new Typo("en_US");

let words = [];

chrome.storage.local.get("words", function (data) {
  words = data.words || [];
});

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

document.body.addEventListener("keyup", function (e) {
  const activeElement = document.activeElement;
  let inputValue = null;

  if (
    activeElement.tagName.toLowerCase() === "input" ||
    activeElement.tagName.toLowerCase() === "textarea"
  ) {
    const inputType = activeElement.type;
    if (
      inputType !== "password" &&
      inputType !== "email" &&
      inputType !== "number"
    ) {
      inputValue = activeElement.value;
    }
  } else if (activeElement.isContentEditable) {
    inputValue = activeElement.textContent;
  }

  if (inputValue) {
    if (inputValue.endsWith(" ") || inputValue.endsWith("\n")) {
      // Save the last word when the user types a space or a new line
      let inputWords = inputValue.trim().split(/\s+/);
      let lastWord = inputWords[inputWords.length - 1];
      saveWord(lastWord);
    }
  }
});

if (window.location.hostname === "docs.google.com") {
  const iframes = document.querySelectorAll("iframe");

  iframes.forEach((iframe, index) => {
    try {
      iframe.contentWindow.addEventListener("keydown", function (e) {
        console.log("Key pressed:", e.key);
      });
    } catch (error) {
      console.error(
        `Failed to attach event listener to iframe at index ${index}:`,
        error
      );
    }
  });
}
