sap.ui.define(
	[
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/core/util/MockServer"
	], function (ODataModel, MockServer) {
	"use strict";

	/**
	 * Initializes the mock server when the app is called with the URL parameter "responderOn=true".
	 * The local mock data in the model/data/<ModelName> folder is returned instead of the real data for testing.
	 *
	 * @private
	 */
	function initMockServer(oModelConfig) {
		var sServiceUrl = oModelConfig.serviceUrl,
			sFolderName = oModelConfig.dataFolderName,
			oUriParameters = jQuery.sap.getUriParameters();

		if (oUriParameters.get("responderOn") !== "true") {
			return;
		}

		var oMockServer = new MockServer({
			rootUri : sServiceUrl
		});

		// configure an auto delay of 1s
		MockServer.config({
			autoRespond: true,
			autoRespondAfter : (oUriParameters.get("responderDelay") || 1000)
		});

		var sModulePath = "sap/ui/demo/mdtemplate/model/data/" + sFolderName + "/";

		// load local northwind mock data
		oMockServer.simulate(jQuery.sap.getModulePath(sModulePath + "metadata", ".xml"), jQuery.sap.getModulePath(sModulePath));
		oMockServer.start();

		sap.m.MessageToast.show("Running in demo mode with mock data.", {
			duration: 2000
		});
	}

	return ODataModel.extend("sap.ui.demo.mdtemplate.model.MockableModel", {
		/**
		 * Creates an OData v2 model for the given service url or initializes the mock server when responderOn=true is added as an Url parameter
		 *
		 * @param oModelConfig {object} Configuration of the model containing the mcokdataFolder and the Source of the actual service
		 * @param oModelConfig.serviceUrl {string} The relative or absolute url to an Odata Service
		 * @param oModelConfig.dataFolderName {string} The name of the folder where the model data is put in. It should be created under model/data/<folderName>
		 * @class
		 * @public
		 * @alias sap.ui.demo.mdtemplate.model.MockableModel
		 */
		constructor: function (oModelConfig) {
			initMockServer(oModelConfig);
			ODataModel.call(this, oModelConfig.serviceUrl, /* JSON = */ true);
		},

		/**
		 * Will wait until there is data in the model for the elementbinding given.
		 *
		 * @param oElementBinding the element binding that should contain the data
		 * @returns {Promise} Gets resolved if the data is already on the client or when the data has been requested from the server. Gets rejected when there was no data on the server.
		 */
		whenThereIsDataForTheElementBinding : function (oElementBinding) {
			var sPath = oElementBinding.getPath(),
				oModel = oElementBinding.getModel();

			return new Promise(function (fnSuccess, fnReject) {
				//Check if the data is already on the client
				if (oElementBinding.isInitial() || !oModel.getData(sPath)) {
					// Check that the object specified actually was found.
					oElementBinding.attachEventOnce("dataReceived", function () {
						var oData = oModel.getData(sPath);
						if (!oData) {
							fnReject();
						} else {
							fnSuccess(sPath);
						}
					}, this);
				} else {
					fnSuccess(sPath);
				}

			});
		}

	});

}, /* bExport= */ true);