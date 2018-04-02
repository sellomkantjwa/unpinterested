'use strict';

import "../img/get_started16.png";
import "../img/get_started32.png";
import "../img/get_started48.png";
import querystring from "querystring";

let isDisabled = false;


chrome.runtime.onStartup.addListener(function () {
    console.log("Doing things")
    chrome.storage.sync.get('isDisabled', function (data) {
        isDisabled = data.isDisabled;
    });
});


chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.onChanged.addListener(monitorIsDisabled);
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });


    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (isDisabled) {
                return;
            }
            return modifyRequestToExcludeResults(details);

        }, {urls: ["http://*/search*", "https://*/search*"]}, ['blocking']);
});


function modifyRequestToExcludeResults(requestDetails) {
    const URISections = requestDetails.url.split("?");
    let nonQueryURI = URISections[0];
    let fullQueryString = querystring.parse(URISections[1]);

    let searchQuery = fullQueryString.q || fullQueryString.oq;

    if (searchQuery && searchQuery.indexOf("-site:*.pinterest.*") === -1) {
        searchQuery += " -site:*.pinterest.*";
        fullQueryString.q = searchQuery;
        fullQueryString.oq = searchQuery;
    }

    return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};
}


function monitorIsDisabled(changes, namespace) {
    if (changes.isDisabled) {
        isDisabled = changes.isDisabled.newValue;
    }
}