sap.ui.define([
		"sap/ui/core/util/MockServer"
	], function (MockServer) {
	"use strict";

	return {

		_sServiceUrl : "here/goes/your/serviceUrl/",
		_sModulePath : "sap.ui.demo.mdtemplate.service",

		/**
		 * Initializes the mock server. You can configure the delay with the URL parameter "serverDelay"
		 * The local mock data in this folder is returned instead of the real data for testing.
		 *
		 * @public
		 */

		init : function () {
			var oUriParameters = jQuery.sap.getUriParameters(),
				oMockServer = new MockServer({
					rootUri: this._sServiceUrl
				}),
				sPath = jQuery.sap.getModulePath(this._sModulePath);

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond : true,
				autoRespondAfter : (oUriParameters.get("serverDelay") || 1000)
			});

			// load local mock data
			oMockServer.simulate(sPath + "/metadata.xml", sPath);
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		}
	};

}, /* bExport= */ true);
