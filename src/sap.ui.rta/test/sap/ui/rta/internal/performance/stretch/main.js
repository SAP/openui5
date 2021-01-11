sap.ui.require([
	"sap/ui/core/ComponentContainer",
	"sap/ui/performance/Measurement"
], function(
	ComponentContainer,
	Measurement
) {
	"use strict";

	window.wpp = {
		customMetrics: {}
	};
	window.onAppReady = new Promise(function (fnResolve) {
		window.fnResolve = fnResolve;
	});
	Measurement.setActive(true);

	var oComponentContainer = new ComponentContainer({
		id: "componentContainer",
		height: "100%",
		name: "rta.performance.stretch",
		async: true,
		manifest: true,
		settings: {
			id: "stretch"
		}
	});
	oComponentContainer.placeAt("content");
});