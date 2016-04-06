import _ from 'lodash';
import async from 'async';


/*
 const _AnalyticsCode = 'UA-74453743-1';
 let service, tracker;

 var importScript = (function (oHead) {
 //window.analytics = analytics;
 function loadError(oError) {
 throw new URIError("The script " + oError.target.src + " is not accessible.");
 }

 return function (sSrc, fOnload) {
 var oScript = document.createElement("script");
 oScript.type = "text\/javascript";
 oScript.onerror = loadError;
 if (fOnload) {
 oScript.onload = fOnload;
 }
 oHead.appendChild(oScript);
 oScript.src = sSrc;
 }

 })(document.head || document.getElementsByTagName("head")[0]);

 importScript(chrome.runtime.getURL('shared/google-analytics-bundle.js'), function () {
 console.info('google analytics platform loaded...');
 service = analytics.getService('instagram_easy_downloader');
 tracker = service.getTracker(_AnalyticsCode);
 tracker.sendAppView('App view');
 });
 */

chrome.webRequest.onCompleted.addListener(function (details) {
    if (details.frameId >= 0 && details.tabId >= 0) {
        let data = {
            tabId: details.tabId,
            url: details.url
        }
        async.waterfall([
            function (cb1) {
                let worker = new Worker(chrome.runtime.getURL('shared/worker.js'));
                worker.onmessage = function (e) {
                    let obj = JSON.parse(e.data);
                    cb1(null, _.pick(obj.post,['reblog_source','parent_id']));
                }
                worker.postMessage(data.url);
            },
            function (obj, cb2) {
                if (obj.reblog_source) {
                    let worker = new Worker(chrome.runtime.getURL('shared/worker.js'));
                    worker.onmessage = function (e) {
                        let selector = '[data-post-id="'+obj.parent_id+'"] a.tag-link';
                        let doc = document.implementation.createHTMLDocument("example");
                        doc.documentElement.innerHTML = e.data;
                        let tagsHTML = doc.documentElement.querySelectorAll(selector);
                        let tags = _.map(tagsHTML, function(tag){ return tag.innerText});
                        console.log(tags);
                    }
                    worker.postMessage(obj.reblog_source);
                }
            }
        ], function (error, result) {
            console.log(result);
        })
    }
}, {urls: ['*://*.tumblr.com/svc/post/fetch?reblog_id=*']})
