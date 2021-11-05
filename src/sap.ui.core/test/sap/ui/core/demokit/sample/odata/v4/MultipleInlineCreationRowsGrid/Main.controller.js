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

				// TODO react on the "unparked" event once it has been implemented
				oContext.created().then(createEmptyRow, function (oError) {
					if (!oError.canceled) {
						throw oError; // unexpected internal error
					}
				});
			}

			for (i = 0; i < iCount; i += 1) {
				createEmptyRow();
			}
		},

		onCancel : function () {
			this.getView().getModel().resetChanges();
			this.createEmptyRows(iEmptyRowCount);
		},

		onDelete : function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				iPartNo = oContext.getProperty("ID");

			if (iPartNo !== null) { // TODO oContext.isInitial()?
				MessageBox.confirm(
					"Do you really want to delete part " + iPartNo + "?",
					function (sCode) {
						if (sCode === "OK") {
							oContext.delete("$auto");
						}
					},
					"Delete Row"
				);
			}
		},

		onExit : function () {
			this.oUIModel.destroy();
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
				sLayout : LayoutType.OneColumn,
				iMessages : 0
			});
			this.getView().setModel(this.oUIModel, "ui");
		},

		onSave : function () {
			var oView = this.getView();

			oView.setBusy(true);
			return oView.getModel().submitBatch("UpdateGroup").finally(function () {
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

		createAndSetDraft : function (oContext) {
			var that = this;

			this.getView().getModel()
				.bindContext("SampleService.draftEdit(...)", oContext,
					{$$inheritExpandSelect : true})
				.execute(undefined, false, false, true)
				.then(function (oReturnValueContext) {
					that.setPartsContext(oReturnValueContext);
				});
		},

		setPartsContext : function (oContext) {
			var oView = this.getView();

			// TODO this is needed as long as the creation rows still are transient and thus pending
			//  changes; as soon as we introduce the initial state these creation rows are no
			//  pending changes anymore
			oView.byId("orders").getBinding("items").resetChanges();
			oView.byId("parts").setBindingContext(oContext);
			this.createEmptyRows(iEmptyRowCount);
			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
		}
	});
});
