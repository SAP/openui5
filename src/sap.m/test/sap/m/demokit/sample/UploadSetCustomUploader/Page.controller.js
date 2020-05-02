sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader",
	"sap/m/StandardListItem"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader, ListItem) {
	"use strict";

	var ListMode = MobileLibrary.ListMode;

	var CustomUploader = Uploader.extend("sap.m.sample.UploadSetCustomUploader.CustomUploader", {
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
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSetCustomUploader/items.json"),
				oUploadSet = this.byId("UploadSet"),
				oCustomUploader = new CustomUploader();

			this.getView().setModel(new JSONModel(sPath));

			oUploadSet.setUploader(oCustomUploader);
			oUploadSet.registerUploaderEvents(oCustomUploader);

			// Attach separate set of event handlers to demonstrate custom progress monitoring
			oCustomUploader.attachUploadStarted(this.onUploadStarted.bind(this));
			oCustomUploader.attachUploadProgressed(this.onUploadProgressed.bind(this));
			oCustomUploader.attachUploadCompleted(this.onUploadCompleted.bind(this));
			oCustomUploader.attachUploadAborted(this.onUploadAborted.bind(this));

			oUploadSet.getList().setMode(ListMode.MultiSelect);
		},
		onUploadStarted: function (oEvent) {
			var oList = this.byId("progressList"),
				oItem = oEvent.getParameter("item");
			oList.insertItem(new ListItem({
				title: "Upload started: " + oItem.getFileName()
			}));
		},
		onUploadProgressed: function (oEvent) {
			var oList = this.byId("progressList"),
				oItem = oEvent.getParameter("item");
			oList.insertItem(new ListItem({
				title: "Upload progressed: " + oItem.getFileName()
			}));
		},
		onUploadCompleted: function (oEvent) {
			var oList = this.byId("progressList"),
				oItem = oEvent.getParameter("item");
			oList.insertItem(new ListItem({
				title: "Upload completed: " + oItem.getFileName()
			}));
		},
		onUploadAborted: function (oEvent) {
			var oList = this.byId("progressList"),
				oItem = oEvent.getParameter("item");
			oList.insertItem(new ListItem({
				title: "Upload aborted: " + oItem.getFileName()
			}));
		}
	});
});