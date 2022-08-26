/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/SubmitMode"
], function (UriParameters, library, MessageBox, Controller, Sorter, JSONModel, SubmitMode) {
	"use strict";

	var sEmptyRowCount = UriParameters.fromQuery(window.location.search).get("emptyRows"),
		iEmptyRowCount = parseInt(sEmptyRowCount || "3"),
		LayoutType = library.LayoutType;

	return Controller.extend("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.Main", {
		createAndSetDraft : function (oContext) {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			oView.getModel()
				.bindContext("SampleService.draftEdit(...)", oContext,
					{$$inheritExpandSelect : true})
				.execute(undefined, false, false, true)
				.then(function (oReturnValueContext) {
					that.setPartsContext(oReturnValueContext);
				}).finally(function () {
					oView.setBusy(false);
				});
		},

		createInactiveRows : function (iCount) {
			var oBinding = this.getView().byId("parts").getBinding("rows"),
				i;

			function createEmptyRow() {
				var oContext = oBinding.create({}, false, true, /*bInactive*/true);

				oContext.created().catch(function (oError) {
					if (!oError.canceled) {
						throw oError; // unexpected error
					}
				});
			}

			for (i = 0; i < iCount; i += 1) {
				createEmptyRow();
			}
		},

		deleteInactiveRows : function () {
			this.getView().byId("parts").getBinding("rows").getAllCurrentContexts()
				.forEach(function (oContext) {
					if (oContext.isInactive()) {
						oContext.delete("$auto");
					}
			});
		},

		getNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort => ascending <-> descending
			if (bDescending) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		onActivate : function () {
			this.createInactiveRows(1);
		},

		onCancel : function () {
			return this.getView().getModel().resetChanges();
		},

		onDelete : function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				iPartNo = oContext.getProperty("ID");

			MessageBox.confirm(
				"Do you really want to delete part " + iPartNo + "?",
				function (sCode) {
					if (sCode === "OK") {
						oContext.delete("$auto");
					}
				},
				"Confirm Deletion"
			);
		},

		onExit : function () {
			this.deleteInactiveRows();
			this.oUIModel.destroy();
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			var oPartsBinding,
				oProductsBinding,
				oView = this.getView(),
				oModel = oView.getModel(),
				that = this;

			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
				sActivity : "",
				bAPI : oModel.getGroupProperty(oModel.getUpdateGroupId(), "submit")
					=== SubmitMode.API,
				sLayout : LayoutType.OneColumn,
				iMessages : 0,
				bSortPartsQuantity : true,
				sSortPartsQuantityIcon : ""
			});
			oView.setModel(this.oUIModel, "ui");
			oView.setModel(oModel, "headerContext");
			oProductsBinding = oView.byId("products").getBinding("items");
			oProductsBinding.attachDataRequested(this.showLoading, this);
			oProductsBinding.attachDataReceived(this.showNothing, this);
			oPartsBinding = oView.byId("parts").getBinding("rows");
			oPartsBinding.attachDataRequested(this.showLoading, this);
			oPartsBinding.attachDataReceived(this.showNothing, this);
			oPartsBinding.attachCreateActivate(this.onActivate, this);
			oPartsBinding.attachCreateSent(this.showSaving, this);
			oPartsBinding.attachCreateCompleted(this.showNothing, this);

			// attach an event handler to the data received event and create inactive rows inside
			oPartsBinding.attachDataReceived(function () {
				if (oPartsBinding.isFirstCreateAtEnd() === undefined) {
					that.createInactiveRows(iEmptyRowCount);
				}
			});
		},

		onRefresh : function () {
			this.getView().getModel().refresh();
		},

		onSave : function () {
			var oView = this.getView(),
				oModel = oView.getModel();

			oView.setBusy(true);

			return oModel.submitBatch(oModel.getUpdateGroupId()).finally(function () {
				oView.setBusy(false);
			});
		},

		onSelectProduct : function (oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oProduct,
				oProductContext;

			if (oItem) {
				oProductContext = oItem.getBindingContext();
				oProduct = oProductContext.getObject();
				if (oProduct.IsActiveEntity) {
					this.createAndSetDraft(oProductContext);
				} else {
					this.setPartsContext(oProductContext);
				}
			}
		},

		onSortByPartsQuantity : function () {
			var oBinding = this.byId("parts").getBinding("rows"),
				bDescending = this.oUIModel.getProperty("/bSortPartsQuantity"),
				oSortOrder;

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("quantity", oSortOrder.bDescending)
			);
			this.oUIModel.setProperty("/bSortPartsQuantity", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortPartsQuantityIcon", oSortOrder.sNewIcon);
		},

		setPartsContext : function (oContext) {
			this.getView().byId("parts").setBindingContext(oContext);
			this.byId("partsTitle").setBindingContext(
				this.getView().byId("parts").getBinding("rows").getHeaderContext(),
				"headerContext");
			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
		},

		showActivity : function (sActivity) {
			this.oUIModel.setProperty("/sActivity", sActivity);
		},

		showLoading : function () {
			this.showActivity("Loading");
		},

		showNothing : function () {
			this.showActivity("");
		},

		showSaving : function () {
			this.showActivity("Saving");
		}
	});
});
