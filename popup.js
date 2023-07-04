console.log("This is a popup!");

chrome.storage.local.get("words", function (data) {
  var wordList = document.getElementById("wordList");
  data.words.forEach(function (word) {
    var li = document.createElement("li");
    li.textContent = word;
    wordList.appendChild(li);
  });
});

document.getElementById("download").addEventListener("click", function () {
  chrome.storage.local.get(["words"], function (result) {
    var words = result.words;
    var csv = "Typed Word,Correct Spelling\n";
    words.forEach(function (word) {
      var parts = word.split("-");
      csv += parts[0] + "," + parts[1] + "\n";
    });
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "words.csv";
    link.click();
  });
});
