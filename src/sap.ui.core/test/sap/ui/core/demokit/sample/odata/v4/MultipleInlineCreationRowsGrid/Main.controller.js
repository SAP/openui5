/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataUtils"
], function (Log, UriParameters, library, MessageBox, Controller, JSONModel, ODataUtils) {
	"use strict";

	var sEmptyRowCount = UriParameters.fromQuery(window.location.search).get("emptyRows"),
		iEmptyRowCount = parseInt(sEmptyRowCount || "3"),
		LayoutType = library.LayoutType;

	return Controller.extend("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.Main", {

		createEmptyRows : function (iCount) {
			var oBinding = this.getView().byId("parts").getBinding("rows"),
				i;

			function createEmptyRow() {
				var oContext = oBinding.create({}, true, true, /*bInactive*/true);

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

		onActivate : function () {
			this.createEmptyRows(1);
		},

		onDelete : function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				iPartNo = oContext.getProperty("ID"),
				oView = this.getView();

			MessageBox.confirm(
				"Do you really want to delete part " + iPartNo + "?",
				function (sCode) {
					if (sCode === "OK") {
						oView.setBusy(true);
						oContext.delete().finally(function () {
							oView.setBusy(false);
						});
					}
				},
				"Confirm Deletion"
			);
		},

		onExit : function () {
			this.resetChanges();
			this.oUIModel.destroy();
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			var oPartsBinding,
				oProductsBinding,
				oView = this.getView();

			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
				sActivity : "",
				sLayout : LayoutType.OneColumn,
				iMessages : 0
			});
			oView.setModel(this.oUIModel, "ui");
			oView.setModel(oView.getModel(), "headerContext");
			oProductsBinding = oView.byId("products").getBinding("items");
			oProductsBinding.attachDataRequested(this.showLoading, this);
			oProductsBinding.attachDataReceived(this.showNothing, this);
			oPartsBinding = oView.byId("parts").getBinding("rows");
			oPartsBinding.attachDataRequested(this.showLoading, this);
			oPartsBinding.attachDataReceived(this.showNothing, this);
			oPartsBinding.attachCreateActivate(this.onActivate, this);
			oPartsBinding.attachCreateSent(this.showSaving, this);
			oPartsBinding.attachCreateCompleted(this.showNothing, this);
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

		resetChanges : function () {
			// TODO this is needed as long as the creation rows still are transient and thus pending
			//  changes; as soon as we introduce the initial state these creation rows are no
			//  pending changes anymore
			this.getView().byId("products").getBinding("items").resetChanges();
		},

		setPartsContext : function (oContext) {
			this.resetChanges();
			this.getView().byId("parts").setBindingContext(oContext);
			this.byId("partCount").setBindingContext(
				this.byId("parts").getBinding("rows").getHeaderContext(),
				"headerContext");
			this.createEmptyRows(iEmptyRowCount);
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
