/* global module start test asyncTest expect ok equal deepEqual */

/* eslint-disable no-unused-vars */
function runODataMessagesTests() {
/* eslint-enable no-unused-vars */
"use strict";
	QUnit.config.autostart = false;

	jQuery.sap.require("sap.ui.model.odata.v2.ODataModel");
	jQuery.sap.require("sap.ui.model.odata.ODataMessageParser");
	jQuery.sap.require("sap.ui.core.message.MessageManager");

	var oInput = new sap.m.Input({value:"{json>/Products(1)/ProductName}"});
	oInput.placeAt("content");
	
	var oInput2 = new sap.m.Input({value:"{xml>/Products(1)/ProductName}"});
	oInput2.placeAt("content");
	
	
	
	var sServiceURI = "fakeservice://testdata/odata/northwind/";
	// var sServiceURI = "/testsuite/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/";
	var mModelOptions = {
		async: true,
		useBatch: false
	};

	var oModelJson, oModelXml;
	
	// Create MessageManager instance and set Message Model in TimeOut...
	sap.ui.getCore().getMessageManager();
	
	// Start delayed so the message model is available
	setTimeout(function() {
		start();
	}, 100);




	var oJsonLayout = new sap.ui.layout.VerticalLayout({
		content: { 
			path: "json>/Products", 
			template: new sap.ui.commons.Button({
				text: { path: "json>ProductName" }
			})
		}
	});

	var oXmlLayout = new sap.ui.layout.VerticalLayout({
		content: { 
			path: "xml>/Products", 
			template: new sap.ui.commons.Button({
				text: { path: "xml>ProductName" }
			})
		}
	});
	
	var oMainLayout = sap.ui.layout.HorizontalLayout({
		content: [ oJsonLayout, oXmlLayout ]
	});
	oMainLayout.placeAt("content");


	asyncTest("JSON format", function() {
		mModelOptions.json = true;
		oModelJson = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		sap.ui.getCore().setModel(oModelJson, "json");

		var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();

		equal(oMessageModel.getProperty("/").length, 0, "No message has been added");

		ok(oInput.getValueState() === "None", "ValueState has not been set");

		var iRequests = 0;
		oModelJson.attachRequestCompleted(function(oRequest) {
			iRequests++;
			if (oRequest.getParameter("url").indexOf("$count") == -1) {
				ok(iRequests === 2, "Two Requests (with messages) has been processed");
				setTimeout(function() {
					ok(oInput.getValueState() === "Error", "ValueState has been set to 'Error'");

					var iMessages = oMessageModel.getProperty("/").length;
					equal(iMessages, 21, "One message has been added for every Item and one for the Collection");
					
					oModelJson.destroy();
					start();
				}, 0);
			}
		});
	});

	asyncTest("XML format", function() {
		mModelOptions.json = false;
		oModelXml = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		sap.ui.getCore().setModel(oModelXml, "xml");
		var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();

		ok(oInput2.getValueState() === "None", "ValueState has not been set");

		var iRequests = 0;
		oModelXml.attachRequestCompleted(function(oRequest) {
			iRequests++;
			var iMessages = oMessageModel.getProperty("/").length;
			if (oRequest.getParameter("url").indexOf("$count") == -1) {
				ok(iRequests === 2, "Two Requests (with messages) has been processed");
				setTimeout(function() {
					ok(oInput2.getValueState() === "Error", "ValueState has been set to 'Error'");

					var iMessages = oMessageModel.getProperty("/").length;
					equal(iMessages, 21, "One message has been added for every Item and one for the Collection");
					
					oModelXml.destroy();
					start();
				}, 0);
			}
		});
	});
	
	
	asyncTest("Function Imports", function() {
		var oModel = new sap.ui.model.odata.v2.ODataModel("fakeservice://testdata/odata/function-imports/", {
			useBatch: false,
			json: false
		});
		var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
		
		equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test")
		
		oModel.attachMetadataLoaded(function() {
			var mMessages = oMessageModel.getProperty("/");
			var oMetadata = oModel.getServiceMetadata();

			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "00000000-0000-0000-0000-000000000001",	
					"foo": "bar"
				},
				
				numMessages: 1,
				lastTarget: "/Products(guid'10000000-0000-0000-0000-000000000000')",
				final: false
			});

			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "00000000-0000-0000-0000-000000000002",	
					"foo": "bar"
				},
				
				numMessages: 2,
				lastTarget: "/Products(guid'20000000-0000-0000-0000-000000000000')",
				final: false
			});

			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "30000000-0000-0000-0000-000000000003",	
					"foo": "bar"
				},
				
				numMessages: 3,
				lastTarget: "/Products(guid'30000000-0000-0000-0000-000000000003')",
				final: true
			});


			function testFunctionTarget(mTestOptions) {
				// Set default values
				mTestOptions.method      = mTestOptions.method      ? mTestOptions.method      : "POST";
				mTestOptions.parameters  = mTestOptions.parameters  ? mTestOptions.parameters  : {};
				mTestOptions.numMessages = mTestOptions.numMessages ? mTestOptions.numMessages : {};
				mTestOptions.final       = mTestOptions.final       ? mTestOptions.final       : false;
				mTestOptions.lastTarget  = mTestOptions.lastTarget  ? mTestOptions.lastTarget  : "INVALIDTARGET";
				
				testFunctionTarget.aTests = testFunctionTarget.aTests ? testFunctionTarget.aTests : [];
				testFunctionTarget.aTests.push(mTestOptions);
				
				var fnNextTest = function() {
					var mTestOptions;
					if (testFunctionTarget.aTests.length > 0) {
						mTestOptions = testFunctionTarget.aTests.shift();
					} else {
						testFunctionTarget._running = false;
					}
					
					oModel.callFunction(mTestOptions.url, {
						method: mTestOptions.method,
						urlParameters: mTestOptions.parameters,
						success: function() {
							var aMessages = oMessageModel.getProperty("/");
							equal(aMessages.length, mTestOptions.numMessages, mTestOptions.numMessages + " messages set after the function import");
							equal(aMessages[aMessages.length - 1].target, mTestOptions.lastTarget, "Message has correct target");
							
							if (mTestOptions.final) {
								testFunctionTarget._running = false;
								start();
							} else {
								fnNextTest();
							}
						}
					});
					
				};
				
				if (!testFunctionTarget._running) {
					testFunctionTarget._running = true;
					fnNextTest();
				}
				
			}
		});
	});
	

		
	
}
