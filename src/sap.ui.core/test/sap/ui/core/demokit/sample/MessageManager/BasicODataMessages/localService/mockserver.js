sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {

		init: function (sODataServiceUrl) {

			var oMockServer, sLocalServicePath, aRequests, oErrorResponse;

			// create
			oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			sLocalServicePath = sap.ui.require.toUrl("sap/ui/core/sample/MessageManager/BasicODataMessages/localService");

			// simulate
			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl : sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			// mock server error:
			aRequests = oMockServer.getRequests();

			// JSON response containing the OData error(s)
			oErrorResponse = jQuery.sap.syncGetJSON(sLocalServicePath + "/response/ODataErrorResponse.json").data;

			// mock all DELETE requests for Employees with the error response/message from above
			aRequests.forEach(function(aRequest) {
				if (aRequest.method === "DELETE" && aRequest.path.toString().indexOf("Employees") > -1) {
					this._fnResponse(500, oErrorResponse, aRequest);
				}
			}, this);

			// start
			oMockServer.start();
		},

		// helper function
		_fnResponse : function(iErrCode, oBody, aRequest) {
			aRequest.response = function(oXhr, sUrlParams) {
				oXhr.respond(iErrCode, {
					"Content-Type": "application/json"
				}, JSON.stringify(oBody));
			};
		}
	};

});