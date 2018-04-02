'use strict';

import "../img/get_started16.png";
import "../img/get_started32.png";
import querystring from "querystring";

chrome.runtime.onInstalled.addListener(function () {

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            console.log(details);
            let nonQueryURI = details.url.split("?")[0];
            let fullQueryString = querystring.parse(details.url);
            console.log(fullQueryString);
            let searchQuery = fullQueryString.q || fullQueryString.oq;

            if (searchQuery && searchQuery.indexOf("-site:*.pinterest.*") === -1) {
                searchQuery += " -site:*.pinterest.*";
            }


            fullQueryString.q = searchQuery;
            fullQueryString.oq = searchQuery;


            return {redirectUrl: `${nonQueryURI}?${querystring.stringify(fullQueryString)}`};


        }, {urls: ["http://*/search*", "https://*/search*"]}, ['blocking']);
});

