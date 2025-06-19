sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"fl/performance/utils/FlexPerformanceTestUtil"
], function(
	Controller,
	FlexPerformanceTestUtil
) {
	"use strict";

	return Controller.extend("sap.ui.fl.internal.performance.flexBundleLoad.view.appView", {
		runPerformanceTests() {
			window.runPerformanceTests();
		},
		onAfterRendering() {
			const sMeasure = "fl.performance.flexBundleLoad";
			FlexPerformanceTestUtil.stopMeasurement(sMeasure);
			this.byId("ResultText").setText(`Measurement result: ${window.wpp.customMetrics[sMeasure]} ms`);
		}
	});
});