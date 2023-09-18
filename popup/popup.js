async function fetchFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, function (data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data);
      }
    });
  });
}

async function renderSavedWords() {
  try {
    const { words, suggestionsCount = 1 } = await fetchFromStorage([
      "words",
      "suggestionsCount",
    ]);

    if (!words || words.length == 0) {
      return;
    }

    const allWords = words.map((word) =>
      word
        .split("-")
        .slice(0, suggestionsCount + 1)
        .join("-")
    );

    let wordList = document.getElementById("wordList");
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
  } catch (error) {
    console.error(error);
  }
}

function showHideContainers(words) {
  if (words.length === 0) {
    document.getElementById("container").style.display = "none";
    document.getElementById("emptyContainer").style.display = "block";
  } else {
    document.getElementById("container").style.display = "block";
    document.getElementById("emptyContainer").style.display = "none";
  }
}

document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    downloadAsCsv();
  });

document.getElementById("clearButton").addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all saved words?")) {
    deleteAllSavedWords();
    renderSavedWords();
    showHideContainers([]);
  }
});

let suggestionsCountRadios = document.querySelectorAll(
  'input[type=radio][name="suggestion"]'
);
suggestionsCountRadios.forEach((radio) =>
  radio.addEventListener("change", handleChangeSuggestionCount)
);

async function initialize() {
  try {
    const { words = [], suggestionsCount } = await fetchFromStorage([
      "words",
      "suggestionsCount",
    ]);

    showHideContainers(words);

    suggestionsCountRadios.forEach((radio) => {
      if (radio.value == suggestionsCount) {
        radio.checked = true;
      }
    });

    renderSavedWords();
  } catch (error) {
    console.error(error);
  }
}

initialize();

function handleChangeSuggestionCount(event) {
  chrome.storage.local.set(
    { suggestionsCount: Number(event.target.value) },
    function () {
      renderSavedWords();
    }
  );
}

function downloadAsCsv() {
  fetchFromStorage(["words", "suggestionsCount"])
    .then(({ words, suggestionsCount = 1 }) => {
      let csv = "";
      words.forEach(function (word) {
        let parts = word.split("-");
        csv += parts[0] + ",";
        csv += parts.slice(1, suggestionsCount + 1).join("  ") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "words.csv";
      link.click();
    })
    .catch(console.error);
}

function deleteAllSavedWords() {
  chrome.storage.local.set({ words: [] }, function () {
    console.log("words cleared");
  });
}
