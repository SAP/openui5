sap.ui.define([
	'sap/base/Log',
	'sap/m/MessageBox',
	"sap/ui/core/mvc/Controller"
], function (Log, MessageBox, Controller) {
	"use strict";

	var bIsPolling = false;
	var iPollTimeout;

	var MainController = Controller.extend("view.Main", {
		startPolling: function (oEvent) {
			bIsPolling = !bIsPolling;
			oEvent.getSource().setText(bIsPolling ? "Stop" : "Start");

			if (bIsPolling) {
				Log.debug("Start pressed");
				(function poll() {
					iPollTimeout = setTimeout(function () {
						Log.debug("Polling");
						poll();
					}, 500);
				}());
			} else {
				Log.debug("Stop pressed");
				clearTimeout(iPollTimeout);
			}
		}
	});

	return MainController;

});
