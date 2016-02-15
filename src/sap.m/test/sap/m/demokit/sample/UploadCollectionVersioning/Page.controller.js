sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, UploadCollectionParameter, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.UploadCollectionVersioning.Page", {

		onInit: function () {
			// set mock data
			var sPath = jQuery.sap.getModulePath("sap.m.sample.UploadCollectionVersioning", "/uploadCollection.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);

			var aDataCB = {
				"items" : [{
					"key" : "All",
					"text" : "sap.m.ListSeparators.All"
				}, {
					"key" : "None",
					"text" : "sap.m.ListSeparators.None"
				}],
				"selectedKey" : "All"
			};

			var oModelCB = new JSONModel();
			oModelCB.setData(aDataCB);

			var oSelect = this.getView().byId("tbSelect");
			oSelect.setModel(oModelCB);

			// Sets the text to the label
			this.getView().byId("UploadCollection").addEventDelegate({
				onBeforeRendering : function () {
					this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText())
				}.bind(this)
			});
		},

		formatAttribute : function (sValue) {
			jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
			if (jQuery.isNumeric(sValue)) {
				return sap.ui.core.format.FileSizeFormat.getInstance({
					binaryFilesize : false,
					maxFractionDigits : 1,
					maxIntegerDigits : 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name : "x-csrf-token",
				value : "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileSizeExceed : function(oEvent) {
			MessageToast.show("FileSizeExceed event triggered.");
		},

		onTypeMissmatch : function(oEvent) {
			MessageToast.show("TypeMissmatch event triggered.");
		},

		onUploadComplete: function(oEvent) {
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var oItem = {};
			var sUploadedFile = oEvent.getParameter("files")[0].fileName;
			// at the moment parameter fileName is not set in IE9
			if (!sUploadedFile) {
				var aUploadedFile = (oEvent.getParameters().getSource().getProperty("value")).split(/\" "/);
				sUploadedFile = aUploadedFile[0];
			}
			oItem = {
				"documentId" : jQuery.now().toString(), // generate Id,
				"fileName" : sUploadedFile,
				"mimeType" : "",
				"thumbnailUrl" : "",
				"url" : "",
				"attributes":[
					{
						"title" : "Uploaded By",
						"text" : "You"
					},
					{
						"title" : "Uploaded On",
						"text" : new Date(jQuery.now()).toLocaleDateString()
					},
					{
						"title" : "File Size",
						"text" : "505000"
					}
				]
			};
			aItems.unshift(oItem);
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			// Sets the text to the label
			this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
			// delay the success message for to notice onChange message
			setTimeout(function() {
				MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},

		onSelectChange:  function(oEvent) {
			var oUploadCollection= this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name : "slug",
				value : oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("BeforeUploadStarts event triggered.");
		},

		onUploadTerminated: function(oEvent) {
			// get parameter file name
			var sFileName = oEvent.getParameter("fileName");
			// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
		},

		getAttachmentTitleText: function(){
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		onDownloadItem: function(oEvent){
			var oUploadCollection = this.getView().byId("UploadCollection");
			var aSelectedItems = oUploadCollection.getSelectedItems();
			if (aSelectedItems){
				for (var i = 0; i < aSelectedItems.length; i++){
					oUploadCollection.downloadItem(aSelectedItems[i], true);
				}
			} else {
				MessageToast.show("Select an item to download");
			}
		},

		onSelectionChange: function(oEvent){
			var oUploadCollection = this.getView().byId("UploadCollection");
			// If there's any item selected, sets download button enabled
			if (oUploadCollection.getSelectedItems().length > 0) {
				this.getView().byId("downloadButton").setEnabled(true);
			} else {
				this.getView().byId("downloadButton").setEnabled(false);
			}
		}
	});

	return PageController;

});