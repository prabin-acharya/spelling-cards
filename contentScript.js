console.log("====I am in content script");

let words = [];

document.body.addEventListener("input", function (e) {
  if (
    e.target.tagName.toLowerCase() === "input" ||
    e.target.tagName.toLowerCase() === "textarea"
  ) {
    var inputType = e.target.type;
    if (inputType !== "password") {
      // Do not save password inputs for privacy reasons
      var inputValue = e.target.value;
      var inputWords = inputValue.split(" "); // Split the input into words
      words = words.concat(inputWords); // Add the new words to the array
      chrome.storage.local.set({ words: words }, function () {
        console.log("Words are saved");
      });
    }
  }
});
