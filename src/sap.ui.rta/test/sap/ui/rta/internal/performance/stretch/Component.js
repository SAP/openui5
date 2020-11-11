sap.ui.define([
	"dt/performance/PerformanceTestUtil",
	"sap/ui/core/UIComponent",
	"sap/ui/layout/VerticalLayout"
], function(
	DtPerformanceTestUtil,
	UIComponent,
	VerticalLayout
) {
	"use strict";

	return UIComponent.extend("rta.performance.stretch.Component", {
		metadata: {
			manifest: "json"
		},

		onAfterRendering: function() {
			window.fnResolve();
		},

		createContent: function () {
			var oLayout = new VerticalLayout("visibleLayout");
			DtPerformanceTestUtil.addBoxesWithMixedControls(oLayout, 100);
			return oLayout;
		}
	});
});
