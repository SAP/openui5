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
			manifest: "json"
		},

		createContent: function () {
			//create Vertical Layout
			var oLayout = new VerticalLayout("visibleLayout");
			PerformanceTestUtil.addMixedControlsTo(oLayout, 1, 200, true /*visible*/);
			PerformanceTestUtil.addMixedControlsTo(oLayout, 201, 500, false /*invisible*/);

			var oInvisibleLayout = new VerticalLayout("invisibleLayout", {
				visible: false
			});
			PerformanceTestUtil.addMixedControlsTo(oInvisibleLayout, 2001, 3000, true /*visible*/);

			var oHorizontalLayout = new HorizontalLayout("HorizontalLayout", {
				content: [oLayout, oInvisibleLayout]
			});
			return oHorizontalLayout;
		}
	});
});
