sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, MessageToast, UploadCollectionParameter, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.UploadCollectionForPendingUpload.Page", {

		onChange : function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name : "x-csrf-token",
				value : "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			MessageToast.show("Event change triggered");
		},

		onFileDeleted : function(oEvent) {
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
			} else {
				uploadInfo = uploadInfo + " with notes";
			}

			MessageToast.show("Method Upload is called (" + uploadInfo + ")");
			sap.m.MessageBox.information("Uploaded " + uploadInfo);
			oTextArea.setValue("");
		},

		onBeforeUploadStarts : function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name : "slug",
				value : oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function() {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete : function(oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function() {
				var oUploadCollection = this.getView().byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange : function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
	});

	return PageController;
});