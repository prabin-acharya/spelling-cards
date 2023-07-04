console.log("I am in background script");

// when user is typing in input field, save the input value to local storage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "input") {
    console.log("I am in background script");
    console.log(request);
    var inputValue = request.value;
    var inputId = request.id;
    var save = {};
    save[inputId] = inputValue;
    chrome.storage.local.set(save, function () {
      console.log("Value is set to " + inputValue);
    });
  }
});

// chrome.action.onClicked.addListener((tab) => {
//   console.log("=======++++++");
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["contentScript.js"],
//   });
// });
