/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy", {
		onInit : function () {
			var oRowsBinding = this.byId("table").getBinding("rows");

			this._oAggregation = {
				expandTo : 3,
				hierarchyQualifier : "OrgChart"
			};
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();
		},

		onToggleExpand : function (oEvent) {
			// get the context from the button's row
			var oRowContext = oEvent.getSource().getBindingContext();

			if (oRowContext.isExpanded()) {
				oRowContext.collapse();
			} else {
				oRowContext.expand();
			}
		}
	});
});
