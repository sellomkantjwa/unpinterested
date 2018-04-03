'use strict';

import "../img/unpinterested.png";
import querystring from "querystring";
const URL = require("url-parse");

let isDisabled = false;


chrome.runtime.onStartup.addListener(function () {

    chrome.storage.sync.get('isDisabled', function (data) {
        isDisabled = data.isDisabled;
    });
});


chrome.runtime.onInstalled.addListener(function () {

    chrome.storage.sync.get('isDisabled', function (data) {
        isDisabled = data.isDisabled || false;
    });

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

            const host = URL(details.url).host;
            console.log(host);  
            if (!/^([a-zA-Z\d-]+\.){0,}google\.([a-z\.])+$/.test(host)) {
                return;
            }

            if (isDisabled) {
                return unExcludeResults(details);
            }
            return modifyRequestToExcludeResults(details);

        }, {urls: ["http://*/search*", "https://*/search*"]}, ['blocking']);
});



function unExcludeResults(requestDetails) {
    let {nonQueryURI, searchQuery, fullQueryString} = getParsedUrl(requestDetails.url);
    searchQuery = searchQuery.replace(/\-site:\*\.pinterest\.\*/, "");
    fullQueryString.q = searchQuery;
    fullQueryString.oq = searchQuery;
    return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};
}


function modifyRequestToExcludeResults(requestDetails) {


    let {nonQueryURI, searchQuery, fullQueryString} = getParsedUrl(requestDetails.url);

    if (searchQuery && searchQuery.indexOf("-site:*.pinterest.*") === -1) {
        searchQuery += " -site:*.pinterest.*";
        fullQueryString.q = searchQuery;
        fullQueryString.oq = searchQuery;
    }

    return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};
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