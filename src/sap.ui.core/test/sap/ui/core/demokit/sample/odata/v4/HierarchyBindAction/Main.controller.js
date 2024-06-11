/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.HierarchyBindAction.Main", {
		onChangeHierarchy : function (oEvent) {
			const oSource = oEvent.getSource();
			const oContext = oSource.toString().includes("ODataListBinding")
				? oSource.getAllCurrentContexts()[0]
				: oSource.getSelectedItem().getBindingContext();
			const oTreeTable = this.byId("table");
			oTreeTable.setBindingContext(oContext);

			const oRowsBinding = oTreeTable.getBinding("rows");
			oRowsBinding.setAggregation(this._oAggregation);

			const oView = this.getView();
			oView.setModel(oView.getModel(), "header");
			oView.setBindingContext(oRowsBinding.getHeaderContext(), "header");
		},

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
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				var oTreeTable = this.byId("table"),
					oUriParameters = new URLSearchParams(window.location.search);

				oTreeTable._oProxy._bEnableV4 = true; // enable V4 tree table flag
				const sVisibleRowCount = oUriParameters.get("visibleRowCount");
				if (sVisibleRowCount) {
					oTreeTable.getRowMode().setRowCount(parseInt(sVisibleRowCount));
				}

				const sExpandTo = oUriParameters.get("expandTo");
				this._oAggregation = {
					expandTo : sExpandTo === "*"
						? Number.MAX_SAFE_INTEGER
						: parseFloat(sExpandTo || "1"), // Note: parseInt("1E16") === 1
					hierarchyQualifier : "I_SADL_BHV_BIND_DIR_HIERVIEW"
				};

				this.byId("selectHierarchy").getBinding("items")
					.attachEventOnce("dataReceived", this.onChangeHierarchy.bind(this));

				this.initMessagePopover("table");
			}, this);
		},

		onMakeRoot : async function (oEvent, vNextSibling) {
			try {
				this.getView().setBusy(true);
				await oEvent.getSource().getBindingContext().move({
					nextSibling : vNextSibling,
					parent : null
				});
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				this.getView().setBusy(false);
			}
		},

		onMove : function (oEvent, vNextSibling) {
			this._vNextSibling = vNextSibling;
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
				const sParentId = oEvent.getParameter("selectedItem").getTitle();
				const oParent = this._oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("Id") === sParentId);
				if (!oParent) {
					throw new Error(`Parent ${sParentId} not yet loaded`);
				}

				if (this._vNextSibling === "?") {
					await this._oNode.move({
						nextSibling : oParent,
						parent : oParent.getParent()
					});
				} else {
					await this._oNode.move({
						nextSibling : this._vNextSibling,
						parent : oParent
					});
				}

				const oTable = this.byId("table");
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

		onMoveDown : async function (oEvent) {
			var oNode;

			try {
				this.getView().setBusy(true);
				oNode = oEvent.getSource().getBindingContext();
				const oTable = oEvent.getSource().getParent().getParent().getParent();
				oNode.setKeepAlive(true); // opt-in to update nextSibling's index

				const [oParent, oSibling] = await Promise.all([
					oNode.requestParent(),
					oNode.requestSibling(+1)
				]);

				if (!oSibling) {
					MessageBox.alert("Cannot move down",
						{icon : MessageBox.Icon.INFORMATION, title : "Already last sibling"});
					return;
				}

				await oSibling.move({nextSibling : oNode, parent : oParent});

				if (oNode.getIndex()
						>= oTable.getFirstVisibleRow() + oTable.getRowMode().getRowCount()) {
					// make sure moved node is visible
					oTable.setFirstVisibleRow(
						oNode.getIndex() - oTable.getRowMode().getRowCount() + 1);
				}
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				oNode.setKeepAlive(false);
				this.getView().setBusy(false);
			}
		},

		onMoveUp : async function (oEvent) {
			var oNode;

			try {
				this.getView().setBusy(true);
				oNode = oEvent.getSource().getBindingContext();
				const oTable = oEvent.getSource().getParent().getParent().getParent();
				oNode.setSelected(true); // MUST NOT make any difference here

				// eslint-disable-next-line no-inner-declarations
				function scrollTo(iIndex) {
					if (iIndex < oTable.getFirstVisibleRow()) {
						oTable.setFirstVisibleRow(iIndex);
					}
				}

				const [oParent, oSibling] = await Promise.all([
					oNode.requestParent(),
					oNode.requestSibling(-1)
				]);

				if (!oSibling) {
					scrollTo(oParent.getIndex());
					MessageBox.alert("Cannot move up",
						{icon : MessageBox.Icon.INFORMATION, title : "Already first sibling"});
					return;
				}

				await oNode.move({nextSibling : oSibling, parent : oParent});

				// make sure moved node is visible
				scrollTo(oNode.getIndex());
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				oNode.setSelected(false);
				this.getView().setBusy(false);
			}
		},

		onRefresh : function () {
			this.byId("table").getBindingContext().refresh();
		},

		onSynchronize : function () {
			this.byId("table").getBinding("rows").getHeaderContext().requestSideEffects([""]);
		}
	});
});
