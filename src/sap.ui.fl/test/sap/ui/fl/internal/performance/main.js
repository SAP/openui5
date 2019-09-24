sap.ui.require([
	"sap/m/Shell",
	"fl/performance/utils/FlexPerformanceTestUtil",
	"sap/ui/core/ComponentContainer"
],
function (
	Shell,
	FlexPerformanceTestUtil, // need to be defined, it is called externally
	ComponentContainer
) {
	"use strict";
	/**
	 * FlexApplyChanges.html test should be called with the following URL parameters:
	 *		- sap-ui-fl-test-case (rename | diverse | variants)
	 *		- sap-ui-fl-test-scope (250 | 500 | 750 | 1000)
	 *		- sap-ui-fl-test-processing (xml | js)
	 */
	window.wpp = {
		customMetrics: {}
	};
	window.fnResolve;
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