sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/jquery"
], function (MockServer, jQuery) {
	"use strict";

	function syncGetJSON(sURL) {
		let sResult;
		jQuery.ajax({
			url: sURL,
			async: false,
			dataType: "json",
			success(data) {
				sResult = data;
			}
		});
		return sResult;
	}

	return {

		init() {

			const sODataServiceUrl = "/here/goes/your/serviceUrl/";

			const oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});

			const sLocalServicePath = sap.ui.require.toUrl("sap/ui/core/sample/Messaging/ODataBackendMessagesComp/localService");

			// configure mock server with a delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl: sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: true
			});

			// ##########################################
			// # Begin Simulate Responses
			// ##########################################

			// JSON response containing the OData error(s)
			const oErrorResponseTemplate = syncGetJSON(sLocalServicePath + "/response/ODataErrorResponseTemplate.json");

			// sap-message header data
			const oSapMessageHeaderValue = syncGetJSON(sLocalServicePath + "/response/SAP-Message-Header.json");

			// pre-fetch the mockdata
			//var aEmployees = syncGetJSON(sLocalServicePath + "/mockdata/Employees.json");
			const oEmployee = syncGetJSON(sLocalServicePath + "/mockdata/Employees_3.json");

			const aRequests = oMockServer.getRequests();

			function fnValidateUpdateEntity(oEmployee) {
				const aErrors = [];
				// simulate some dummy backend validation
				if (!oEmployee.FirstName) {
					aErrors.push({
						code:"EmptyFirstName",
						message:"First name mustn't be empty",
						propertyref:"",
						severity:"error",
						target:"/Employees(3)/FirstName"
					});
				}
				if (!oEmployee.LastName) {
					aErrors.push({
						code:"EmptyLastName",
						message:"Last name mustn't be empty",
						propertyref:"",
						severity:"error",
						target:"/Employees(3)/LastName"
					});
				}
				return aErrors;
			}

			function fnUpdateEntityResponse(oRequest) {
				oRequest.response = function(oXhr) {
					const oData = JSON.parse(oXhr.requestBody);
					const aErrors = fnValidateUpdateEntity(oData);

					if (aErrors.length) {
						oErrorResponseTemplate.error.innererror.errordetails = aErrors;
						oXhr.respond(500, {
							"Content-Type": "application/json"
						}, JSON.stringify(oErrorResponseTemplate));

					} else {
						// update mock data
						oEmployee.d.FirstName = oData.FirstName;
						oEmployee.d.LastName  = oData.LastName;
						oEmployee.d.BirthDate = oData.BirthDate;
						oEmployee.d.HireDate  = oData.HireDate;

						// now send the ok response
						oXhr.respond(200, {
							"Content-Type": "application/json",
							"sap-message": JSON.stringify(oSapMessageHeaderValue)
						}, JSON.stringify(oEmployee));
					}
				};
			}

			function fnGetEntityResponse(oRequest) {
				oRequest.response = function(oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, JSON.stringify(oEmployee));
				};
			}

			aRequests.forEach((oRequest) => {
				if (oRequest.method === "GET" && oRequest.path.toString().includes("Employees")) {
					//we simply return always the first entry
					fnGetEntityResponse(oRequest);
				} else if (oRequest.method === "PUT" && oRequest.path.toString().includes("Employees")) {
					fnUpdateEntityResponse(oRequest);
				}
			});

			// ##########################################
			// # End Simulate Responses
			// ##########################################

			oMockServer.start();
		}
	};

});