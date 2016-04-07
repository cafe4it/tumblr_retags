import _ from 'lodash';

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    if(!msg.action) return;
    if(msg.action == 'REBLOG'){
        let formControls = document.querySelector('.post-form--controls .controls-container');
	    let tagsEditor = document.querySelector('.post-form--tag-editor');
	    let tagInputWrapper = document.querySelector('.tag-input-wrapper');
	    let placeHolderTags = document.querySelectorAll('.post-container .editor-placeholder');
	    placeHolderTags = _.last(placeHolderTags);
        let tags = msg.data;
	    //console.info(tags.join(' '));
        if(_.isArray(tags) && tags.length > 0){
	        console.info(tags.join(' '));
	        _.each(tags, function(tag){
		        let span = document.createElement('span');
		        span.setAttribute('class', 'tag-label');
		        span.setAttribute('draggable', 'true');
		        span.innerHTML = tag;
		        tagsEditor.insertBefore(span, tagInputWrapper);
	        });
			placeHolderTags.innerHTML = '';
        }
    }
})