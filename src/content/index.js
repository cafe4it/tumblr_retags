import _ from 'lodash';

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    if(!msg.action) return;
    if(msg.action == 'REBLOG'){
        let formControls = document.querySelector('.post-form--controls .controls-container');
        console.log(formControls);
    }
})