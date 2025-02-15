sap.ui.define([
	"dt/performance/PerformanceTestUtil",
	"sap/ui/core/UIComponent",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"rta/performance/RtaPerformanceTestUtil" // needed for some test functions that are defined there
], function(
	PerformanceTestUtil,
	UIComponent,
	VerticalLayout,
	HorizontalLayout
) {
	"use strict";

	return UIComponent.extend("dt.performance.designtimeRegularOverlays.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		createContent() {
			// create Vertical Layout
			const oLayout = new VerticalLayout("visibleLayout");
			PerformanceTestUtil.addMixedControlsTo(oLayout, 1, 200, true /* visible */);
			PerformanceTestUtil.addMixedControlsTo(oLayout, 201, 500, false /* invisible */);

			const oInvisibleLayout = new VerticalLayout("invisibleLayout", {
				visible: false
			});
			PerformanceTestUtil.addMixedControlsTo(oInvisibleLayout, 2001, 3000, true /* visible */);

			const oHorizontalLayout = new HorizontalLayout("HorizontalLayout", {
				content: [oLayout, oInvisibleLayout]
			});
			return oHorizontalLayout;
		}
	});
});