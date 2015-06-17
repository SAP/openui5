sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, UploadCollectionParameter, Controller, JSONModel) {
	"use strict";


	var PageController = Controller.extend("sap.m.sample.UploadCollectionForPendingUpload.Page", {

		onInit: function () {
			this.uploadedContent = new sap.m.List();
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name : "x-csrf-token",
				value : "securityTokenFromModel"
			});
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name : "slug",
				value : oEvent.getParameter("files")[0].name
			});

			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("Event change triggered");
		},

		onFileDeleted: function(oEvent) {
			MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed : function(oEvent) {
			MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed : function(oEvent) {
			MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch : function(oEvent) {
			MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload : function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			var oTextArea = this.getView().byId("TextArea");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = "";

			oUploadCollection.upload();

			uploadInfo = cFiles + " file(s)";
			if (oTextArea.getValue().length === 0) {
				uploadInfo = uploadInfo + " without notes";
			}
			else {
				uploadInfo = uploadInfo + " with notes";
		    }

			MessageToast.show("Method Upload is called (" + uploadInfo + ")");

			this.uploadedContent.insertItem(new sap.m.StandardListItem( {
				title: uploadInfo,
				description: new Date().toLocaleString()
			}, 0));

			oTextArea.setValue("");

			var oDialog = new sap.m.Dialog({
		        title: 'Uploaded Content',
		        content: this.uploadedContent,

		        beginButton: new sap.m.Button({
		          text: 'Close',
		          press: function () {
		            oDialog.close();
		          }
		        })
		    });

			oDialog.open();
		},

		onUploadComplete: function(oEvent) {
			var oPage = this.getView().byId("Page");
			var oTextArea = this.getView().byId("TextArea");
			var oButton = this.getView().byId("Button");

			// destroy old UploadCollection instance and create a new one
			var oUploadCollection = this.getView().byId("UploadCollection");

			oPage.removeContent(oUploadCollection);
			oUploadCollection.destroy();

			oUploadCollection = new sap.m.UploadCollection( {
				id: this.getView().createId("UploadCollection"),
				maximumFilenameLength: 55,
				maximumFileSize: 10,
				multiple: true,
				sameFilenameAllowed: true,
				instantUpload: false,
				showSeparators: "All",
				change: [this.getView().getController().onChange, this],
				fileDeleted: [this.getView().getController().onFileDeleted, this],
				filenameLengthExceed: [this.getView().getController().onFilenameLengthExceed, this],
				fileSizeExceed: [this.getView().getController().onFileSizeExceed, this],
				typeMissmatch: [this.getView().getController().onTypeMissmatch, this],
				uploadComplete: [this.getView().getController().onUploadComplete, this]	
			});

			oPage.insertContent(oUploadCollection, 3);

			// delay the success message for to notice onChange message
			setTimeout(function() {
				MessageToast.show("Event uploadComplete triggered")
			}, 4000);
		},

		onSelectChange: function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
	});

	return PageController;

});
