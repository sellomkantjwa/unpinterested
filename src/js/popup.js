
'use strict';

let toggleOnOffBtn = document.getElementById('toggleOnOffBtn');

chrome.storage.sync.get("isDisabled", function (data) {
  toggleOnOffBtn.checked = !data.isDisabled;
})


toggleOnOffBtn.onclick = function toggleOnOff(btn) {
  let onOffState = !document.getElementById('toggleOnOffBtn').checked;
  chrome.storage.sync.set({isDisabled: onOffState})
};

