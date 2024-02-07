let savedWords = [];

chrome.storage.local.get("words", function (data) {
  savedWords = data.words || [];
});

chrome.storage.onChanged.addListener(function (changes) {
  for (let key in changes) {
    if (key === "words") {
      savedWords = changes[key].newValue || [];
    }
  }
});

function checkWord(word) {
  chrome.runtime.sendMessage(
    { action: "checkSpelling", word: word },
    function (response) {
      word = response.word;

      // save the word only if it's not already saved, "-" is because we are saving words as array of "word-suggestion1-suggestion2"
      if (word.includes("-") && !savedWords.includes(word)) {
        // console.log("save", word)
        savedWords.push(word);
        chrome.storage.local.set({ words: savedWords });
      }
    }
  );
}

if (!(window.location.hostname == "docs.google.com" || window.location.hostname == "mail.google.com")) {
  document.body.addEventListener("input", function (e) {
    if (["password", "email", "number"].includes(e.target.type)) {
      return;
    }

    let userInputValue = null;

    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      if (e.target.isContentEditable) {
        userInputValue = e.target.innerText;
      } else {
        userInputValue = e.target.value;
      }
    }

    if (userInputValue) {
      // check if the last character signifies the end of a word(blankspace, !, ?)
      const lastCharacter = userInputValue[userInputValue.length - 1];
      const isEndOfWord = /[\s,!.?]/.test(lastCharacter);

      if (isEndOfWord) {
        let words = userInputValue.trim().split(/[\s,!.?]+/);

        const lastWord = words[words.length - 1];
        // Check the validity of the last word and save if valid.
        if (lastWord.length > 3 && /^[a-zA-Z]+$/.test(lastWord)) {
          checkWord(lastWord);
        }
      }
    }
  });

}


let currentWord = "";

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

//  track words typed by the user in google docs(track each letters typed and save the word when the user types a space or a new line)
function trackWord(key) {
  if (/^[a-z]$/.test(key) || ["Enter", " ", "Backspace", null].includes(key)) {
    if (key == " " || key === "\n" || key === "Enter" || key == null) {
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
      checkWord(currentWord);
    }
  }
}


// Gmail
if (window.location.hostname == "mail.google.com") {
  document.body.addEventListener("input", function (e) {
    if (["password"].includes(e.target.type)) {
      return;
    }

    trackWordGmail(e.data, e.inputType)
  })
}

function trackWordGmail(key, inputType) {
  if (/^[a-z]$/.test(key) || key == " " || inputType == "insertParagraph" || inputType == "deleteContentBackward") {
    if (key == " " || inputType == 'insertParagraph') {
      saveCurrentWord();
      currentWord = "";
    } else if (inputType == "deleteContentBackward") {
      currentWord = currentWord.slice(0, -1);
    } else {
      if (key)
        currentWord += key;
    }
  }

  function saveCurrentWord() {
    if (currentWord.length > 3) {
      checkWord(currentWord);
    }
  }
}