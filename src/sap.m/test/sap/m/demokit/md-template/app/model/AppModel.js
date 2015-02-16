sap.ui.define(
	[
		"sap/ui/model/odata/v2/ODataModel"
	], function (ODataModel) {
	"use strict";


	return ODataModel.extend("sap.ui.demo.mdtemplate.model.AppModel", {

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
				if (!oModel.getProperty(sPath)) {
					// Check that the object specified actually was found.
					oElementBinding.attachEventOnce("dataReceived", function () {
						var oData = oModel.getProperty(sPath);
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