console.log("This is a popup!");

chrome.storage.local.get("words", function (data) {
  let wordList = document.getElementById("wordList");
  data.words.reverse().forEach(function (word) {
    let li = document.createElement("li");

    let redWord = document.createElement("span");
    redWord.textContent = word.split("-")[0];
    redWord.style.color = "red";
    li.appendChild(redWord);

    let dash = document.createElement("span");
    dash.textContent = "  -  ";
    li.appendChild(dash);

    let greenWord = document.createElement("span");
    greenWord.textContent = word.split("-")[1];
    greenWord.style.color = "green";
    li.appendChild(greenWord);

    wordList.appendChild(li);
  });
});

document.getElementById("download").addEventListener("click", function () {
  chrome.storage.local.get(["words"], function (result) {
    let words = result.words;
    let csv = "Typed Word,Correct Spelling\n";
    words.forEach(function (word) {
      let parts = word.split("-");
      csv += parts[0] + "," + parts[1] + "\n";
    });
    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "words.csv";
    link.click();
  });
});
