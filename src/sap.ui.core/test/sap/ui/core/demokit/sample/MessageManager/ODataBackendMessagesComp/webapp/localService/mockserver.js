sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {

		init: function () {

			var sODataServiceUrl = "/here/goes/your/serviceUrl/";

			var oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});

			var sLocalServicePath = sap.ui.require.toUrl("sap/ui/core/sample/MessageManager/ODataBackendMessagesComp/localService");

			// configure mock server with a delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 1000
			});

			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl: sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: true
			});

			// ##########################################
			// # Begin Simulate Responses
			// ##########################################

			// JSON response containing the OData error(s)
			var oErrorResponseTemplate = jQuery.sap.syncGetJSON(sLocalServicePath + "/response/ODataErrorResponseTemplate.json").data;

			// sap-message header data
			var oSapMessageHeaderValue = jQuery.sap.syncGetJSON(sLocalServicePath + "/response/SAP-Message-Header.json").data;

			// pre-fetch the mockdata
			//var aEmployees = jQuery.sap.syncGetJSON(sLocalServicePath + "/mockdata/Employees.json").data;
			var oEmployee = jQuery.sap.syncGetJSON(sLocalServicePath + "/mockdata/Employees_3.json").data;

			var aRequests = oMockServer.getRequests();

			var fnValidateUpdateEntity = function(oEmployee){
				var aErrors = [];
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
			};

			var fnUpdateEntityResponse = function(aRequest) {
				aRequest.response = function(oXhr) {
					var oData = JSON.parse(oXhr.requestBody);
					var aErrors = fnValidateUpdateEntity(oData);

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
			};

			var fnGetEntityResponse = function(aRequest) {
				aRequest.response = function(oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, JSON.stringify(oEmployee));
				};
			};

			aRequests.forEach(function(aRequest) {
				if (aRequest.method === "GET" && aRequest.path.toString().indexOf("Employees") > -1) {
					//we simply return always the first entry
					fnGetEntityResponse(aRequest);
				}else if (aRequest.method === "PUT" && aRequest.path.toString().indexOf("Employees") > -1){
					fnUpdateEntityResponse(aRequest);
				}
			});

			// ##########################################
			// # End Simulate Responses
			// ##########################################

			oMockServer.start();
		}
	};

});