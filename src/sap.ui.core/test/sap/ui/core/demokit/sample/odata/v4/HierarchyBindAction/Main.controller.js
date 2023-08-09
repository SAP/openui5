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
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			}
		},

		onCut : function (oEvent) {
			try {
				const oNode = oEvent.getSource().getBindingContext();
				oNode.delete("noSubmit");
				MessageBox.confirm("Restore again (undo cut)", {
					actions : sap.m.MessageBox.Action.OK,
					emphasizedAction : sap.m.MessageBox.Action.OK,
					onClose : function () {
						oNode.resetChanges();
					}
				});
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			}
		},

		onDelete : async function (oEvent) {
			try {
				await oEvent.getSource().getBindingContext().delete();
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			}
		},

		onInit : function () {
			var oTable = this.byId("table"),
				oRowsBinding = oTable.getBinding("rows"),
				oView = this.getView();

			// enable V4 tree table flag
			oTable._oProxy._bEnableV4 = true;

			this._oAggregation = {
				expandTo : 1,
				hierarchyQualifier : "R_SADL_RS_HIERVIEW_BIND"
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
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
					title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		}
	});
});
