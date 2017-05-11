"use strict";
var frameRefs = {};

var _applicationURL = new RegExp("url" + "=([^&]*)", "i").exec(window.location.search);
_applicationURL = _applicationURL && decodeURIComponent(_applicationURL[1]);
var _applicationURI = new window.URI(_applicationURL || "../../../../../explored.html");

var appFrameId	= "APP_FRAME_ID";
var toolFrameId	= "TOOL_FRAME_ID";

var appURL = _applicationURI.path() +
			 "?sap-ui-support=true,silent&sap-ui-xx-support-origin=" + window.location.origin +
			 "&sap-ui-xx-frame-identifier=appframe";

function setAppFrameSrc() {
	frameRefs.appframe = document.getElementById(appFrameId);
	frameRefs.appframe.src = appURL;
}

var toolURL = "../../../../../resources/sap/ui/support/supportRules/ui/overlay.html?" +
			  "sap-ui-xx-support-origin=" + window.location.origin +
			  "&sap-ui-xx-frame-identifier=toolframe";

function setToolFrameSrc() {
	frameRefs.toolframe = document.getElementById(toolFrameId);
	frameRefs.toolframe.src = toolURL;
}

var bridges = [{
	from:	'appframe',
	to:		'toolframe'
}, {
	from:	'toolframe',
	to:		'appframe'
}];

function proxy(msg) {
	// in ON_ANALYZE_FINISH we have the results from analysis
	if (msg.channelName === 'ON_ANALYZE_FINISH') {
		window.localStorage.setItem('lastSupportRuleAnalysisResult', JSON.stringify({
			timestamp: +new Date(),
			issues: msg.params.issues
		}));

		setTimeout(function () {
			window.localStorage.removeItem('lastSupportRuleAnalysisResult');
		}, 1024);
	}

	// Iterate over bridge configurations
	for (var i = 0; i < bridges.length; i++) {
		// If identifier matches origin
		if (msg._frameIdentifier === bridges[i].from) {
			// Dispatch to respective frame
			frameRefs[bridges[i].to].contentWindow.postMessage(msg, window.location.origin);
		}
	}
}

var toolFrameReady	= false;
var appFrameReady	= false;

window.onmessage = function (evt) {

	// When frames are ready set flags to true
	if (evt.data.channelName === 'COMM_BUS_INTERNAL' && evt.data._frameIdentifier === 'appframe') {
		appFrameReady = true;
		setToolFrameSrc();
	}

	if (evt.data.channelName === 'COMM_BUS_INTERNAL' && evt.data._frameIdentifier === 'toolframe') {
		toolFrameReady = true;
	}

	// When target frame is not ready = add to queue
	if (evt.data.channelName) {
		proxy(evt.data);
	}
};