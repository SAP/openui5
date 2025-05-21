sap.ui.require([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/performance/Measurement"
],
function(
	Shell,
	ComponentContainer,
	Measurement
) {
	"use strict";
	window.wpp = {
		customMetrics: {}
	};
	window.onAppReady = new Promise(function(fnResolve) {
		window.fnResolve = fnResolve;
	});
	Measurement.setActive(true);

	var oComponentContainer = new ComponentContainer({
		id: "componentContainer",
		height: "100%",
		name: "fl.performance.flexBundleLoad",
		async: true
	});
	new Shell({
		app: oComponentContainer
	}).placeAt("content");
});