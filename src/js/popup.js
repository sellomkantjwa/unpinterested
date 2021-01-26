'use strict';
require("../img/unpinterested.png");
let toggleOnOffBtn = document.getElementById("toggleOnOffBtn");
let descriptionDiv = document.getElementById("description");
let advancedSettingToggle = document.getElementById("advancedSettingToggle");
let enableForAllSearchesToggleBtn = document.getElementById("enableForAllSearchesToggleBtn");
let advancedSection = document.getElementById("advancedSection");


chrome.storage.sync.get("isDisabled", function (data) {
    toggleOnOffBtn.checked = !data.isDisabled;
    setDescriptionText(data.isDisabled);
});


chrome.storage.sync.get("enableForAllSearches", function (data) {
    enableForAllSearchesToggleBtn.checked = data.enableForAllSearches;
});


toggleOnOffBtn.onclick = function toggleOnOff(btn) {
    let isDisabled = !document.getElementById('toggleOnOffBtn').checked;
    setDescriptionText(isDisabled);
    chrome.storage.sync.set({isDisabled: isDisabled})
};


enableForAllSearchesToggleBtn.onclick = function toggleOnOff(btn) {
    let enableForAllSearches = document.getElementById('enableForAllSearchesToggleBtn').checked;
    chrome.storage.sync.set({enableForAllSearches: enableForAllSearches})
};


advancedSettingToggle.onclick = function toggleAdvancedSetting() {
    let currentlyHidden = getComputedStyle(advancedSection).display === "none";

    if (currentlyHidden) {
        advancedSection.style.display = "flex";
    } else {
        advancedSection.style.display = "none";
    }

};

function setDescriptionText(isDisabled) {
    if (isDisabled) {
        descriptionDiv.innerHTML = "Not excluding pinterest results ";
    } else {
        descriptionDiv.innerHTML = "Excluding pinterest results";
    }
}

