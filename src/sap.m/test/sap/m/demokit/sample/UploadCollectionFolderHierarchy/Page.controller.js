sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(jQuery, Controller, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadCollectionFolderHierarchy.Page", {
		onInit: function() {
			// set mock data
			this.oModel = new JSONModel(jQuery.sap.getModulePath("sap.m.sample.UploadCollectionFolderHierarchy", "/UploadCollectionData.json"));
			this.getView().setModel(this.oModel);

			this.oUploadCollection = this.byId("UploadCollection");
			this.oBreadcrumbs = this.byId("breadcrumbs");
			this.bindUploadCollectionItems("/items");
			this.oUploadCollection.addEventDelegate({
				onAfterRendering: function() {
					var iCount = this.oUploadCollection.getItems().length;
					this.oBreadcrumbs.setCurrentLocationText(this.getCurrentLocationText() + " (" + iCount + ")");
				}.bind(this)
			});
		},

		onUploadComplete: function(oEvent) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.oModel.getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItem;
			var sUploadedFile = oEvent.getParameter("files")[0].fileName;

			oItem = {
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": sUploadedFile,
				"mimeType": "",
				"thumbnailUrl": "",
				"url": ""
			};
			if (aItems.length === 0) {
				aItems.push(oItem);
			} else {
				// insert file after all folders
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].type !== "folder") {
						aItems.splice(i, 0, oItem);
						break;
					}
				}
			}
			this.oModel.setProperty(sCurrentPath + "/items", aItems);
			jQuery.sap.delayedCall(2000, this, function() {
				MessageToast.show("UploadComplete event triggered.");
			});
		},

		onFileDeleted: function(oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
			MessageToast.show("FileDeleted event triggered.");
		},

		onFolderPress: function(event) {
			var oContext = event.getSource().getBindingContext();

			var aSubItems = oContext && oContext.getProperty("items");
			if (aSubItems) {
				this.bindUploadCollectionItems(oContext.getPath("items"));
				// save the current folder name and path in model
				var sCurrentFolder = this.getCurrentLocationText();
				var aHistory = this.oModel.getProperty("/history");
				aHistory.push({
					name: sCurrentFolder,
					path: oContext.getPath()
				});
				this.oModel.setProperty("/history", aHistory);

				// update new current location folder text in Breadcrumb
				this.oBreadcrumbs.setCurrentLocationText(oContext.getProperty("fileName"));
			}
		},

		onFolderDeletePress: function(event) {
			var oItem = event.getSource();
			var sFolderName = oItem.getFileName();
			MessageBox.show("Are you sure you want to delete '" + sFolderName + "'?", {
				title: "Delete Folder",
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
					if (oAction === MessageBox.Action.OK) {
						this.deleteItemByPath(oItem.getBindingContext().sPath);
					}
				}.bind(this),
				dialogId: "messageBoxDeleteFolder"
			});
		},

		onBreadcrumbPress: function(event) {
			var oLink = event.getSource();
			var iIndex = this.oBreadcrumbs.indexOfLink(oLink);

			// update UploadCollectionItems
			var sPath = this.oModel.getProperty("/history")[iIndex].path;
			var sCurrentFolderPath = sPath.substring(0, sPath.lastIndexOf("/"));
			this.bindUploadCollectionItems(sCurrentFolderPath);

			// remove the sub folders
			var aHistory = this.oModel.getProperty("/history");
			aHistory.splice(iIndex);
			this.oModel.setProperty("/history", aHistory);

			// reset the current location folder
			this.oBreadcrumbs.setCurrentLocationText(oLink.getText());
		},

		bindUploadCollectionItems: function(path) {
			this.oUploadCollection.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory.bind(this)
			});
		},

		uploadCollectionItemFactory: function(id, context) {
			var oItem = new sap.m.UploadCollectionItem(id, {
				documentId: "{documentId}",
				fileName: "{fileName}",
				mimeType: "{mimeType}",
				thumbnailUrl: "{thumbnailUrl}",
				url: "{url}"
			});

			if (context.getProperty("type") === "folder") {
				oItem.attachPress(this.onFolderPress, this);
				oItem.attachDeletePress(this.onFolderDeletePress, this);
				oItem.setAriaLabelForPicture("Folder");
			}
			return oItem;
		},

		/**
		 * Deletes the item in the data model by using the binding path of the item
		 *
		 * @param {string} sItemPath The binding path of the item
		 */
		deleteItemByPath: function(sItemPath) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.oModel.getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItemData = this.oModel.getProperty(sItemPath);
			if (oItemData && aItems) {
				aItems.splice(aItems.indexOf(oItemData), 1);
				this.oModel.setProperty(sCurrentPath + "/items", aItems);
			}
		},

		/**
		 * Deletes the item in the data model by using the item document id
		 *
		 * @param {string} sItemToDeleteId The document id of the item
		 */
		deleteItemById: function(sItemToDeleteId) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.oModel.getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.oModel.setProperty(sCurrentPath + "/items", aItems);
		},

		getCurrentLocationText: function() {
			// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
			var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
			return sText;
		},

		getCurrentFolderPath: function() {
			var aHistory = this.oModel.getProperty("/history");
			// get the current folder path
			var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
			return sPath;
		}
	});
});
