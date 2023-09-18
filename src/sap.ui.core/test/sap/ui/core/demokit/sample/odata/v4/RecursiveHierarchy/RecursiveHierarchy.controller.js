/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/test/TestUtils"
], function (UriParameters, MessageBox, Controller, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy", {
		onCreate : async function (oEvent) {
			try {
				const oParentContext = oEvent.getSource().getBindingContext();
				await oParentContext.getBinding().create({
					"@$ui5.node.parent" : oParentContext
				}, /*bSkipRefresh*/true);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			}
		},

		onInit : function () {
			const oUriParameters = UriParameters.fromQuery(window.location.search);
			const sExpandTo = TestUtils.retrieveData( // controlled by OPA
					"sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo")
				|| oUriParameters.get("expandTo");
			this._oAggregation = {
				expandTo : parseInt(sExpandTo || "3"),
				hierarchyQualifier : "OrgChart"
			};
			const sVisibleRowCount = TestUtils.retrieveData( // controlled by OPA
					"sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount")
				|| oUriParameters.get("visibleRowCount");

			const oTable = this.byId("table");
			if (sVisibleRowCount) {
				oTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
			}
			const oRowsBinding = oTable.getBinding("rows");
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();
			oRowsBinding.attachCreateSent(() => {
				oTable.setBusy(true);
			});
			oRowsBinding.attachCreateCompleted(() => {
				oTable.setBusy(false);
			});

			const oTreeTable = this.byId("treeTable");
			// enable V4 tree table flag
			oTreeTable._oProxy._bEnableV4 = true;
			if (sVisibleRowCount) {
				oTreeTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
			}
			const oTreeRowsBinding = oTreeTable.getBinding("rows");
			oTreeRowsBinding.setAggregation(this._oAggregation);
			oTreeRowsBinding.resume();
			oTreeRowsBinding.attachCreateSent(() => {
				oTreeTable.setBusy(true);
			});
			oTreeRowsBinding.attachCreateCompleted(() => {
				oTreeTable.setBusy(false);
			});
		},

		onMove : function (oEvent) {
			this.oNode = oEvent.getSource().getBindingContext();
			const oSelectDialog = this.byId("moveDialog");
			const oListBinding = oSelectDialog.getBinding("items");
			if (oListBinding.isSuspended()) {
				oListBinding.resume();
			}
			oSelectDialog.open();
		},

		onMoveConfirm : async function (oEvent) {
			try {
				this.getView().setBusy(true);
				const sParentId = oEvent.getParameter("selectedItem").getTitle();
				const oParent = this.oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("ID") === sParentId);
				await this.oNode.move({parent : oParent});
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		},

		onNameChanged : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			if (oContext.hasPendingChanges()) {
				oContext.requestSideEffects(["AGE", "Name"]);
			} // else: invalid value (has not reached model)
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
