sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader) {
	"use strict";

	var ListMode = MobileLibrary.ListMode;

	return Controller.extend("sap.m.sample.UploadSet.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSet/items.json"),
				oUploadSet = this.byId("UploadSet");

			this.getView().setModel(new JSONModel(sPath));
			oUploadSet.getList().setMode(ListMode.MultiSelect);

			// Modify "add file" button
			oUploadSet.getDefaultFileUploader().setButtonOnly(false);
			oUploadSet.getDefaultFileUploader().setTooltip("");
			oUploadSet.getDefaultFileUploader().setIconOnly(true);
			oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");
		},
		onUploadSelectedButton: function () {
			var oUploadSet = this.byId("UploadSet");

			oUploadSet.getItems().forEach(function (oItem) {
				if (oItem.getListItem().getSelected()) {
					oUploadSet.uploadItem(oItem);
				}
			});
		},
		onDownloadSelectedButton: function () {
			var oUploadSet = this.byId("UploadSet");

			oUploadSet.getItems().forEach(function (oItem) {
				if (oItem.getListItem().getSelected()) {
					oItem.download(true);
				}
			});
		}
	});
});