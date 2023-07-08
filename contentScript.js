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

// Listen for input events on the whole document
document.body.addEventListener("input", function (e) {
  if (
    e.target.tagName.toLowerCase() === "input" ||
    e.target.tagName.toLowerCase() === "textarea"
  ) {
    const inputType = e.target.type;
    if (
      inputType !== "password" &&
      inputType !== "email" &&
      inputType !== "number"
    ) {
      let inputValue = e.target.value;

      if (inputValue.endsWith(" ") || inputValue.endsWith("\n")) {
        // Save the last word when the user types a space or a new line
        let inputWords = inputValue.trim().split(/\s+/);
        let lastWord = inputWords[inputWords.length - 1];
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
      let inputType = e.target.type;
      if (
        inputType !== "password" ||
        inputType !== "number" ||
        inputType !== "email"
      ) {
        let inputValue = e.target.value;
        let inputWords = inputValue.trim().split(/\s+/);
        let lastWord = inputWords[inputWords.length - 1];
        saveWord(lastWord);
      }
    }
  },
  true
);

function attachListeners(root) {
  root.addEventListener("input", handleInput);
  root.addEventListener("blur", handleBlur, true);

  // Recursively attach listeners to shadow roots
  root.querySelectorAll("*").forEach(function (el) {
    if (el.shadowRoot) {
      attachListeners(el.shadowRoot);
    }
  });
}

function handleInput(e) {
  if (
    e.target.tagName.toLowerCase() === "input" ||
    e.target.tagName.toLowerCase() === "textarea"
  ) {
    let inputType = e.target.type;
    if (
      inputType !== "password" ||
      inputType !== "number" ||
      inputType !== "email"
    ) {
      let inputValue = e.target.value;
      if (inputValue.endsWith(" ") || inputValue.endsWith("\n")) {
        let inputWords = inputValue.trim().split(/\s+/);
        let lastWord = inputWords[inputWords.length - 1];
        saveWord(lastWord);
      }
    }
  }

  // Recursively attach listeners to shadow roots
  e.target.querySelectorAll("*").forEach(function (el) {
    if (el.shadowRoot) {
      attachListeners(el.shadowRoot);
    }
  });
}

function handleBlur(e) {
  if (
    e.target.tagName.toLowerCase() === "input" ||
    e.target.tagName.toLowerCase() === "textarea"
  ) {
    let inputType = e.target.type;
    if (
      inputType !== "password" ||
      inputType !== "number" ||
      inputType !== "email"
    ) {
      let inputValue = e.target.value;
      let inputWords = inputValue.trim().split(/\s+/);
      let lastWord = inputWords[inputWords.length - 1];
      saveWord(lastWord);
    }
  }

  // Recursively attach listeners to shadow roots
  e.target.querySelectorAll("*").forEach(function (el) {
    if (el.shadowRoot) {
      attachListeners(el.shadowRoot);
    }
  });
}

attachListeners(document.body);
