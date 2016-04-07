import _ from 'lodash';
import async from 'async';

const apiKey = 'DbLmvKCqMapolN7GbFyOtzW6P5QPXtNnZp82GRd0ebmTqT8MOG';

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
					cb1(null, _.pick(obj.post, ['reblog_source', 'reblog_name', 'parent_id']));
				}
				worker.postMessage(data.url);
			},
			function (obj, cb2) {
				if (obj.reblog_name && obj.parent_id) {
					let worker = new Worker(chrome.runtime.getURL('shared/worker.js'));
					worker.onmessage = function (e) {
						let result = JSON.parse(e.data);
						if (result.meta.status == 200) {
							let posts = [];
							if (result.response.posts) posts = result.response.posts;
							let tags = _.get(posts, '[0].tags') || [];
							cb2(null, _.uniq(tags));
						} else {
							cb2(null, result);
						}
					}
					let urlTpl = _.template('https://api.tumblr.com/v2/blog/<%=blogName%>.tumblr.com/posts/text?api_key=<%=apiKey%>&id=<%=postId%>');
					let requestUrl = urlTpl({
						apiKey: apiKey,
						blogName: obj.reblog_name,
						postId: obj.parent_id
					});
					worker.postMessage(requestUrl);
				}
			}
		], function (error, tags) {
			chrome.tabs.sendMessage(data.tabId, {
				action : 'REBLOG',
				data : tags
			});
		})
	}
}, {urls: ['*://*.tumblr.com/svc/post/fetch?reblog_id=*']})
