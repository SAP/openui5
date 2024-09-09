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

			const oUploadSet = this.byId("UploadSet");
			oUploadSet.attachUploadCompleted(this.onUploadCompleted.bind(this));
		},
		handleSelectionChange: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			var oUploadSet = this.byId("UploadSet");
			if (oItem) {
				switch (oItem.getText()) {
					case "File Mode":
						oUploadSet.setDirectory(false);
						break;
					case "Directory Mode":
						oUploadSet.setDirectory(true);
						break;
					default:
						break;
				}
			}
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