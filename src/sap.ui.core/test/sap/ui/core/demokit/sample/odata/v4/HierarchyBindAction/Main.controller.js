/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, Filter, FilterOperator, FilterType, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.HierarchyBindAction.Main", {
		create : async function (oParentContext, bFilteredOut) {
			try {
				const oContext = this.byId("table").getBinding("rows").create({
					"@$ui5.node.parent" : oParentContext,
					Description : bFilteredOut ? "Out" : ""
				}, /*bSkipRefresh*/true);
				await oContext.created();
				this.scrollTo(oContext);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

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

		onCollapseAll : function (oEvent) {
			oEvent.getSource().getBindingContext().collapse(true);
		},

		onCreate : function (oEvent, bFilteredOut) {
			this.create(oEvent.getSource().getBindingContext(), bFilteredOut);
		},

		onCreateRoot : function (_oEvent, bFilteredOut) {
			this.create(null, bFilteredOut);
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

		onExpandLevels : function (oEvent) {
			this.byId("expandLevelsDialog")
				.setBindingContext(oEvent.getSource().getBindingContext())
				.open();
		},

		onExpandLevelsCancel : function () {
			this.byId("expandLevelsDialog").close();
		},

		onExpandLevelsConfirm : function (oEvent) {
			const sValue = this.byId("expandLevels").getValue();
			try {
				oEvent.getSource().getBindingContext()
					.expand(sValue === "*"
						? Number.MAX_SAFE_INTEGER
						: parseFloat(sValue)); // Note: parseInt("1E16") === 1
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				this.byId("expandLevelsDialog").close();
			}
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
				if (oUriParameters.has("createInPlace")) {
					this._oAggregation.createInPlace = true;
				}

				this.byId("selectHierarchy").getBinding("items")
					.attachEventOnce("dataReceived", this.onChangeHierarchy.bind(this));

				this.byId("table").getBinding("rows").filter(
					new Filter("Description", FilterOperator.NotStartsWith, "Out"),
					FilterType.Control);

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

				if (oNode.created()) { // out-of-place, move it to become the 1st child/root
					await oNode.move({nextSibling : oSibling, parent : oParent});
				} else {
					await oSibling.move({nextSibling : oNode, parent : oParent});
				}

				this.scrollTo(oNode);
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
				oNode.setSelected(true); // MUST NOT make any difference here

				const [oParent, oSibling] = await Promise.all([
					oNode.requestParent(),
					oNode.requestSibling(-1)
				]);

				if (!oSibling) {
					if (oParent) {
						this.scrollTo(oParent);
					}
					MessageBox.alert("Cannot move up",
						{icon : MessageBox.Icon.INFORMATION, title : "Already first sibling"});
					return;
				}

				await oNode.move({nextSibling : oSibling, parent : oParent});

				// make sure moved node is visible
				this.scrollTo(oNode);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				oNode.setSelected(false);
				this.getView().setBusy(false);
			}
		},

		onRefresh : function (_oEvent, bKeepTreeState) {
			var oTable = this.byId("table");

			if (bKeepTreeState) {
				oTable.getBinding("rows").getHeaderContext().requestSideEffects([""]);
			} else {
				oTable.getBindingContext().refresh();
			}
		},

		scrollTo : function (oNode) {
			const iIndex = oNode.getIndex();
			const oTable = this.byId("table");
			const iFirstVisibleRow = oTable.getFirstVisibleRow();
			const iRowCount = oTable.getRowMode().getRowCount();

			if (iIndex < iFirstVisibleRow) {
				oTable.setFirstVisibleRow(iIndex);
			} else if (iIndex >= iFirstVisibleRow + iRowCount) {
				oTable.setFirstVisibleRow(iIndex - iRowCount + 1);
			} // else: node is already visible
		}
	});
});
