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
		var oActiveElement = document.activeElement;
		if (oActiveElement instanceof HTMLElement &&
			// The paste event should always be fired on or within
			// the active element because the corresponding key board
			// event can only occur on or within the active element.
			//
			// When the event is fired out of the active element which
			// means the active element can't react to this event, the
			// event should be dispatched on the active element again.
			!oActiveElement.contains(oEvent.target)) {

			var oNewEvent = new ClipboardEvent("paste", {
				bubbles: true,
				clipboardData: oEvent.clipboardData
			});
			oActiveElement.dispatchEvent(oNewEvent);

			// prevent this event from being processed by other handlers
			// and the browser
			oEvent.stopImmediatePropagation();
			oEvent.preventDefault();
		}

	});
});
