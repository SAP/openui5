sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/jquery"
], function (MockServer, jQuery) {
	"use strict";

	return {

		init(sODataServiceUrl) {
			// create
			const oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			const sLocalServicePath = sap.ui.require.toUrl("sap/ui/core/sample/Messaging/BasicODataMessages/localService");

			// simulate
			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl : sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			// mock server error:
			const aRequests = oMockServer.getRequests();

			// JSON response containing the OData error(s)
			let oErrorResponse;
			jQuery.ajax({
				url: sLocalServicePath + "/response/ODataErrorResponse.json",
				async: false,
				dataType: "json",
				success: function(data) {
					oErrorResponse = data;
				}
			});

			// mock all DELETE requests for Employees with the error response/message from above
			aRequests.forEach((oRequest) => {
				if (oRequest.method === "DELETE" && oRequest.path.toString().includes("Employees")) {
					this._fnResponse(500, oErrorResponse, oRequest);
				}
			});

			// start
			oMockServer.start();
		},

		// helper function
		_fnResponse(iErrCode, oBody, oRequest) {
			oRequest.response = function(oXhr, _sUrlParams) {
				oXhr.respond(iErrCode, {
					"Content-Type": "application/json"
				}, JSON.stringify(oBody));
			};
		}
	};

});