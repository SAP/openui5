sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, UploadCollectionParameter, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.UploadCollection.Page", {

		onInit: function () {

			// set mock data
			var sPath = jQuery.sap.getModulePath("sap.m.sample.UploadCollection", "/uploadCollection.json")
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
				"selectedKey" : "None"
			};

			var oModelCB = new JSONModel();
			oModelCB.setData(aDataCB);

			var oSelect=sap.ui.getCore().byId(this.getView().getId() + "--tbSelect");
			oSelect.setModel(oModelCB);
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
			sap.m.MessageToast.show("Change event triggered.");
		},

		onFileDeleted: function(oEvent) {
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var sDocumentId = oEvent.getParameter("documentId");
			var bSetData = false;

			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems.splice(index, 1);
				};
			});
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			sap.m.MessageToast.show("FileDeleted event triggered.");
		},

		onFilenameLengthExceed : function(oEvent) {
			sap.m.MessageToast.show("FilenameLengthExceed event triggered.");
		},

		onFileRenamed: function(oEvent) {
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				};
			});
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			sap.m.MessageToast.show("FileRenamed event triggered.");
		},

		onFileSizeExceed : function(oEvent) {
			 sap.m.MessageToast.show("FileSizeExceed event triggered.");
		},

		onTypeMissmatch : function(oEvent) {
			 sap.m.MessageToast.show("TypeMissmatch event triggered.");
		},

		onUploadComplete: function(oEvent) {
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var oItem = {};
			var sUploadedFile = oEvent.getParameters().getParameter("fileName");
			// at the moment parameter fileName is not set in IE9
			if (!sUploadedFile) {
				var aUploadedFile = (oEvent.getParameters().getSource().getProperty("value")).split(/\" "/);
				sUploadedFile = aUploadedFile[0];
			}
			oItem = {
				"contributor" : "You",
				"documentId" : jQuery.now().toString(), // generate Id
				"fileName" : sUploadedFile,
				"fileSize" : 10, // TODO get file size
				"mimeType" : "",
				"thumbnailUrl" : "",
				"uploadedDate" : new Date(jQuery.now()).toLocaleDateString(),
				"url" : "myUrl"
			};
			aItems.unshift(oItem);
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			// delay the success message for to notice onChange message
			setTimeout(function() {
				sap.m.MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},

		onPress: function (oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " Pressed");
		},

		onSelectChange:  function(oEvent) {
			var oUploadCollection=sap.ui.getCore().byId(this.getView().getId() + "--UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
	});


	return PageController;

});
