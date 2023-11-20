sap.ui.define([
	"sap/m/library",
	"sap/m/upload/Uploader",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"./mockserver/mockServer",
	"require",
	"sap/m/ObjectStatus"
], function (MobileLibrary, Uploader, Controller, Item, JSONModel, ODataModel, MockServer, require,ObjectStatus) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetCloudUpload.Page", {
		onInit: function () {
			var sPath = require.toUrl("./items.json");

			this.getView().setModel(new JSONModel(sPath));

			var oMockServer = new MockServer();
            oMockServer.init();

			this.overrideCloudFilePickerInstanceToMock();
		},

		// Overriding cloudpicker instance only for mock server to set earlyrequest to false do not override for other implementations.
		overrideCloudFilePickerInstanceToMock: function() {
			var oUploadSet = this.byId("UploadSet");
			oUploadSet._getCloudFilePickerInstance = function() {
				var oCloudPickerInstance = new oUploadSet._cloudFilePickerControl({
					serviceUrl: oUploadSet.getCloudFilePickerServiceUrl(),
					confirmButtonText: oUploadSet._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
					title: oUploadSet._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
					fileNameMandatory: true,
					filePickerType: "Upload",
					enableDuplicateCheck:oUploadSet.getSameFilenameAllowed(),
					select: oUploadSet._onCloudPickerFileChange.bind(oUploadSet)
				});

				var oModel = new ODataModel({
				 serviceUrl: oCloudPickerInstance.getContent()[0].getModel().sServiceUrl,
				 synchronizationMode: "None",
				 earlyRequests: false
				 });

				oCloudPickerInstance.setModel(oModel);

				return oCloudPickerInstance;
			};
		},
		beforeUpload: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem.getUploadType() === "Cloud") {
				oItem.addMarkerAsStatus(
					new ObjectStatus({ text: "Managed By Google", icon:"sap-icon://share-2",state:"Indication07"})
				);
			}
		}
	});
});