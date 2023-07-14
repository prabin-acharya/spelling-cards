console.log("This is a popup!");

function renderSavedWords() {
  chrome.storage.sync.get(["suggestionsCount"], function (data) {
    const suggestionsCount = data.suggestionsCount + 1;

    chrome.storage.local.get("words", function (data) {
      const allWords = data.words.map((word) =>
        word.split("-").slice(0, suggestionsCount).join("-")
      );

      let wordList = document.getElementById("wordList");

      // Clear the list before adding new items
      wordList.innerHTML = "";

      allWords.reverse().forEach(function (word) {
        let li = document.createElement("li");

        let redWord = document.createElement("span");
        redWord.textContent = word.split("-")[0];
        redWord.style.color = "red";
        li.appendChild(redWord);

        let dash = document.createElement("span");
        dash.textContent = "  -  ";
        li.appendChild(dash);

        let greenWord = document.createElement("span");
        greenWord.textContent = word.split("-").slice(1).join("  ");
        greenWord.style.color = "green";
        li.appendChild(greenWord);

        wordList.appendChild(li);
      });
    });
  });
}

renderSavedWords();

document.getElementById("download").addEventListener("click", function () {
  chrome.storage.sync.get(["words"], function (data) {
    let allWords = data.words;

    let csv = "";

    allWords.forEach(function (word) {
      console.log(word);
      let parts = word.split("-");

      csv += parts[0] + ",";

      csv += parts.slice(1, suggestionsCount + 1).join("  ") + "\n";
    });
    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "words.csv";
    link.click();
  });
});

document.getElementById("clearButton").addEventListener("click", function () {
  chrome.storage.local.set({ words: [] }, function () {
    console.log("words cleared");
  });
});

let suggestionsCountRadios = document.querySelectorAll(
  'input[type=radio][name="suggestion"]'
);

function handleChange(event) {
  chrome.storage.sync.set({ suggestionsCount: Number(event.target.value) });

  renderSavedWords();
}

suggestionsCountRadios.forEach((radio) =>
  radio.addEventListener("change", handleChange)
);

chrome.storage.sync.get(["suggestionsCount"], function (data) {
  suggestionsCountRadios.forEach((radio) => {
    if (radio.value == data.suggestionsCount) {
      radio.checked = true;
    }
  });
});
