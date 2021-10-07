'use strict';

import "../img/unpinterested.png";
import "../img/unpinterested_128x128.png";
import querystring from "querystring";

const URL = require("url-parse");

let isDisabled = false;
let enableForAllSearches = true;
const exclusionRegexString = "-site:pinterest.*";
const exclusionRegex = /\-site:pinterest\.\*/;

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get('isDisabled', function (data) {
        isDisabled = data.isDisabled;
    });
});


chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(function (object) {

    if (object.reason === 'install') {
        chrome.tabs.create({url: "https://www.buymeacoffee.com/wDWve46U2?ref=install"}, function (tab) {

        });
    }
});
chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/1faYdMUgZC_fstuOiLvQ4dg6YZ-t3613RrKpghnS2djg', ()=>{
    console.log('uninstall URL set')
});


function unExcludeResults(requestDetails) {
    let redirectUrl = requestDetails.url.replace(exclusionRegexString, '');    
    if (requestDetails.url !== redirectUrl) {
        return {redirectUrl};
    }
}

function modifyRequestToExcludeResults(requestDetails) {

    let {nonQueryURI, searchQuery, fullQueryString} = getParsedUrl(requestDetails.url);

    if (searchQuery && searchQuery.indexOf(exclusionRegexString) === -1) {
        const newSearchQuery = `${exclusionRegexString} ${searchQuery}`;
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
            console.log("isDisabled", isDisabled);
            isDisabled = data.isDisabled || false;

            if (data.isDisabled === undefined) {
                chrome.storage.sync.set({isDisabled: isDisabled})
            }
        });

        chrome.storage.sync.get('enableForAllSearches', function (data) {
            console.log("enableForAllSearches", data, data.enableForAllSearches);
            if (data.enableForAllSearches === undefined) {
                chrome.storage.sync.set({enableForAllSearches: true})
            }
            enableForAllSearches = data.enableForAllSearches !== false;
        });

        chrome.storage.onChanged.addListener(monitorIsDisabled);
        chrome.storage.onChanged.addListener(monitorEnableForAllSearches);


        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {

                const host = URL(details.url).host;

                if (!/^([a-zA-Z\d-]+\.){0,}google\.([a-z\.])+$/.test(host)) {
                    return;
                }
                
                if (/google\.[a-zA-Z]+(\.[a-zA-Z]+)?\/maps/.test(details.url)){
                    return unExcludeResults(details);
                }
                
                if (isDisabled) {
                    return unExcludeResults(details);
                }

                let {fullQueryString} = getParsedUrl(details.url);

                if (!enableForAllSearches && fullQueryString.tbm !== "isch") {
                    return unExcludeResults(details);
                }

                return modifyRequestToExcludeResults(details);

            }, {urls: ["http://*/search?*", "https://*/search?*", "http://*/maps/search*", "https://*/maps/search*", "http://*/maps?*", "https://*/maps?*"]}, ['blocking']);
    }
}
