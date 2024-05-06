sap.ui.require([
	"dt/performance/PerformanceTestUtil",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout"
], function(
	PerformanceTestUtil,
	VerticalLayout,
	HorizontalLayout
) {
	"use strict";

	// create Vertical Layout
	const oLayout = new VerticalLayout("visibleLayout", {});
	PerformanceTestUtil.addMixedControlsTo(oLayout, 1, 500, true /* visible */);
	PerformanceTestUtil.addMixedControlsTo(oLayout, 1001, 2000, false /* invisible */);

	const oInvisibleLayout = new VerticalLayout("invisibleLayout", {
		visible: false
	});
	PerformanceTestUtil.addMixedControlsTo(oInvisibleLayout, 2001, 3000, true /* visible */);

	const oHorizontalLayout = new HorizontalLayout("HorizontalLayout", {
		content: [oLayout, oInvisibleLayout]
	});
	oHorizontalLayout.placeAt("content");
});