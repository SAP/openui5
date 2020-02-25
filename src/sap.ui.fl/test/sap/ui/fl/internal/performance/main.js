sap.ui.require([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"fl/performance/utils/FlexPerformanceTestUtil" // needs to be defined, it is called externally
],
function (
	Shell,
	ComponentContainer
) {
	"use strict";
	/**
	 * FlexApplyChanges.html test should be called with the following URL parameters:
	 *		- sap-ui-fl-test-case (rename | diverse | variants)
	 *		- sap-ui-fl-test-scope (350 | 700 | 1050)
	 *		- sap-ui-fl-test-processing (xml | js)
	  * variants and saveas scenarios are only available in js with 700 changes!
	 */
	window.wpp = {
		customMetrics: {}
	};
	window.onAppReady = new Promise(function (fnResolve) {
		window.fnResolve = fnResolve;
	});
	jQuery.sap.measure.setActive(true);

	var oComponentContainer = new ComponentContainer({
		id: "componentContainer",
		height: "100%",
		name: "fl.performance.flexApplyChanges",
		async: true,
		manifest: true
	});
	new Shell({
		app: oComponentContainer
	}).placeAt('content');
});