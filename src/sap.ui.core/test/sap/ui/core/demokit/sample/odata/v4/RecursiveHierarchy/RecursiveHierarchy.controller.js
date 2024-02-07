/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/test/TestUtils"
], function (MessageBox, Controller, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy", {
		onCreate : async function (oEvent) {
			try {
				const oParentContext = oEvent.getSource().getBindingContext();
				await oParentContext.getBinding().create({
					"@$ui5.node.parent" : oParentContext
				}, /*bSkipRefresh*/true);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onCreateRoot : async function () {
			try {
				await this.byId("table").getBinding("rows").create({
						// "@$ui5.node.parent" : null
					}, /*bSkipRefresh*/true);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onCreateRootInTreeTable : async function () {
			try {
				await this.byId("treeTable").getBinding("rows").create({
						"@$ui5.node.parent" : null
					}, /*bSkipRefresh*/true);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onDelete : async function (oEvent) {
			try {
				await oEvent.getSource().getBindingContext().delete();
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onInit : function () {
			const oUriParameters = new URLSearchParams(window.location.search);
			const sExpandTo = TestUtils.retrieveData( // controlled by OPA
					"sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo")
				|| oUriParameters.get("expandTo");
			this._oAggregation = {
				expandTo : sExpandTo === "*"
					? Number.MAX_SAFE_INTEGER
					: parseFloat(sExpandTo || "3"), // Note: parseInt("1E16") === 1
				hierarchyQualifier : "OrgChart"
			};
			const sTreeTable = oUriParameters.get("TreeTable");
			const sVisibleRowCount = TestUtils.retrieveData( // controlled by OPA
					"sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount")
				|| oUriParameters.get("visibleRowCount");
			const sThreshold = oUriParameters.get("threshold");

			const oTable = this.byId("table");
			if (sTreeTable === "Y") {
				oTable.unbindRows();
				oTable.setVisible(false);
			} else {
				if (sVisibleRowCount) {
					oTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
				}
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
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
			}

			const oTreeTable = this.byId("treeTable");
			if (sTreeTable === "N") {
				oTreeTable.unbindRows();
				oTreeTable.setVisible(false);
			} else {
				// enable V4 tree table flag
				oTreeTable._oProxy._bEnableV4 = true;
				if (sVisibleRowCount) {
					oTreeTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
				}
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
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
			}

			this.initMessagePopover(sTreeTable === "N" ? "table" : "treeTable");
		},

		onMakeRoot : async function (oEvent) {
			try {
				this.getView().setBusy(true);
				await oEvent.getSource().getBindingContext().move();
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		},

		onMove : function (oEvent) {
			this._bInTreeTable = false;
			this._oNode = oEvent.getSource().getBindingContext();
			const oSelectDialog = this.byId("moveDialog");
			oSelectDialog.setBindingContext(this._oNode);
			const oListBinding = oSelectDialog.getBinding("items");
			if (oListBinding.isSuspended()) {
				oListBinding.resume();
			} else {
				oListBinding.refresh();
			}
			oSelectDialog.open();
		},

		onMoveConfirm : async function (oEvent) {
			try {
				this.getView().setBusy(true);
				const sParentId = oEvent.getParameter("selectedItem").getBindingContext()
					.getProperty("ID");
				const oParent = this._oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("ID") === sParentId);
				if (!oParent) {
					throw new Error(`Parent ${sParentId} not yet loaded`);
				}

				await this._oNode.move({parent : oParent});

				const oTable = this.byId(this._bInTreeTable ? "treeTable" : "table");
				const iParentIndex = oParent.getIndex();
				if (iParentIndex < oTable.getFirstVisibleRow()
					|| iParentIndex + 1
						>= oTable.getFirstVisibleRow() + oTable.getRowMode().getRowCount()) {
					// make sure parent & child are visible
					oTable.setFirstVisibleRow(iParentIndex);
				}
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		},

		onMoveInTreeTable : function (oEvent) {
			this.onMove(oEvent);
			this._bInTreeTable = true;
		},

		onNameChanged : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			if (oContext.hasPendingChanges()) {
				oContext.requestSideEffects(["AGE", "Name"]);
			} // else: invalid value (has not reached model)
		},

		onRefresh : function () {
			this.byId("table").getBinding("rows").getHeaderContext().requestSideEffects([""]);
		},

		onRefreshTreeTable : function () {
			this.byId("treeTable").getBinding("rows").getHeaderContext().requestSideEffects([""]);
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
