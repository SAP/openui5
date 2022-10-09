sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSet.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSet/items.json");

			this.getView().setModel(new JSONModel(sPath));
		},
		handleSelectionChange: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			var oUploadSet = this.byId("UploadSet");
			if (oItem) {
				switch (oItem.getText()) {
					case "File Uploads":
						oUploadSet.setDirectory(false);
						break;
					case "Directory Uploads":
						oUploadSet.setDirectory(true);
						break;
					default:
						break;
				}
			}
		}
	});
});