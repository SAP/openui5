(function() {
	"use strict";
	// increase performance buffer size
	if ( performance && performance.setResourceTimingBufferSize ) {
		performance.setResourceTimingBufferSize(500);
	}
	// add debug mode to title
	var mMatch = /(?:^|\?|&)sap-ui-debug=([^&]*)(?:&|$)/.exec(location.search),
		sDebugMode = (mMatch && decodeURIComponent(mMatch[1])) || '',
		oTitle = document.querySelector('TITLE');
	if ( oTitle ) {
		oTitle.textContent = oTitle.textContent.replace("{{mode}}", sDebugMode || "off");
	}

	// set QUnit config early so that it becomes active before QUnit starts even when the test code is loaded async
	globalThis.QUnit = {
		config: {
			autostart: false
		}
	};
}());
