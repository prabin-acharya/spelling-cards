console.log("This is a popup!");

chrome.storage.local.get("words", function (data) {
  var wordList = document.getElementById("wordList");
  data.words.forEach(function (word) {
    var li = document.createElement("li");
    li.textContent = word;
    wordList.appendChild(li);
  });
});
