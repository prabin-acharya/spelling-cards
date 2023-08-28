let dictionary = new Typo("en_US");

function saveWord(word) {
  chrome.storage.local.get("words", function (data) {
    let words = data.words || [];

    // send the word to background for spell check
    chrome.runtime.sendMessage(
      { action: "checkSpelling", word: word },
      function (response) {
        word = response.word;

        // save the word only if it's not already saved, "-" is because we are saving words as array of "word-suggestion1-suggestion2"
        if (word.includes("-") && !words.includes(word)) {
          words.push(word);
          chrome.storage.local.set({ words: words });
        }
      }
    );
  });
}

document.body.addEventListener("input", function (e) {
  let inputValue = null;

  if (
    (e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable) &&
    !["password", "email", "number"].includes(e.target.type)
  ) {
    if (e.target.isContentEditable) {
      inputValue = e.target.innerText;
    } else {
      inputValue = e.target.value;
    }
  }

  if (inputValue) {
    let inputWords = inputValue.trim().split(/[\s,!.?]+/);
    inputWords = inputWords.filter((word) => word.length > 0);

    const lastCharacter = inputValue[inputValue.length - 1];
    const isEndOfWord = /[\s,!.?]/.test(lastCharacter);
    console.log(inputWords, isEndOfWord);

    if (isEndOfWord) {
      const lastWord = inputWords[inputWords.length - 1];
      if (lastWord.length > 3) saveWord(lastWord);
    }
  }
});

// special case for google docs
if (window.location.hostname == "docs.google.com") {
  document.querySelectorAll("iframe").forEach((iframe, index) => {
    try {
      iframe.contentWindow.addEventListener("keyup", function (e) {
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

//  track words typed by the user in google docs(track each letters typed and save the word when the user types a space or a new line)
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
