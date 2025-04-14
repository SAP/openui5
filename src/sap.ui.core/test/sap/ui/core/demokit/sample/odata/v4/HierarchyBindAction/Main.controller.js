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
		async create(oParentContext, bFilteredOut) {
			try {
				const oContext = this.byId("table").getBinding("rows").create({
					"@$ui5.node.parent" : oParentContext,
					Description : bFilteredOut ? "Out" : ""
				}, /*bSkipRefresh*/true);
				await oContext.created();
				this.scrollTo(oContext);
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onChangeHierarchy(oEvent) {
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

		onCollapseAll(oEvent) {
			try {
				oEvent.getSource().getBindingContext().collapse(true);
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onCreate(oEvent, bFilteredOut) {
			this.create(oEvent.getSource().getBindingContext(), bFilteredOut);
		},

		onCreateRoot(_oEvent, bFilteredOut) {
			this.create(null, bFilteredOut);
		},

		async onDelete(oEvent) {
			try {
				await oEvent.getSource().getBindingContext().delete();
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onDescriptionChanged(oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			if (oContext.hasPendingChanges()) {
				oContext.requestSideEffects(["SiblingOrder"]);
			} // else: invalid value (has not reached model)
		},

		async onExpandAll(oEvent) {
			try {
				await oEvent.getSource().getBindingContext().expand(true);
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onInit() {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				var oTreeTable = this.byId("table"),
					oUriParameters = new URLSearchParams(window.location.search);

				if (oUriParameters.get("clearSelectionOnFilter") === "false") {
					const oBindingInfo = this.byId("table").getBindingInfo("rows");
					delete oBindingInfo.parameters.$$clearSelectionOnFilter;
					this.byId("table").bindRows(oBindingInfo);
				}
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

		async onMakeRoot(oEvent, bLastSibling, bCopy) {
			try {
				this.getView().setBusy(true);
				await oEvent.getSource().getBindingContext().move({
					copy : bCopy,
					nextSibling : bLastSibling ? null : undefined,
					parent : null
				});
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				this.getView().setBusy(false);
			}
		},

		onMove(oEvent, vNextSibling, bCopy) {
			this._oNode = oEvent.getSource().getBindingContext();
			this._vNextSibling = vNextSibling === "" ? undefined : vNextSibling;
			this._bCopy = bCopy;
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

		async onMoveConfirm(oEvent) {
			try {
				this.getView().setBusy(true);
				const sParentId = oEvent.getParameter("selectedItem").getTitle();
				const oParent = this._oNode.getBinding().getAllCurrentContexts()
					.find((oNode) => oNode.getProperty("Id") === sParentId);
				if (!oParent) {
					throw new Error(`Parent ${sParentId} not yet loaded`);
				}

				let iCopyIndex;
				if (this._vNextSibling === "?") {
					await this._oNode.move({
						nextSibling : oParent,
						parent : oParent.getParent()
					});
				} else {
					iCopyIndex = await this._oNode.move({
						copy : this._bCopy,
						nextSibling : this._vNextSibling,
						parent : oParent
					});

					if (this._bCopy) {
						MessageBox.information("Index: " + iCopyIndex,
							{title : "New Node Created"});
					}
				}
				this.byId("table").setFirstVisibleRow(iCopyIndex ?? this._oNode.getIndex());
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				this.getView().setBusy(false);
			}
		},

		async onMoveDown(oEvent) {
			var oNode;

			try {
				this.getView().setBusy(true);
				oNode = oEvent.getSource().getBindingContext();

				const [oParent, oSibling] = await Promise.all([
					oNode.requestParent(),
					oNode.requestSibling(+1)
				]);

				if (oNode.created()) { // out-of-place, move it to become the 1st child/root
					await oNode.move({nextSibling : oSibling, parent : oParent});
				} else {
					if (!oSibling) {
						MessageBox.information("Cannot move down",
							{title : "Already last sibling"});
						return;
					}

					oNode.setKeepAlive(true); // opt-in to update nextSibling's index
					await oSibling.move({nextSibling : oNode, parent : oParent});
				}

				this.scrollTo(oNode);
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oNode.setKeepAlive(false);
				this.getView().setBusy(false);
			}
		},

		async onMoveUp(oEvent) {
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
					MessageBox.information("Cannot move up", {title : "Already first sibling"});
					return;
				}

				await oNode.move({nextSibling : oSibling, parent : oParent});

				// make sure moved node is visible
				this.scrollTo(oNode);
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oNode.setSelected(false);
				this.getView().setBusy(false);
			}
		},

		onRefresh(_oEvent, bKeepTreeState) {
			var oTable = this.byId("table");

			if (bKeepTreeState) {
				oTable.getBinding("rows").getHeaderContext().requestSideEffects([""]);
			} else {
				oTable.getBindingContext().refresh();
			}
		},

		/**
		 * Filters the list of potential new parents.
		 *
		 * @param {sap.ui.base.Event} oEvent The event object
		 */
		onSearch(oEvent) {
			const sFilterValue = oEvent.getParameter("value");
			const aFilters = sFilterValue
				? [new Filter("Id", FilterOperator.Contains, oEvent.getParameter("value"))]
				: [];
			oEvent.getSource().getBinding("items").filter(aFilters);
		},

		/**
		 * Shows a message box with the selected items.
		 */
		onShowSelection() {
			const aSelected = this.byId("table").getBinding("rows").getAllCurrentContexts()
				.filter((oContext) => oContext.isSelected());
			MessageBox.information((aSelected.join("\n") || "none"), {title : "Selected Items"});
		},

		scrollTo(oNode) {
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
