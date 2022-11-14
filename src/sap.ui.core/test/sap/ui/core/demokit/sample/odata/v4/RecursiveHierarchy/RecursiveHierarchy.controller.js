/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy", {
		onInit : function () {
			var oRowsBinding = this.byId("table").getBinding("rows"),
				oTreeRowsBinding = this.byId("treeTable").getBinding("rows");

			// enable V4 tree table flag
			this.byId("treeTable")._oProxy._bEnableV4 = true;

			this._oAggregation = {
				expandTo : 3,
				hierarchyQualifier : "OrgChart"
			};
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();

			oTreeRowsBinding.setAggregation(this._oAggregation);
			oTreeRowsBinding.resume();
		},

		onNameChanged : function (oEvent) {
			oEvent.getSource().getBindingContext().requestSideEffects(["AGE", "Name"]);
		},

		onNameChangedInTreeTable : function (oEvent) {
			oEvent.getSource().getBindingContext().requestSideEffects(["AGE", "Name"]);
		},

		onSynchronize : function () {
			this.byId("table").getBinding("rows").getHeaderContext().requestSideEffects(["*"]);
		},

		onSynchronizeTreeTable : function () {
			this.byId("treeTable").getBinding("rows").getHeaderContext().requestSideEffects(["*"]);
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
