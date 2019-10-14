'use strict';

import "../img/unpinterested.png";
import "../img/unpinterested_128x128.png";
import querystring from "querystring";

const URL = require("url-parse");

let isDisabled = false;
let enableForAllSearches = false;
const exclusionRegexString = "-site:pinterest.*";
const exclusionRegex = /\-site:pinterest\.\*/;

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get('isDisabled', function (data) {
        isDisabled = data.isDisabled;
    });
});


chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);
// chrome.runtime.onInstalled.addListener(function (object) {
//     chrome.tabs.create({url: "https://www.buymeacoffee.com/wDWve46U2"}, function (tab) {
//
//     });
// });


function unExcludeResults(requestDetails) {
    let {nonQueryURI, searchQuery, fullQueryString} = getParsedUrl(requestDetails.url);
    const newSearchQuery = searchQuery.replace(exclusionRegex, "");
    fullQueryString.q = newSearchQuery;
    fullQueryString.oq = newSearchQuery;

    if (searchQuery !== newSearchQuery) {
        return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};
    }

}

function modifyRequestToExcludeResults(requestDetails) {

    let {nonQueryURI, searchQuery, fullQueryString} = getParsedUrl(requestDetails.url);

    if (searchQuery && searchQuery.indexOf(exclusionRegexString) === -1) {
        const newSearchQuery = searchQuery + (" " + exclusionRegexString);
        fullQueryString.q = newSearchQuery;
        fullQueryString.oq = newSearchQuery;

        if (searchQuery !== newSearchQuery) {
            return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};
        }
    }
}

function getParsedUrl(url) {
    const URISections = url.split("?");
    let nonQueryURI = URISections[0];
    let fullQueryString = querystring.parse(URISections[1]);

    let searchQuery = fullQueryString.q || fullQueryString.oq;


    return {
        nonQueryURI,
        searchQuery,
        fullQueryString
    }
}

function monitorIsDisabled(changes, namespace) {
    if (changes.isDisabled) {
        isDisabled = changes.isDisabled.newValue;
    }
}

function monitorEnableForAllSearches(changes, namespace) {
    if (changes.enableForAllSearches) {
        enableForAllSearches = changes.enableForAllSearches.newValue;
    }
}

function initialize() {
    {
        chrome.storage.sync.get('isDisabled', function (data) {
            isDisabled = data.isDisabled || false;
        });

        chrome.storage.sync.get('enableForAllSearches', function (data) {
            isDisabled = data.enableForAllSearches || false;
        });

        chrome.storage.onChanged.addListener(monitorIsDisabled);
        chrome.storage.onChanged.addListener(monitorEnableForAllSearches);


        chrome.declarativeContent && chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher()
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });


        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {

                const host = URL(details.url).host;

                if (!/^([a-zA-Z\d-]+\.){0,}google\.([a-z\.])+$/.test(host)) {
                    return;
                }


                if (isDisabled) {
                    return unExcludeResults(details);
                }

                let {fullQueryString} = getParsedUrl(details.url);
                if (!enableForAllSearches && fullQueryString.tbm !== "isch") {
                    return unExcludeResults(details);
                }

                return modifyRequestToExcludeResults(details);

            }, {urls: ["http://*/search?*", "https://*/search?*"]}, ['blocking']);
    }
}
