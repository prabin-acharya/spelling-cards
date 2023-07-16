let dictionary = new Typo("en_US");

function saveWord(word) {
  let words = [];
  chrome.storage.local.get("words", function (data) {
    words = data.words || [];
  });

  chrome.runtime.sendMessage(
    { action: "checkSpelling", word: word },
    function (response) {
      word = response.word;
      if (word.includes("-") && !words.includes(word)) {
        words.push(word);
        chrome.storage.local.set({ words: words }, function () {});
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
      let inputWords = inputValue.trim().split(/[\s,!.?]+/);
      inputWords = inputWords.filter((word) => word.length > 0);

      const lastWord = inputWords[inputWords.length - 1];
      if (lastWord.length > 3) saveWord(lastWord);
    }
  }
});

if (window.location.hostname === "docs.google.com") {
  const iframes = document.querySelectorAll("iframe");

  iframes.forEach((iframe, index) => {
    try {
      iframe.contentWindow.addEventListener("keydown", function (e) {
        trackWord(e.key);
      });
    } catch (error) {
      console.error(
        `Failed to attach event listener to iframe at index ${index}:`,
        error
      );
    }
  });
}

let currentWord = "";

function trackWord(key) {
  if (/^[a-z]$/.test(key) || ["Enter", " ", "Backspace"].includes(key)) {
    if (key === " " || key === "\n" || key === "Enter") {
      saveCurrentWord();
      currentWord = "";
    } else if (key === "Backspace") {
      currentWord = currentWord.slice(0, -1);
    } else {
      currentWord += key;
    }
  }

  function saveCurrentWord() {
    if (currentWord.length > 3) {
      saveWord(currentWord);
    }
  }
}
