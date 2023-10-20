/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.HierarchyBindAction.Main", {
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
				await this.byId("table").getBinding("rows").create({}, /*bSkipRefresh*/true);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onCut : function (oEvent) {
			try {
				const oNode = oEvent.getSource().getBindingContext();
				oNode.delete("noSubmit");
				MessageBox.confirm("Restore again (undo cut)", {
					actions : MessageBox.Action.OK,
					emphasizedAction : MessageBox.Action.OK,
					onClose : function () {
						oNode.resetChanges();
					}
				});
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

		onDescriptionChanged : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			if (oContext.hasPendingChanges()) {
				oContext.requestSideEffects(["SiblingOrder"]);
			} // else: invalid value (has not reached model)
		},

		onInit : function () {
			var oTreeTable = this.byId("table"),
				oRowsBinding = oTreeTable.getBinding("rows"),
				oUriParameters = new URLSearchParams(window.location.search),
				oView = this.getView();

			oTreeTable._oProxy._bEnableV4 = true; // enable V4 tree table flag
			const sVisibleRowCount = oUriParameters.get("visibleRowCount");
			if (sVisibleRowCount) {
				oTreeTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
			}

			const sExpandTo = oUriParameters.get("expandTo");
			this._oAggregation = {
				expandTo : sExpandTo === "*"
					? Number.MAX_SAFE_INTEGER
					: parseInt(sExpandTo || "1"),
				hierarchyQualifier : "I_SADL_BHV_BIND_DIR_HIERVIEW"
			};
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();

			oView.setModel(oView.getModel(), "header");
			oView.setBindingContext(oRowsBinding.getHeaderContext(), "header");
		},

		onMove : function (oEvent) {
			this.oNode = oEvent.getSource().getBindingContext();
			const oSelectDialog = this.byId("moveDialog");
			const oListBinding = oSelectDialog.getBinding("items");
			if (oListBinding.isSuspended()) {
				oListBinding.resume();
			}
			oSelectDialog.setBindingContext(this.oNode);
			oSelectDialog.open();
		},

		onMoveConfirm : async function (oEvent) {
			try {
				this.getView().setBusy(true);
				const sParentId = oEvent.getParameter("selectedItem").getTitle();
				const oParent = this.oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("Id") === sParentId);
				await this.oNode.move({parent : oParent});
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		},

		onSynchronize : function () {
			this.byId("table").getBinding("rows").getHeaderContext().requestSideEffects(["*"]);
		}
	});
});
