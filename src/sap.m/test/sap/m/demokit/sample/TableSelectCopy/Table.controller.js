sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/strings/formatMessage"
], function(Controller, JSONModel, formatMessage) {
	"use strict";

	const TableController = Controller.extend("sap.m.sample.TableSelectCopy.Table", {
		onInit: function () {
			// set explored app's demo model on this sample
			this.oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(this.oProductsModel);

			this.oCopyProvider = this.byId("copyProvider");
			this.byId("toolbar").addContent(this.oCopyProvider.getCopyButton());
		},

		onExit: function() {
			this.oProductsModel.destroy();
		},

		onVisibleChange: function(oEvent) {
			this.oCopyProvider.setVisible(oEvent.getParameter("selected"));
		},

		onEnabledChange: function(oEvent) {
			this.oCopyProvider.setEnabled(oEvent.getParameter("selected"));
		},

		onSparseChange: function(oEvent) {
			this.oCopyProvider.setCopySparse(oEvent.getParameter("selected"));
		},

		extractData: function(oRowContext, oColumn, bIncludeHtmlMimeType) {
			const aCellData = oColumn.data("bindings").split(",").map((sPath) => oRowContext.getProperty(sPath));
			if (!bIncludeHtmlMimeType) {
				return aCellData;
			}

			const sFormattedCellData = formatMessage(oColumn.data("template") || "{0}", aCellData);
			return {
				text: aCellData,
				html: sFormattedCellData
			};
		}
	});

	return TableController;

});