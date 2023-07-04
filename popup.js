console.log("This is a popup!");
// chrome.storage.local.get(null, function (items) {
//   var allKeys = Object.keys(items);
//   allKeys.forEach(function (key) {
//     var div = document.createElement("div");
//     div.textContent = key + ": " + items[key];
//     document.getElementById("inputs").appendChild(div);
//   });
// });

chrome.storage.local.get("words", function (data) {
  var wordList = document.getElementById("wordList");
  data.words.forEach(function (word) {
    var li = document.createElement("li");
    li.textContent = word;
    wordList.appendChild(li);
  });
});
