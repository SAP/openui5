sap.ui.define(["sap/ui/core/mvc/JSView", "fl/performance/utils/FlexPerformanceTestUtil"], function (JSView, FlexPerformanceTestUtil) {
	"use strict";
	sap.ui.jsview("fl.performance.view.jsView", {
		createContent: function () {
			return FlexPerformanceTestUtil.createContent.call(this);
		}
	});
});