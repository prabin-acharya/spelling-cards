renderSavedWords();

document.getElementById("download").addEventListener("click", function () {
  donwloadAsCsv();
});

document.getElementById("clearButton").addEventListener("click", function () {
  let confirmation = confirm("Are you sure you want to clear all saved words?");

  if (confirmation) {
    deleteAllSavedWords();
    renderSavedWords();
  }
});

function renderSavedWords() {
  chrome.storage.local.get(["suggestionsCount"], function (data) {
    const suggestionsCount = data.suggestionsCount + 1 || 2;

    chrome.storage.local.get("words", function (data) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      const allWords = data.words.map((word) =>
        word.split("-").slice(0, suggestionsCount).join("-")
      );

      let wordList = document.getElementById("wordList");

      // Clear the list before adding new items
      wordList.innerHTML = "";

      allWords.reverse().forEach(function (word) {
        const li = document.createElement("li");

        const redWord = document.createElement("span");
        redWord.textContent = word.split("-")[0];
        redWord.style.color = "red";
        li.appendChild(redWord);

        const dash = document.createElement("span");
        dash.textContent = "  -  ";
        li.appendChild(dash);

        const greenWord = document.createElement("span");
        greenWord.textContent = word.split("-").slice(1).join("  ");
        greenWord.style.color = "green";
        li.appendChild(greenWord);

        wordList.appendChild(li);
      });
    });
  });
}

function donwloadAsCsv() {
  chrome.storage.local.get(["words", "suggestionsCount"], function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    let allWords = data.words;
    const suggestionsCount = data.suggestionsCount + 1 || 2;

    let csv = "";

    allWords.forEach(function (word) {
      let parts = word.split("-");

      csv += parts[0] + ",";

      csv += parts.slice(1, suggestionsCount).join("  ") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "words.csv";
    link.click();
  });
}

function deleteAllSavedWords() {
  chrome.storage.local.set({ words: [] }, function () {
    console.log("words cleared");
  });
}

let suggestionsCountRadios = document.querySelectorAll(
  'input[type=radio][name="suggestion"]'
);

suggestionsCountRadios.forEach((radio) =>
  radio.addEventListener("change", handleChangeSuggestionCount)
);

function handleChangeSuggestionCount(event) {
  chrome.storage.local.set({ suggestionsCount: Number(event.target.value) });

  renderSavedWords();
}

chrome.storage.local.get(["suggestionsCount"], function (data) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  suggestionsCountRadios.forEach((radio) => {
    if (radio.value == data.suggestionsCount) {
      radio.checked = true;
    }
  });
});
