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
				"selectedKey" : "All"
			};

			var oModelCB = new JSONModel();
			oModelCB.setData(aDataCB);

			var oSelect = this.getView().byId("tbSelect");
			oSelect.setModel(oModelCB);
		},

		onBeforeRendering : function () {
			// Sets the text to the label
			this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
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
				return sValue
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

		onFileDeleted: function(oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
			MessageToast.show("FileDeleted event triggered.");
		},

		deleteItemById: function(sItemToDeleteId){
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				};
			});
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		deleteMultipleItems: function(aItemsToDelete){
			var oData = this.getView().byId("UploadCollection").getModel().getData();
			var nItemsToDelete = aItemsToDelete.length;
			var aItems = jQuery.extend(true, {}, oData).items;
			var i = 0;
			jQuery.each(aItems, function(index) {
				if (aItems[index]) {
					for (i = 0; i < nItemsToDelete; i++){
						if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()){
							aItems.splice(index, 1);
						}
					} 
				};
			});
			this.getView().byId("UploadCollection").getModel().setData({
				"items" : aItems
			});
			this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		onFilenameLengthExceed : function(oEvent) {
			MessageToast.show("FilenameLengthExceed event triggered.");
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
			MessageToast.show("FileRenamed event triggered.");
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

			if (this.getView().byId("modeSwitch").getState()){
				oItem.visibleEdit = false;
				oItem.visibleDelete = false;
			}else{
				oItem.visibleEdit = true;
				oItem.visibleDelete = true;
			}
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

		onCountPress: function(oEvent) {
			var aSelectedItems = this.getView().byId("UploadCollection").getSelectedItems();
			var sText = aSelectedItems.length + " items selected";
			MessageToast.show(sText);
		},

		onSelectAllPress: function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");

			if (!oEvent.getSource().getPressed()){
				this.deselectAllItems(oUploadCollection);
				oEvent.getSource().setPressed(false);
				oEvent.getSource().setText("Select all");
			} else {
				this.deselectAllItems(oUploadCollection);
				oUploadCollection.selectAll();
				oEvent.getSource().setPressed(true);
				oEvent.getSource().setText("Deselect all");
			}
		},

		deselectAllItems: function(oUploadCollection){
			var aItems = oUploadCollection.getItems();
			for (var i = 0; i < aItems.length; i++){
				oUploadCollection.setSelectedItem(aItems[i], false);
			}
		},

		getAttachmentTitleText: function(){
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		onSwitchUploaderChange: function(oEvent){
			var oUploadCollection = this.getView().byId("UploadCollection");
			var bState = oEvent.getParameter("state");
			if (bState){
				oUploadCollection.setUploadEnabled(true);
			} else {
				oUploadCollection.setUploadEnabled(false);
			}
		},

		onSwitchModeChange: function(oEvent){
			// Sets to MultiSelect
			if (this.getView().byId("modeSwitch").getState()){
				this.setVisibleEditAndDelete(false);
				this.enableToolbarItems(true);
				this.getView().byId("UploadCollection").setMode("MultiSelect");
			}else{
				// Sets to SingleSelectMaster
				this.setVisibleEditAndDelete(true);
				this.enableToolbarItems(false);
				this.getView().byId("UploadCollection").setMode("SingleSelectMaster");
			}
		},

		setVisibleEditAndDelete: function(status){
			var aItems = this.getView().byId("UploadCollection").getItems();
			for (var i = 0; i < aItems.length; i++){
				aItems[i].setVisibleEdit(status);
				aItems[i].setVisibleDelete(status);
			}
		},

		enableToolbarItems: function(status){
			this.getView().byId("countButton").setEnabled(status);
			this.getView().byId("selectAllButton").setEnabled(status);
			this.getView().byId("deleteSelectedButton").setEnabled(status);
		},

		onDeleteSelectedItems: function(){
			var aSelectedItems = this.getView().byId("UploadCollection").getSelectedItems();
			this.deleteMultipleItems(aSelectedItems);
			if (this.getView().byId("UploadCollection").getSelectedItems().length < 1){
				this.getView().byId("selectAllButton").setPressed(false);
				this.getView().byId("selectAllButton").setText("Select all");
			}
			MessageToast.show("Delete selected items button press.");
		},

		onSearch: function(oEvent){
			MessageToast.show("Search feature isn't available in this sample");
		}
	});

	return PageController;

});
