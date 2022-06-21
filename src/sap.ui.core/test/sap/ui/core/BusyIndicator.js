sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/BusyIndicator"
], function(Button, BusyIndicator) {
	"use strict";

	function hideBusyIndicator() {
		BusyIndicator.hide();
	}

	function showBusyIndicator(iDuration, iDelay) {
		BusyIndicator.show(iDelay);
		if (iDuration && iDuration > 0) {
			setTimeout(hideBusyIndicator, iDuration);
		}
	}

	document.body.firstElementChild.style.height = "2000px";

	new Button({
		text : "Open BusyIndicator for four seconds (default delay, which is 1 second)",
		press : function() {
			showBusyIndicator(4000);
		}
	}).placeAt("uiArea1");

	new Button({
		text : "Open BusyIndicator for four seconds (zero delay)",
		press : function() {
			showBusyIndicator(4000, 0);
		}
	}).placeAt("uiArea2");

	new Button({
		text : "Open BusyIndicator for one second (two seconds delay, so it should never appear at all)",
		press : function() {
			showBusyIndicator(1000, 2000);
		}
	}).placeAt("uiArea3");

	new Button({
		text : "Open BusyIndicator forever (zero delay)",
		press : function() {
			showBusyIndicator(-1, 0);
		}
	}).placeAt("uiArea4");
});
