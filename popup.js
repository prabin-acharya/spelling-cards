console.log("This is a popup!");

const suggestionsCount = 2; //shoudld be less than 4

chrome.storage.local.get("words", function (data) {
  const allWords = data.words.map((word) =>
    word
      .split("-")
      .slice(0, suggestionsCount + 1)
      .join("-")
  );

  let wordList = document.getElementById("wordList");

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

document.getElementById("download").addEventListener("click", function () {
  chrome.storage.local.get(["words"], function (data) {
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
