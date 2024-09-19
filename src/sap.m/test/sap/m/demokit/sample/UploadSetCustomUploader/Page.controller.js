sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader",
	"sap/m/StandardListItem",
	"sap/m/MessageToast"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader, ListItem, MessageToast) {
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
		onUploadAborted: function (oEvent) {
			var oList = this.byId("progressList"),
				oItem = oEvent.getParameter("item");
			oList.insertItem(new ListItem({
				title: "Upload aborted: " + oItem.getFileName()
			}));
		},
		onFileRenamed: function(oEvent) {
			MessageToast.show("FileRenamed event triggered.");
		},
		onUploadCompleted: function(oEvent) {
			this.oItemToUpdate = null;
			// add item to the model
			var oItem = oEvent.getParameter("item");
			var oModel = this.getView().getModel();
			var aItems = oModel.getProperty("/items");
			var oItemData = this._getItemData(oItem);
			aItems.unshift(oItemData);
			oModel.setProperty("/items", aItems);
			oModel.refresh();
		},
		onAfterItemRemoved: function(oEvent) {
			// remove item from the model
			var oItem = oEvent.getParameter("item");
			var oModel = this.getView().getModel();
			var aItems = oModel.getProperty("/items");
			var oItemData = oItem?.getBindingContext()?.getObject();
			var iIndex = aItems.findIndex((item) => {
				return item.id == oItemData?.id;
			});
			if (iIndex > -1) {
				aItems.splice(iIndex, 1);
				oModel.setProperty("/items", aItems);
			}
		},
		_getItemData: function(oItem) {
			// generate a 6 digit random number as id
			const iId = Math.floor(Math.random() * 1000000);
			const oFileObject = oItem.getFileObject();
			return {
				id: iId,
				fileName: oItem?.getFileName(),
				uploaded: new Date(),
				uploadedBy: "John Doe",
				mediaType: oFileObject.type,
				// URL to the uploaded file from blob.
				url: oItem?.getUrl() ? oItem?.getUrl() : URL.createObjectURL(oFileObject),
				statuses: [
					{
						"title": "Uploaded By",
						"text": "Jane Burns",
						"active": true
					},
					{
						"title": "Uploaded On",
						"text": "Today",
						"active": false
					}
				]
			};
		}
	});
});