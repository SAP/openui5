sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
], function (jQuery, MobileLibrary, Controller, Item, JSONModel, Uploader) {
	"use strict";

	var CustomUploader = Uploader.extend("sap.m.sample.UploadSet.CustomUploader", {
		metadata: {}
	});

	CustomUploader.prototype.uploadItem = function (oItem, aHeaders) {
		var sNewUploadUrl = "../../../../upload"; // This value may be result of a backend request eg.
		aHeaders.push(new Item({key: "SomePostKey", text: "SomePostText"}));
		this.setUploadUrl(sNewUploadUrl);

		Uploader.prototype.uploadItem.call(this, oItem, aHeaders);
	};

	CustomUploader.prototype.downloadItem = function (oItem, aHeaders, bAskForLocation) {
		var sNewDownloadUrl = oItem.getUrl(); // This value may be result of a backend request eg.
		aHeaders.push(new Item({key: "SomeGetKey", text: "SomeGetText"}));
		this.setDownloadUrl(sNewDownloadUrl);

		Uploader.prototype.downloadItem.call(this, oItem, aHeaders, bAskForLocation);
	};

	return Controller.extend("sap.m.sample.UploadSet.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSet") + "/items.json",
				oUploadSet = this.byId("UploadSet"),
				oCustomUploader = new CustomUploader();

			this.getView().setModel(new JSONModel(sPath));

			oUploadSet.setUploader(oCustomUploader);
			oUploadSet.registerUploaderEvents(oCustomUploader);
			oUploadSet.getList().setMode(MobileLibrary.ListMode.MultiSelect);
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