/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(function() {
	"use strict";

	/*global ClipboardEvent, HTMLElement*/

	document.documentElement.addEventListener("paste", function(oEvent) {
		var oActiveElement = document.activeElement,
			oNewEvent;
		if (oActiveElement instanceof HTMLElement &&
			// The paste event should always be fired on or within
			// the active element because the corresponding key board
			// event can only occur on or within the active element.
			//
			// When the event is fired out of the active element which
			// means the active element can't react to this event, the
			// event should be dispatched on the active element again.
			!oActiveElement.contains(oEvent.target)) {

			if (typeof ClipboardEvent === "function") {
				oNewEvent = new ClipboardEvent("paste", {
					bubbles: true,
					cancelable: true,
					clipboardData: oEvent.clipboardData
				});
			} else {
				// Fallback to the legacy way of event creation when
				// ClipboardEvent class doesn't exist, for example in IE11
				oNewEvent = document.createEvent('Event');
				oNewEvent.initEvent("paste", true, true);
				oNewEvent.clipboardData = oEvent.clipboardData;
			}

			oActiveElement.dispatchEvent(oNewEvent);

			// prevent this event from being processed by other handlers
			// and the browser
			oEvent.stopImmediatePropagation();
			oEvent.preventDefault();
		}

	}, /* capturing phase */ true);
	// use capturing phase because the additional event handler for the "paste" event may change the focused element
	// which affects the way that processes the event here
});
