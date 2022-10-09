sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetCloudUpload.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSet/items.json");

			this.getView().setModel(new JSONModel(sPath));
		}
	});
});