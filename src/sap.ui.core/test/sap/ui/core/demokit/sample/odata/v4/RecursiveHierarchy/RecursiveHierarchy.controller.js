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
		create : async function (sId, oParentContext, bFilteredOut) {
			const oTable = this.byId(sId);
			const oBinding = oParentContext?.getBinding() ?? oTable.getBinding("rows");
			try {
				const oContext = oBinding.create({
					"@$ui5.node.parent" : oParentContext,
					STATUS : bFilteredOut ? "Out" : ""
				}, /*bSkipRefresh*/true);
				await oContext.created();
				this.scrollTo(oContext, oTable);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
		},

		onCreate : function (oEvent, bFilteredOut) {
			const sId = oEvent.getSource().getParent().getParent().getParent().getId();
			this.create(sId, oEvent.getSource().getBindingContext(), bFilteredOut);
		},

		onCreateRoot : function (_oEvent, bFilteredOut) {
			this.create("table", null, bFilteredOut);
		},

		onCreateRootInTreeTable : function (_oEvent, bFilteredOut) {
			this.create("treeTable", null, bFilteredOut);
		},

		onDelete : async function (oEvent) {
			try {
				await oEvent.getSource().getBindingContext().delete();
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			}
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
				if (oUriParameters.has("createInPlace")) {
					this._oAggregation.createInPlace = true;
				}
				const sTreeTable = oUriParameters.get("TreeTable");
				const sVisibleRowCount = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount")
					|| oUriParameters.get("visibleRowCount");
				const sThreshold = oUriParameters.get("threshold") || "0";
				const sFirstVisibleRow = oUriParameters.get("firstVisibleRow") || "0";

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
					if (sFirstVisibleRow) {
						oTable.setFirstVisibleRow(parseInt(sFirstVisibleRow));
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
					oTable.setModel(oTable.getModel(), "header")
						.setBindingContext(oRowsBinding.getHeaderContext(), "header");
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
						oTreeTable.setThreshold(parseInt(sThreshold));
					}
					if (sFirstVisibleRow) {
						oTreeTable.setFirstVisibleRow(parseInt(sFirstVisibleRow));
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
					oTreeTable.setModel(oTreeTable.getModel(), "treeHeader")
						.setBindingContext(oTreeRowsBinding.getHeaderContext(), "treeHeader");
				}

				this.initMessagePopover(sTreeTable === "N" ? "table" : "treeTable");
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

		onMove : function (oEvent, bInTreeTable, vNextSibling) {
			this._bInTreeTable = bInTreeTable;
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
				const sParentId = oEvent.getParameter("selectedItem").getBindingContext()
					.getProperty("ID");
				const oParent = this._oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("ID") === sParentId);
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

		onMoveDown : async function (oEvent) {
			var oNode;

			try {
				this.getView().setBusy(true);
				oNode = oEvent.getSource().getBindingContext();
				const oTable = oEvent.getSource().getParent().getParent().getParent();
				oNode.setSelected(true); // opt-in to update nextSibling's index

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

				this.scrollTo(oNode, oTable);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				oNode.setSelected(false);
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

				const [oParent, oSibling] = await Promise.all([
					oNode.requestParent(),
					oNode.requestSibling(-1)
				]);

				if (!oSibling) {
					if (oParent) {
						this.scrollTo(oParent, oTable);
					}
					MessageBox.alert("Cannot move up",
						{icon : MessageBox.Icon.INFORMATION, title : "Already first sibling"});
					return;
				}

				await oNode.move({nextSibling : oSibling, parent : oParent});

				// make sure moved node is visible
				this.scrollTo(oNode, oTable);
			} catch (oError) {
				MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			} finally {
				oNode.setSelected(false);
				this.getView().setBusy(false);
			}
		},

		onNameChanged : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			if (oContext.hasPendingChanges()) {
				oContext.requestSideEffects(["AGE", "Name"]);
			} // else: invalid value (has not reached model)
		},

		onRefresh : function (_oEvent, bKeepTreeState) {
			this.refresh("table", bKeepTreeState);
		},

		onRefreshTreeTable : function (_oEvent, bKeepTreeState) {
			this.refresh("treeTable", bKeepTreeState);
		},

		onShowSelected : function (_oEvent, sTableId = "table") {
			const oBinding = this.byId(sTableId).getBinding("rows");
			const aContexts = oBinding.getAllCurrentContexts();
			const oHeaderContext = oBinding.getHeaderContext();

			const bSelectAll = oHeaderContext.isSelected();
			const sText = (bSelectAll ? "All except " : "")
				+ aContexts.filter((oContext) => oContext.isSelected() !== bSelectAll)
					.map((oContext) => oContext.getProperty("Name"))
					.join(", ");

			MessageBox.information(sText, {title : "Selected Names"});
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
		},

		refresh(sId, bKeepTreeState) {
			const oBinding = this.byId(sId).getBinding("rows");
			if (bKeepTreeState) {
				oBinding.getHeaderContext().requestSideEffects([""]);
			} else {
				oBinding.refresh();
			}
		},

		scrollTo : function (oNode, oTable) {
			const iIndex = oNode.getIndex();
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
