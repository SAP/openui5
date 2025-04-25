sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.fl.internal.performance.controller.jsBaseView", {
		runPerformanceTests() {
			window.runPerformanceTests();
		}
	});
});