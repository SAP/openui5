// load History.js
sap.ui.require(["sap/ui/core/routing/History"], function(History) {
	"use strict";

	var oEvent = document.createEvent('Event');
	oEvent.initEvent("historyReady", true, true);
	oEvent._bUsePushStateInFrame = History._bUsePushState;

	// inform the parent frame
	window.parent.document.dispatchEvent(oEvent);
});
