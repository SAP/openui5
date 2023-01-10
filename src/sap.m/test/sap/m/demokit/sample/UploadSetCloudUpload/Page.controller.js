sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader",
	"sap/m/sample/UploadSetCloudUpload/mockserver/mockServer"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader, MockServer) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetCloudUpload.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSet/items.json");

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
					enableDuplicateCheck:oUploadSet.getSameFilenameAllowed(),
					select: oUploadSet._onCloudPickerFileChange.bind(oUploadSet)
				});

				var oModel = new sap.ui.model.odata.v4.ODataModel({
				 serviceUrl: oCloudPickerInstance.getContent()[0].getModel().sServiceUrl,
				 synchronizationMode: "None",
				 earlyRequests: false
				 });

				oCloudPickerInstance.setModel(oModel);

				return oCloudPickerInstance;
			};
		}
	});
});