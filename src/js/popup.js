// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let toggleOnOffBtn = document.getElementById('toggleOnOffBtn');

chrome.storage.sync.get("isDisabled", function (data) {
  toggleOnOffBtn.checked = !data.isDisabled;
})


toggleOnOffBtn.onclick = function toggleOnOff(btn) {
  let onOffState = !document.getElementById('toggleOnOffBtn').checked;
  chrome.storage.sync.set({isDisabled: onOffState})
};

