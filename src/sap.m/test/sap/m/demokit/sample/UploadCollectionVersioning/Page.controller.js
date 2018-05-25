sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/FileSizeFormat"
], function(jQuery, Controller, MessageToast, UploadCollectionParameter, JSONModel, FileSizeFormat) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadCollectionVersioning.Page", {
		onInit: function() {
			var sPath;

			// set mock data
			sPath = sap.ui.require.toUrl("sap/m/sample/UploadCollectionVersioning") + "/uploadCollection.json";
			this.getView().setModel(new JSONModel(sPath));

			// Sets the text to the label
			this.byId("UploadCollection").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});

			// Flag to track if the upload of the new version was triggered by the Upload a new version button.
			this.bIsUploadVersion = false;
		},

		formatAttribute: function(sValue, sType) {
			if (sType === "size") {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

		},

		onFileSizeExceed: function(oEvent) {
			MessageToast.show("FileSizeExceed event triggered.");
		},

		onTypeMissmatch: function(oEvent) {
			MessageToast.show("TypeMissmatch event triggered.");
		},

		onUploadComplete: function(oEvent) {
			// If the upload is triggered by a new version, this function updates the metadata of the old file and deletes the progress indicator once the upload was finished.
			if (this.bIsUploadVersion) {
				this.updateFile(oEvent.getParameters());
			} else {
				var oData = this.byId("UploadCollection").getModel().getData();
				var aItems = jQuery.extend(true, {}, oData).items;
				var oItem = {};
				var sUploadedFile = oEvent.getParameter("files")[0].fileName;
				// at the moment parameter fileName is not set in IE9
				if (!sUploadedFile) {
					var aUploadedFile = (oEvent.getParameters().getSource().getProperty("value")).split(/\" "/);
					sUploadedFile = aUploadedFile[0];
				}
				oItem = {
					"documentId": jQuery.now().toString(), // generate Id,
					"fileName": sUploadedFile,
					"mimeType": "",
					"thumbnailUrl": "",
					"url": "",
					"attributes": [
						{
							"title": "Uploaded By",
							"text": "You"
						},
						{
							"title": "Uploaded On",
							"text": new Date(jQuery.now()).toLocaleDateString()
						},
						{
							"title": "File Size",
							"text": "505000"
						},
						{
							"title": "Version",
							"text": "1"
						}
					]
				};
				aItems.unshift(oItem);
				this.byId("UploadCollection").getModel().setData({
					"items": aItems
				});
				// Sets the text to the label
				this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
			}

			// delay the success message for to notice onChange message
			setTimeout(function() {
				MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("BeforeUploadStarts event triggered.");
		},

		getAttachmentTitleText: function() {
			var aItems = this.byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		onDownloadItem: function() {
			var oUploadCollection = this.byId("UploadCollection");
			var aSelectedItems = oUploadCollection.getSelectedItems();
			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					oUploadCollection.downloadItem(aSelectedItems[i], true);
				}
			} else {
				MessageToast.show("Select an item to download");
			}
		},

		onVersion: function() {
			var oUploadCollection = this.byId("UploadCollection");
			this.bIsUploadVersion = true;
			this.oItemToUpdate = oUploadCollection.getSelectedItem();
			oUploadCollection.openFileDialog(this.oItemToUpdate);
		},

		onSelectionChange: function() {
			var oUploadCollection = this.byId("UploadCollection");
			// If there's any item selected, sets download button enabled
			if (oUploadCollection.getSelectedItems().length > 0) {
				this.byId("downloadButton").setEnabled(true);
				if (oUploadCollection.getSelectedItems().length === 1) {
					this.byId("versionButton").setEnabled(true);
				} else {
					this.byId("versionButton").setEnabled(false);
				}
			} else {
				this.byId("downloadButton").setEnabled(false);
				this.byId("versionButton").setEnabled(false);
			}
		},

		updateFile: function() {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			// Adds the new metadata to the file which was updated.
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].documentId === this.oItemToUpdate.getDocumentId()) {
					// Uploaded by
					aItems[i].attributes[0].text = "You";
					// Uploaded on
					aItems[i].attributes[1].text = new Date(jQuery.now()).toLocaleDateString();
					// Version
					var iVersion = parseInt(aItems[i].attributes[3].text, 10);
					iVersion++;
					aItems[i].attributes[3].text = iVersion;
				}
			}
			// Updates the model.
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			// Sets the flag back to false.
			this.bIsUploadVersion = false;
			this.oItemToUpdate = null;
		}
	});
});