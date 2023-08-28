const dictionary = new Typo("en_US");

let savedWords = [];
chrome.storage.local.get("words", function (data) {
  savedWords = data.words || [];
});

chrome.storage.onChanged.addListener(function (changes) {
  for (let key in changes) {
    if (key === "words") {
      let storageChange = changes[key];
      savedWords = storageChange.newValue || [];
    }
  }
});

function saveWord(word) {
  // send the word to background for spell check
  chrome.runtime.sendMessage(
    { action: "checkSpelling", word: word },
    function (response) {
      word = response.word;

      // save the word only if it's not already saved, "-" is because we are saving words as array of "word-suggestion1-suggestion2"
      if (word.includes("-") && !savedWords.includes(word)) {
        savedWords.push(word);
        chrome.storage.local.set({ words: savedWords });
      }
    }
  );
  // });
}

document.body.addEventListener("input", function (e) {
  let userInputValue = null;

  if (
    (e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable) &&
    !["password", "email", "number"].includes(e.target.type)
  ) {
    if (e.target.isContentEditable) {
      userInputValue = e.target.innerText;
    } else {
      userInputValue = e.target.value;
    }
  }

  if (userInputValue) {
    let userInputWords = userInputValue.trim().split(/[\s,!.?]+/);
    userInputWords = userInputWords.filter((word) => word.length > 0);

    const lastCharacter = userInputValue[userInputValue.length - 1];
    const isEndOfWord = /[\s,!.?]/.test(lastCharacter);

    if (isEndOfWord) {
      const lastWord = userInputWords[userInputWords.length - 1];
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
