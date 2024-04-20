/*eslint quote-props: [2, "as-needed", { "keywords": false, "unnecessary": false}] */
/*global QUnit*/

sap.ui.define([
	"test-resources/sap/ui/core/qunit/odata/data/ODataMessagesFakeService",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/BindingMode",
	"sap/ui/model/type/String",
	"sap/m/Input",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout"
], function(fakeService, Messaging, MessageType, ODataModel, ODataMetadata, ODataMessageParser,
			BindingMode, StringType, Input, Button, VerticalLayout) {
	"use strict";

	var oInput = new Input({value:"{json>/Products(1)/ProductName}"});
	var oInput2 = new Input({value:"{xml>/Products(1)/ProductName}"});

	var sServiceURI = "fakeservice://testdata/odata/northwind/";
	// var sServiceURI = "/testsuite/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/";
	var mModelOptions = {
		defaultBindingMode: BindingMode.TwoWay,
		async: true,
		useBatch: false
	};

	var oModelJson, oModelXml;

	var oJsonLayout = new VerticalLayout({
		content: {
			path: "json>/Products",
			template: new Button({
				text: { path: "json>ProductName" }
			})
		}
	});

	var oXmlLayout = new VerticalLayout({
		content: {
			path: "xml>/Products",
			template: new Button({
				text: { path: "xml>ProductName" }
			})
		}
	});

	QUnit.module("MessageParser");

	QUnit.test("JSON format", function(assert) {
		var done = assert.async();
		mModelOptions.json = true;
		oModelJson = new ODataModel(sServiceURI, mModelOptions);
		oJsonLayout.setModel(oModelJson, "json");
		oInput.setModel(oModelJson, "json");

		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No message has been added");

		assert.ok(oInput.getValueState() === "None", "ValueState has not been set");

		var iRequests = 0;
		oModelJson.attachRequestCompleted(function(oRequest) {
			iRequests++;
			if (oRequest.getParameter("url").indexOf("$count") == -1) {
				assert.ok(iRequests === 2, "Two Requests (with messages) has been processed");
				setTimeout(function() {
					assert.ok(oInput.getValueState() === "Error", "ValueState has been set to 'Error'");

					var iMessages = oMessageModel.getProperty("/").length;
					assert.equal(iMessages, 21, "One message has been added for every Item and one for the Collection");

					oModelJson.destroy();
					done();
				}, 0);
			}
		});
	});

	QUnit.test("XML format", function(assert) {
		var done = assert.async();
		mModelOptions.json = false;
		oModelXml = new ODataModel(sServiceURI, mModelOptions);
		oXmlLayout.setModel(oModelXml, "xml");
		oInput2.setModel(oModelXml, "xml");
		var oMessageModel = Messaging.getMessageModel();

		assert.ok(oInput2.getValueState() === "None", "ValueState has not been set");

		var iRequests = 0;
		oModelXml.attachRequestCompleted(function(oRequest) {
			iRequests++;
			if (oRequest.getParameter("url").indexOf("$count") == -1) {
				assert.ok(iRequests === 2, "Two Requests (with messages) has been processed");
				setTimeout(function() {
					assert.ok(oInput2.getValueState() === "Error", "ValueState has been set to 'Error'");

					var iMessages = oMessageModel.getProperty("/").length;
					assert.equal(iMessages, 21, "One message has been added for every Item and one for the Collection");

					oModelXml.destroy();
					done();
				}, 0);
			}
		});
	});


	QUnit.test("Function Imports", function(assert) {
		var done = assert.async();
		var oModel = new ODataModel("fakeservice://testdata/odata/function-imports/", {
			useBatch: false,
			json: false
		});
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {
			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "00000000-0000-0000-0000-000000000001"
				},

				numMessages: 1,
				lastTarget: "/Products(guid'10000000-0000-0000-0000-000000000000')",
				final: false
			});

			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "00000000-0000-0000-0000-000000000002"
				},

				numMessages: 2,
				lastTarget: "/Products(guid'20000000-0000-0000-0000-000000000000')",
				final: false
			});

			testFunctionTarget({
				url: "/EditProduct",
				parameters: {
					"ProductUUID": "30000000-0000-0000-0000-000000000003"
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
							assert.equal(aMessages.length, mTestOptions.numMessages, mTestOptions.numMessages + " messages set after the function import");
							assert.equal(aMessages[aMessages.length - 1].getTargets()[0], mTestOptions.lastTarget, "Message has correct target");

							if (mTestOptions.final) {
								testFunctionTarget._running = false;
								oModel.destroy();
								done();
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


	var fnTestTechnicalErrors = function(bJson, assert) {
		var done = assert.async();

		assert.expect(19);

		var oModel = new ODataModel("fakeservice://testdata/odata/technical-errors/", {
			useBatch: false,
			json: bJson
		});

		var iStartCounter = 3;
		var fnStart = function() {
			if (!--iStartCounter) {
				oModel.destroy();
				done();
			}
		};

		var iExpectedMessages = 0;


		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {

			var fnCheckAddedMessages = function() {
				iExpectedMessages += 2;

				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, iExpectedMessages, "There should be more error messages");

				assert.equal(aMessages[iExpectedMessages - 2].getMessage(), "Field \"SALESORDERID\" cannot be changed since it is read only", "Correct message text");
				assert.equal(aMessages[iExpectedMessages - 2].getType(), MessageType.Error, "Correct message severity");

				assert.equal(aMessages[iExpectedMessages - 1].getMessage(), "Some other error", "Correct message text");
				assert.equal(aMessages[iExpectedMessages - 1].getType(), MessageType.Error, "Correct message severity");

				fnStart();
			};

			var fnCheckAddedMessages2 = function() {
				iExpectedMessages += 6;

				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, iExpectedMessages, "There should be more error messages");

				// Important: In this case the message order has been changed since errors come before warnings
				var mAddesMessages = {
					"Error|SY/530|/Error2(400)|Warning": false,
					"Error|/IWBEP/CX_MGW_BUSI_EXCEPTION|/Error2(400)|Business Error with details in TEA application": false,
					"Error||/Error2(400)/Property|Multiple error/warning messages": false,
					"Error||/Error2(400)/Message|Inner error": false,
					"Error||/Error2(400)/Type|Inner error 2": false,
					"Warning||/Error2(400)/Type|Warning": false
				};

				for (var i = aMessages.length - 6; i < aMessages.length; ++i) {
					var oM = aMessages[i];
					var sIdentifier = [oM.getType(), oM.getCode(), oM.getTargets()[0], oM.getMessage()].join("|");

					assert.equal(mAddesMessages[sIdentifier], false, "Message is as expected");
					mAddesMessages[sIdentifier] = true;
				}

				var bAllMessagesArrived = Object.keys(mAddesMessages).reduce(function(vPrev, sCurrent) {
					return vPrev && mAddesMessages[sCurrent] === true;
				}, true);
				assert.ok(bAllMessagesArrived, "All expected messages are there");

				fnStart();
			};

			oModel.read("/Error(400)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages
			});

			oModel.read("/Error(500)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages
			});

			oModel.read("/Error2(400)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages2
			});
		});
	};

	QUnit.test("Technical Errors (JSON)", fnTestTechnicalErrors.bind(this, true));
	QUnit.test("Technical Errors (XML)", fnTestTechnicalErrors.bind(this, false));

	var fnTestLongtextUrl = function(bJson, assert) {
		var done = assert.async();

		assert.expect(14);

		var oModel = new ODataModel("fakeservice://testdata/odata/technical-errors/", {
			useBatch: false,
			json: bJson
		});

		var iStartCounter = 3;
		var fnStart = function() {
			if (!--iStartCounter) {
				oModel.destroy();
				done();
			}
		};

		var iExpectedMessages = 0;


		var oMessageModel = Messaging.getMessageModel();
		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {

			var fnCheckAddedMessages = function() {
				iExpectedMessages += 2;

				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, iExpectedMessages, "There should be more error messages");

				// All messages should have longtext URLs
				for (var i = aMessages.length - 2; i < aMessages.length; ++i) {
					assert.ok(aMessages[i].getDescriptionUrl(), "Message has longtext URL");
				}

				fnStart();
			};

			var fnCheckAddedMessages2 = function() {
				iExpectedMessages += 6;

				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, iExpectedMessages, "There should be more error messages");

				// No messages should have longtext URLs
				for (var i = aMessages.length - 6; i < aMessages.length; ++i) {
					assert.ok(!aMessages[i].getDescriptionUrl(), "Message has no longtext URL");
				}

				fnStart();
			};

			oModel.read("/Error(400)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages
			});

			oModel.read("/Error(500)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages
			});

			oModel.read("/Error2(400)", {
				success: function() {
					assert.ok(false, "This should return an error from the server and thus fail");
				},
				error: fnCheckAddedMessages2
			});
		});
	};


	QUnit.test("LongText URL (JSON)", fnTestLongtextUrl.bind(this, true));
	QUnit.test("LongText URL (XML)", fnTestLongtextUrl.bind(this, false));

	QUnit.test("ODataMessageParser reads headers case-insensitive", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		var oMessageModel = Messaging.getMessageModel();
		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {
			var aNewMessages = [],
				oParser = new ODataMessageParser(sServiceURI, oMetadata),
				oRequest,
				oResponse;


			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			oRequest = {
				headers : {},
				requestUri: "fakeservice://testdata/odata/northwind/Test"
			};

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"Sap-Message": JSON.stringify({
						"code": "999",
						"message": "This is test message",
						"severity": "error",
						"details": []
					})
				}
			};
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 1, "Message from 'Sap-Message' header was added");

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"sap-message": JSON.stringify({
						"code": "999",
						"message": "This is test message",
						"severity": "error",
						"details": []
					})
				}
			};
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 1, "Message from 'sap-message' header was added");

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"SAP-Message": JSON.stringify({
						"code": "999",
						"message": "This is test message",
						"severity": "error",
						"details": []
					})
				}
			};
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 1, "Message from 'SAP-Message' header was added");
			done();
		});
	});

	QUnit.test("ODataMessageParser: target key for created entities", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {


			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			var aOldMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
					aOldMessages = oObj.oldMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			//SETUP
			var oRequest = {
				created: true,
				headers : {},
				key: "Products(1)",
				method: "POST"
			};

			var oResponse = {
				statusCode: "400", //CREATED
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;"
				}
			};

			var oResponseHeaderSapMessageObject = {
				"odata.error": {
					"details": [],
					"code":		"999"
				},
				"message":	"resource created but error occurred",
				"severity":	"error",
				"details": []
			};

			var oRequest2 = {
				created: true,
				headers : {},
				key: "Products(1)",
				method: "POST"
			};

			var oResponseHeaderSapMessageObject2 = {
				"odata.error": {
					"details": [],
					"code":		"888"
				},
				"message":	"resource created but error occurred",
				"severity":	"error",
				"details": []
			};

			// location header set in response (Products)


			//request uri:          fakeservice://testdata/odata/northwind/Products
			oRequest.requestUri = sServiceURI + "/Products";
			oResponse.body = JSON.stringify(oResponseHeaderSapMessageObject);

			oParser.parse(oResponse, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "target is read from the provided key");


			//request uri:          fakeservice://testdata/odata/northwind/Products
			oRequest.created = false;

			oParser.parse(oResponse, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products", "target is parsed from the requestUri");

			oRequest2.requestUri = sServiceURI + "/Products";
			oResponse.body = JSON.stringify(oResponseHeaderSapMessageObject2);
			oParser.parse(oResponse, oRequest2);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "target is read from the provided key");
			assert.equal(aNewMessages[0].code, "888", "target is read from the provided key");
			assert.equal(aOldMessages.length, 1, "Remove message.");

			//request uri:          fakeservice://testdata/odata/northwind/Products
			oRequest.created = false;

			oParser.parse(oResponse, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products", "target is parsed from the requestUri");

			done();
		});
	});


	QUnit.test("ODataMessageParser: error for newly created resource with relative target", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {


			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});


			//SETUP
			var oRequest = {
				method: "POST"
			};

			var oResponse = {
				statusCode: "201", //CREATED
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;"
				}
			};

			var oResponseHeaderSapMessageObject = {
				"code":		"999",
				"message":	"resource created but error occurred",
				"severity":	"error",
				"details": []
			};

			// location header set in response (Products)


			//request uri:          fakeservice://testdata/odata/northwind/Products
			//response location:    fakeservice://testdata/odata/northwind/Products(1)
			//target:               name
			oRequest.requestUri = sServiceURI + "/Products";
			oResponseHeaderSapMessageObject.target = "name";
			oResponse.headers["location"] = sServiceURI + "/Products(1)";
			oResponse.headers["Sap-Message"] = JSON.stringify(oResponseHeaderSapMessageObject);

			oParser.parse(oResponse, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)/name", "target is relative to newly created product");


			//request uri:          fakeservice://testdata/odata/northwind/Categories(1)/Products
			//response location:    fakeservice://testdata/odata/northwind/Products(1)
			//target:               name
			oRequest.requestUri = sServiceURI + "/Categories(1)/Products";
			oResponseHeaderSapMessageObject.target = "name";
			oResponse.headers["location"] = sServiceURI + "/Products(1)";
			oResponse.headers["Sap-Message"] = JSON.stringify(oResponseHeaderSapMessageObject);

			oParser.parse(oResponse, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)/name", "target is relative to newly created product");


			done();
		});
	});

	QUnit.test("ODataMessageParser takes messages from specified header field", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();
		assert.equal(oMessageModel.getProperty("/").length, 0,
			"No messages are set at the beginning of the test");

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {
			var aNewMessages = [],
				oParser = new ODataMessageParser(sServiceURI, oMetadata),
				oRequest,
				oResponse;

			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			oRequest = {
				headers : {},
				requestUri: "fakeservice://testdata/odata/northwind/Test"
			};

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"sap-message": JSON.stringify({
						"code": "999",
						"message": "This is test message",
						"severity": "error",
						"details": []
					})
				}
			};
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 1, "Message parsed from 'sap-message' header");

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"message": JSON.stringify({
						"code": "999",
						"message": "This is an error test message",
						"severity": "error",
						"details": [{
							"code": "999",
							"message": "This is a warning test message",
							"severity": "warning"
						}, {
							"code": "999",
							"message": "This is a success test message",
							"severity": "success"
						}, {
							"code": "999",
							"message": "This is an information test message",
							"severity": "info"
						}]
					})
				}
			};
			aNewMessages = [];
			oParser.setHeaderField("message");
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 4, "Messages parsed from 'message' header");

			oResponse = {
				statusCode: "200", // Parse Header...
				body: "Ignored",
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"invalid": "{ invalid: Json }"
				}
			};
			aNewMessages = [];
			oParser.setHeaderField("invalid");
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 0,
				"No message parsed from 'invalid' header with invalid content");

			aNewMessages = [];
			oParser.setHeaderField("none");
			oParser.parse(oResponse, oRequest);
			assert.equal(aNewMessages.length, 0, "No message parsed from non-existent header");

			oMetadata.destroy();
			oParser.destroy();
			done();

		});

	});


	// TODO: Function imports with action-for annotation


	QUnit.test("Function Imports with action-for annotation", function(assert) {
		var done = assert.async();
		var oModel = new ODataModel("fakeservice://testdata/odata/function-imports/", {
			useBatch: false,
			json: false
		});
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {

			testFunctionTarget({
				url: "/ActionForFunction",
				parameters: {
					"SupplierUUID": "00000000-0000-0000-0000-000000000001"
				},

				numMessages: 1,
				lastTarget: "/Suppliers(guid'00000000-0000-0000-0000-000000000001')",
				final: false
			});

			testFunctionTarget({
				url: "/ActionForFunction",
				parameters: {
					"SupplierUUID": "00000000-0000-0000-0000-000000000002"
				},

				numMessages: 2,
				lastTarget: "/Products(999)/ProductName",
				final: false
			});

			testFunctionTarget({
				url: "/ActionForFunction",
				parameters: {
					"SupplierUUID": "00000000-0000-0000-0000-000000000002"
				},

				numMessages: 2,
				lastTarget: "/Products(999)/ProductName",
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
							assert.equal(aMessages.length, mTestOptions.numMessages, mTestOptions.numMessages + " messages set after the function import");
							assert.equal(aMessages[aMessages.length - 1].getTargets()[0], mTestOptions.lastTarget, "Message has correct target");

							if (mTestOptions.final) {
								testFunctionTarget._running = false;
								oModel.destroy();
								done();
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

	// TODO: Function imports with multiple key fields


	var fnTestBatchGroups = function(bUseBatch, bJSON, assert) {
		var done = assert.async();

		assert.expect(bUseBatch ? 9 : 5);
		var oModel = new ODataModel("fakeservice://testdata/odata/northwind/", {
			useBatch: bUseBatch,
			json: bJSON
		});
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {

			assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set after metadata loaded");

			oModel.setDeferredGroups(["deferredId"]);
			oModel.read("/Products(1)", { batchGroupId : "deferredId" });
			oModel.read("/Products(2)", { batchGroupId : "deferredId" });
			oModel.read("/Products(3)", { batchGroupId : "deferredId" });

			oModel.attachBatchRequestSent(function() {
				assert.ok(bUseBatch, "Only receive batchRequestSent event in batch mode");
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 0, "No messages when requests have been sent");
			});
			oModel.attachBatchRequestCompleted(function(oEvent) {
				assert.ok(bUseBatch, "Only receive batchRequestCompleted event in batch mode");
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 1 + iRequestsCompleted, "One Message for the EntitySet plus one for every item");

				onCompleted();
			});

			var iRequestsCompleted = 0;
			oModel.attachRequestCompleted(function(oEvent) {
				++iRequestsCompleted;
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 1 + iRequestsCompleted, "One Message for the EntitySet plus one for every item");

				if (!bUseBatch && iRequestsCompleted === 3) {
					onCompleted();
				}
			});

			oModel.submitChanges();
		});

		function onCompleted() {
			oModel.destroy();
			done();
		}
	};

	QUnit.test("Message with groups - Batch: off, JSON: true",  fnTestBatchGroups.bind(this, false, true));
	QUnit.test("Message with groups - Batch: off, JSON: false", fnTestBatchGroups.bind(this, false, false));
	QUnit.test("Message with groups - Batch: on,  JSON: true",  fnTestBatchGroups.bind(this, true,  true));
	QUnit.test("Message with groups - Batch: on,  JSON: false", fnTestBatchGroups.bind(this, true,  false));



	var fnTestWriteBatchGroups = function(bUseBatch, bJSON, assert) {
		var done = assert.async();

		assert.expect(bUseBatch ? 9 : 5);
		var oModel = new ODataModel("fakeservice://testdata/odata/northwind/", {
			useBatch: bUseBatch,
			json: bJSON
		});
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {

			assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set after metadata loaded");

			oModel.setDeferredGroups(["deferredId"]);
			oModel.update("/Products(1)", { ProductName: "Updated 1" }, { batchGroupId : "deferredId" });
			oModel.update("/Products(2)", { ProductName: "Updated 2" }, { batchGroupId : "deferredId" });
			oModel.update("/Products(3)", { ProductName: "Updated 3" }, { batchGroupId : "deferredId" });

			oModel.attachBatchRequestSent(function() {
				assert.ok(bUseBatch, "Only receive batchRequestSent event in batch mode");
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 0, "No messages when requests have been sent");
			});
			oModel.attachBatchRequestCompleted(function(oEvent) {
				assert.ok(bUseBatch, "Only receive batchRequestCompleted event in batch mode");
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 1 + iRequestsCompleted, "One Message for the EntitySet plus one for every item");

				onCompleted();
			});

			var iRequestsCompleted = 0;
			oModel.attachRequestCompleted(function(oEvent) {
				++iRequestsCompleted;
				var aMessages = oMessageModel.getProperty("/");
				assert.equal(aMessages.length, 1 + iRequestsCompleted, "One Message for the EntitySet plus one for every item");

				if (!bUseBatch && iRequestsCompleted === 3) {
					onCompleted();
				}
			});

			oModel.submitChanges();
		});

		function onCompleted() {
			oModel.destroy();
			done();
		}
	};

	QUnit.test("Message with groups (write) - Batch: off, JSON: true",  fnTestWriteBatchGroups.bind(this, false, true));
	QUnit.test("Message with groups (write) - Batch: off, JSON: false", fnTestWriteBatchGroups.bind(this, false, false));
	QUnit.test("Message with groups (write) - Batch: on,  JSON: true",  fnTestWriteBatchGroups.bind(this, true,  true));
	QUnit.test("Message with groups (write) - Batch: on,  JSON: false", fnTestWriteBatchGroups.bind(this, true,  false));


/** @deprecated As of version 1.79.0, reason sap.ui.core.message.Message#getTarget */
(function() {
	var fnTestFunctionImport = function(assert) {
		var done = assert.async();

		assert.expect(10);
		var oModel = new ODataModel("fakeservice://testdata/odata/northwind/", { tokenHandling: false, useBatch: false });
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {
			var aMessages = oMessageModel.getProperty("/");

			assert.equal(aMessages.length, 0, "No messages are set at the after metadata was loaded");

			oModel.read("/Products(1)", {
				success: function() {
					var aMessages = oMessageModel.getProperty("/");
					var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

					assert.equal(aMessages.length, 2, "Two messages are set at the beginning of the test");
					assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' has been received.");
					assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") > -1, "Message targetting '/Products(1)/ProductName' has been received.");
					oModel.read("/Products(1)/Supplier", {
						success: function() {
							var aMessages = oMessageModel.getProperty("/");
							var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

							assert.equal(aMessages.length, 4, "Four messages are set at the beginning of the test");

							assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' has been received.");
							assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") > -1, "Message targetting '/Products(1)/ProductName' has been received.");
							assert.ok(aMessageTagets.indexOf("/Suppliers") > -1, "Message targetting '/Products' has been received.");
							var sSupplierNameTarget = aMessageTagets.reduce(function(sPrevious, sValue) {
								return sValue.indexOf(")/SupplierName") > -1 ? sValue : sPrevious;
							});
							assert.ok(/\/Suppliers\(.{1,2}\)\/SupplierName/.test(sSupplierNameTarget), "Message targetting '/Suppliers(XXX)/SupplierName' has been received.");

							oModel.destroy();
							done();
						}
					});
				}
			});



		});
	};

	QUnit.test("Messages for NavigationProperties",  fnTestFunctionImport);



	var fnTestFunctionImportWithInvalidTarget = function(assert) {
		var done = assert.async();

		assert.expect(26);
		var oModel = new ODataModel("fakeservice://testdata/odata/northwind/", { tokenHandling: false, useBatch: false });
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();
		var oMessage;

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		oModel.attachMetadataLoaded(function() {
			var aMessages = oMessageModel.getProperty("/");

			assert.equal(aMessages.length, 0, "No messages are set at the after metadata was loaded");

			oModel.read("/Products(1)", {
				success: function() {
					var aMessages = oMessageModel.getProperty("/");
					var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

					assert.equal(aMessages.length, 2, "Two messages are set after the entity was read");
					assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' has been received.");
					assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") > -1, "Message targetting '/Products(1)/ProductName' has been received.");

					oModel.callFunction("/functionWithInvalidTarget", {
						method: "POST",
						success: function() {
							var aMessages = oMessageModel.getProperty("/");
							var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

							assert.equal(aMessages.length, 3, "Three messages are set after the FunctionImport returned");

							assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' is still there.");
							assert.ok(aMessageTagets.indexOf("/Products(1)/SupplierID") > -1, "Message targetting '/Products(1)/SupplierID' has been received.");
							assert.ok(aMessageTagets.indexOf("/PersistedMessages/functionWithInvalidTarget") > -1, "Message targetting '/PersistedMessages/functionWithInvalidTarget' has been received.");

							assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") === -1, "Message targetting '/Products(1)/ProductName' has been removed.");

							oModel.read("/Products(1)", {
								success: function() {
									var aMessages = oMessageModel.getProperty("/");
									var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

									assert.equal(aMessages.length, 3, "Three messages are set after /Products(1) is requested again");

									assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' has been received.");
									assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") > -1, "Message targetting '/Products(1)/ProductName' has been received.");
									assert.ok(aMessageTagets.indexOf("/PersistedMessages/functionWithInvalidTarget") > -1, "Message targetting '/PersistedMessages/functionWithInvalidTarget' has been kept.");

									assert.ok(aMessageTagets.indexOf("/Products(1)/SupplierID") === -1, "Message targetting '/Products(1)/SupplierID' has been removed.");

									oModel.callFunction("/functionWithInvalidTarget", {
										method: "POST",
										success: function() {
											var aMessages = oMessageModel.getProperty("/");
											var aMessageTagets = aMessages.map(function(oMessage) { return oMessage.getTarget(); });

											assert.equal(aMessages.length, 3, "Three messages are set after FunctionImport is called again");

											assert.ok(aMessageTagets.indexOf("/Products") > -1, "Message targetting '/Products' is still there.");
											assert.ok(aMessageTagets.indexOf("/Products(1)/SupplierID") > -1, "Message targetting '/Products(1)/SupplierID' has been received.");
											assert.ok(aMessageTagets.indexOf("/PersistedMessages/functionWithInvalidTarget") > -1, "Message targetting '/PersistedMessages/functionWithInvalidTarget' has been received.");

											assert.ok(aMessageTagets.indexOf("/Products(1)/ProductName") === -1, "Message targetting '/Products(1)/ProductName' has been removed.");


											oModel.callFunction("/functionWithInvalidReturnType", {
												method: "POST",
												success: function() {
													var aMessages = oMessageModel.getProperty("/");
													oMessage = aMessages.filter(function(oMessage) { return oMessage.getTarget() === ""; })[0];

													assert.strictEqual(aMessages.length, 4, "Four messages are set after FunctionImport is called again");
													assert.strictEqual(typeof oMessage, "object", "Message with empty target was created.");
													assert.strictEqual(oMessage.message, "This is FunctionImport specific message with an invalid return type.");

													oModel.callFunction("/functionWithInvalidEntitySet", {
														method: "POST",
														success: function() {
															var aMessages = oMessageModel.getProperty("/");
															oMessage = aMessages.filter(function(oMessage) { return oMessage.getTarget() === ""; })[0];

															assert.strictEqual(aMessages.length, 4, "Four messages are set after FunctionImport is called again");
															assert.strictEqual(typeof oMessage, "object", "Message with empty target was created.");
															assert.strictEqual(oMessage.message, "This is FunctionImport specific message with an invalid entityset.");

															oModel.destroy();
															done();
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});



		});
	};

	QUnit.test("Messages with 'invalid' targets",  fnTestFunctionImportWithInvalidTarget);
}());

	var fnTestRemoveMessagesWithBinding = function(assert) {
		var done = assert.async();

		assert.expect(11);

		var oInput3 = new Input({
			value: {
				path: "/Products(1)/ProductName",
				type: new StringType(null, {
					maxLength: 3
				})
			}
		});

		var wait = function() {
			return new Promise(function(resolve) {
				oInput3.getBinding("value").attachAggregatedDataStateChange(resolve);
			});
		};

		var read = function(sPath) {
			return new Promise(function(resolve) {
				oModel.read(sPath, { success: resolve });
			});
		};

		var oModel = new ODataModel(sServiceURI, mModelOptions);
		oInput3.setModel(oModel);

		Messaging.removeAllMessages();
		Messaging.registerObject(oInput3, true);

		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		read("/Products(1)").then(function() {
			oInput3.setValue("123");

			return wait();
		}).then(function() {
			assert.equal(oMessageModel.getProperty("/").length, 2, "Two messages from the OData service with a correct value set");
			assert.equal(oInput3.getBinding("value").getDataState().getControlMessages().length, 0, "No validation errors");

			oInput3.setValue("1234");

			return wait();
		}).then(function() {
			assert.equal(oMessageModel.getProperty("/").length, 3, "Two messages from the OData service and one from validation");
			assert.equal(oInput3.getBinding("value").getDataState().getControlMessages().length, 1, "One validation error");

			oInput3.bindProperty("value",  {
				path: "ProductName",
				type: new StringType(null, {
					maxLength: 3
				})
			});

		}).then(function() {
			assert.equal(oMessageModel.getProperty("/").length, 2, "Two messages from the OData service after rebinding");
			assert.equal(oInput3.getBinding("value").getDataState().getControlMessages().length, 0, "No validation errors");

			oInput3.setValue("1234");

			return wait();
		}).then(function() {
			assert.equal(oMessageModel.getProperty("/").length, 3, "Two messages from the OData service and one from validation");
			assert.equal(oInput3.getBinding("value").getDataState().getControlMessages().length, 1, "One validation error");

			oInput3.setBindingContext(oModel.createBindingContext("/Products(1)"));

			return wait();
		}).then(function() {
			assert.equal(oMessageModel.getProperty("/").length, 2, "Two messages from the OData service after changing the binding context");
			assert.equal(oInput3.getBinding("value").getDataState().getControlMessages().length, 0, "No validation errors");

			oInput3.destroy();
			oModel.destroy();
			done();
		});
	};

	QUnit.test("Delete control messages when the binding is destroyed and on rebinding",
		fnTestRemoveMessagesWithBinding);


	var fnTestTransientMessages = function(assert) {
		var done = assert.async();

		assert.expect(19);

		var oModel = new ODataModel(sServiceURI, Object.assign({}, mModelOptions, { json: true }));
		var read = function(sPath) {
			return new Promise(function(resolve) {
				oModel.read(sPath, { success: resolve });
			});
		};
		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		read("/TransientTest1").then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 3, "Three messages from the back-end");
			assert.equal(aMessages[0].persistent, false, "First message should not be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, true, "Second message should be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, true, "Third message should be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			return read("/TransientTest1");
		}).then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 5, "Five messages - 3 new ones from the back-end");

			assert.equal(aMessages[0].persistent, true, "First message should be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, true, "Second message should be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, false, "Third message should not be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[3].persistent, true, "Fourth message should be persistent");
			assert.equal(aMessages[3].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[4].persistent, true, "Fifth message should be persistent");
			assert.equal(aMessages[4].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			oModel.destroy();
			done();
		});
	};

	QUnit.test("Transient messages with /#TRANSIENT#-target or transient-flag", fnTestTransientMessages);

	var fnTestTransientMessageRemoval = function(assert) {
		var done = assert.async();

		assert.expect(35);

		var oModel = new ODataModel(sServiceURI, Object.assign({}, mModelOptions, { json: true }));
		var read = function(sPath) {
			return new Promise(function(resolve) {
				oModel.read(sPath, { success: resolve });
			});
		};

		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		read("/TransientTest1").then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 3, "Three messages from the back-end");
			assert.equal(aMessages[0].persistent, false, "First message should not be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, true, "Second message should be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, true, "Third message should be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			Messaging.removeAllMessages();

			assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set after removal of all messages");


			return read("/TransientTest1");
		}).then(function() {

			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 3, "Three messages from the back-end");
			assert.equal(aMessages[0].persistent, false, "First message should not be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, true, "Second message should be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, true, "Third message should be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			Messaging.removeMessages(aMessages[0]);
			Messaging.removeMessages(aMessages[2]);

			aMessages = oMessageModel.getProperty("/");

			assert.equal(aMessages.length, 1, "One message left after removal of two messages");
			assert.equal(aMessages[0].persistent, true, "First message should not be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			return read("/TransientTest1");
		}).then(function() {

			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 4, "Five messages - 3 new ones from the back-end");

			assert.equal(aMessages[0].persistent, true, "First message should be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, false, "Second message should not be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, true, "Third message should be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[3].persistent, true, "Fourth message should be persistent");
			assert.equal(aMessages[3].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");

			aMessages[0].setPersistent(false);
			aMessages[2].setPersistent(false);
			aMessages[3].setPersistent(false);

			return read("/TransientTest1");
		}).then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 3, "Three messages from the back-end, all previous messages removed after being set to non-persistent");
			assert.equal(aMessages[0].persistent, false, "First message should not be persistent");
			assert.equal(aMessages[0].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[1].persistent, true, "Second message should be persistent");
			assert.equal(aMessages[1].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");
			assert.equal(aMessages[2].persistent, true, "Third message should be persistent");
			assert.equal(aMessages[2].getTargets()[0], "/TransientTest1/SupplierID", "Message has correct target");


			oModel.destroy();
			done();
		});
	};

	QUnit.test("Transient message removal from Messaging", fnTestTransientMessageRemoval);

	var fnTestNormalization = function(assert) {
		var done = assert.async();

		assert.expect(7);

		var oModel = new ODataModel(sServiceURI, Object.assign({}, mModelOptions, { json: true }));
		var oBinding = oModel.bindProperty("/Products(ContextId='CLF(12)SEMANTIC_OBJ(7)Product(10)OBJECT_KEY(11)ZTEST_GD_02(9)DRAFT_KEY(36)005056ba-1dcb-1ee7-8ec6-ae98ab359923')/ProductName");
		oModel.addBinding(oBinding);
		var read = function(sPath) {
			return new Promise(function(resolve) {
				oModel.read(sPath, { success: resolve });
			});
		};

		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		read("/Products(ContextId='CLF%2812%29SEMANTIC_OBJ%287%29Product%2810%29OBJECT_KEY%2811%29ZTEST_GD_02%289%29DRAFT_KEY%2836%29005056ba-1dcb-1ee7-8ec6-ae98ab359923')").then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length, 2, "Two messages from the back-end");
			assert.equal(aMessages[0].getTargets()[0], "/Products(ContextId='CLF(12)SEMANTIC_OBJ(7)Product(10)OBJECT_KEY(11)ZTEST_GD_02(9)DRAFT_KEY(36)005056ba-1dcb-1ee7-8ec6-ae98ab359923')/ProductName", "Message has correct target");
			assert.ok(oBinding.getDataState().getChanges(), "Messages propagated to binding");
			assert.equal(oBinding.getDataState().getMessages().length, 1, " 1 Message propagated to binding");
			assert.equal(oBinding.getDataState().getMessages()[0], aMessages[0], "Message propagated to binding");
			Messaging.removeAllMessages();
			assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set after removal of all messages");
			return read("/Products(ContextId='CLF%2812%29SEMANTIC_OBJ%287%29Product%2810%29OBJECT_KEY%2811%29ZTEST_GD_02%289%29DRAFT_KEY%2836%29005056ba-1dcb-1ee7-8ec6-ae98ab359923')");
		}).then(function() {
			oModel.destroy();
			done();
		});
	};

	QUnit.test("Message target normalization", fnTestNormalization);

	var fnTestNavProp = function(assert) {
		var done = assert.async();

		assert.expect(8);

		var oModel = new ODataModel(sServiceURI, Object.assign({}, mModelOptions, { json: true }));
		var oBinding = oModel.bindProperty("Supplier/Name");
		oModel.addBinding(oBinding);
		var oContext = oModel.getContext("/Products(1)");
		oBinding.setContext(oContext);

		var read = function(sPath, mParameters) {
			return new Promise(function(resolve) {
				mParameters = mParameters ? mParameters : {};
				mParameters.success = resolve;
				oModel.read(sPath, mParameters);
			});
		};

		Messaging.removeAllMessages();
		var oMessageModel = Messaging.getMessageModel();

		assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set at the beginning of the test");

		read("/Products(1)", {urlParameters:{"$expand":"Supplier"}}).then(function() {
			var aMessages = oMessageModel.getProperty("/");
			assert.equal(aMessages.length,1, "One message from the back-end");
			assert.equal(aMessages[0].getTargets()[0], "/Suppliers(1)/Name", "Message has correct target");
			assert.ok(oBinding.getDataState().getChanges(), "Messages propagated to binding");
			assert.equal(oBinding.getDataState().getMessages().length, 1, " 1 Message propagated to binding");
			assert.equal(oBinding.getDataState().getMessages()[0], aMessages[0], "Message propagated to binding");
			assert.equal(oBinding.getDataState().getMessages()[0].message, "This is a server test message", "Message has correct message text");
			Messaging.removeAllMessages();
			assert.equal(oMessageModel.getProperty("/").length, 0, "No messages are set after removal of all messages");
			oModel.destroy();
			done();
		});
	};

	QUnit.test("Propagate Message: Binding to NavProp", fnTestNavProp);


		var oResponseGET200MsgScope = {
			statusCode: "200",
			body: "OK",
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
				"DataServiceVersion": "2.0;",
				"sap-message": JSON.stringify({
					"code": "999",
					"message": "This is test message",
					"severity": "error",
					"details": []
				})
			}
		};

		var oResponseGET200SuccessMsgScope = {
			statusCode: "200",
			body: "OK",
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
				"DataServiceVersion": "2.0;"
			}
		};

		var oResponseGET400MsgScope = {
			statusCode: "400",
			body: JSON.stringify({
				"error": {
					"message": {
						"value": "Bad Request - ..."
					},
					"code": "999"
				}
			}),
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
				"DataServiceVersion": "2.0;"
			}
		};


	QUnit.test("ODataMessageParser: Keep messages when request failed - Message scope supported", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {

			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			var aOldMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
					aOldMessages = oObj.oldMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				},
				bIsMessageScopeSupported : true
			});

			//SETUP
			var oRequest = {
				headers : {},
				method: "GET",
				key: "Products(1)",
				created: true,
				requestUri: sServiceURI + "/Products(1)"
			};

			oParser.parse(oResponseGET200MsgScope, oRequest, undefined, undefined, true);
			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].technical, false, "non-technical");
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "target is read from the provided key");

			oParser.parse(oResponseGET400MsgScope, oRequest, undefined, undefined, true);
			assert.equal(aNewMessages.length, 1, "New technical message created.");
			assert.equal(aNewMessages[0].technical, true, "technical");
			assert.equal(aOldMessages.length, 0);

			oParser.parse(oResponseGET400MsgScope, oRequest, undefined, undefined, true);
			assert.equal(aNewMessages.length, 1, "New technical message created.");
			assert.equal(aNewMessages[0].technical, true, "technical");
			assert.equal(aOldMessages.length, 1, "Old technical message removed.");

			oParser.parse(oResponseGET200MsgScope, oRequest, undefined, undefined, true);
			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].technical, false, "non-technical");
			assert.equal(aOldMessages.length, 2);
			assert.equal(aOldMessages[0].technical, false, "non-technical");
			assert.equal(aOldMessages[1].technical, true);

			oParser.parse(oResponseGET200SuccessMsgScope, oRequest, undefined, undefined, true);
			assert.equal(aNewMessages.length, 0);
			assert.equal(aOldMessages.length, 1);
			assert.equal(aOldMessages[0].technical, false, "non-technical");
			done();
		});
	});

	QUnit.test("ODataMessageParser: Not keep messages when request failed - Message scope not supported", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/northwind";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {

			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			var aOldMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
					aOldMessages = oObj.oldMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			//SETUP
			var oRequest = {
				headers : {},
				method: "GET",
				key: "Products(1)",
				created: true,
				requestUri: sServiceURI + "/Products(1)"
			};

			oParser.parse(oResponseGET200MsgScope, oRequest);
			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].technical, false, "non-technical");
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "target is read from the provided key");

			oParser.parse(oResponseGET400MsgScope, oRequest);
			assert.equal(aNewMessages.length, 1, "New technical message created.");
			assert.equal(aNewMessages[0].technical, true, "technical");
			assert.equal(aOldMessages.length, 1);

			oParser.parse(oResponseGET400MsgScope, oRequest);
			assert.equal(aNewMessages.length, 1, "New technical message created.");
			assert.equal(aNewMessages[0].technical, true, "technical");
			assert.equal(aOldMessages.length, 1, "Old technical message removed.");

			oParser.parse(oResponseGET200MsgScope, oRequest);
			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].technical, false, "non-technical");
			assert.equal(aOldMessages.length, 1);
			assert.equal(aOldMessages[0].technical, true, "non-technical");

			oParser.parse(oResponseGET200SuccessMsgScope, oRequest);
			assert.equal(aNewMessages.length, 0);
			assert.equal(aOldMessages.length, 1);
			assert.equal(aOldMessages[0].technical, false, "non-technical");
			done();
		});
	});

	QUnit.test("ODataMessageParser: Function imports with location", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/function-imports";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {


			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			var aOldMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
					aOldMessages = oObj.oldMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			//SETUP
			var oRequest = {
				created: true,
				// deepPath is calculated in ODataModel#_processSuccess instead of
				// ODataMessageParser#createTarget; deepPath is taken from oRequest.functionTarget
				deepPath : "/Products(1)",
				functionMetadata : {name : "EditProduct"},
				functionTarget : "/Products(1)", // calculated in ODataModel#_processSuccess
				headers : {},
				key: "EditProduct",
				method: "POST",
				requestUri: sServiceURI + "/EditProduct"
			};

			var oResponseGET200 = {
				statusCode: "200",
				body: "OK",
				headers: {
					"location": sServiceURI + "/Products(1)",
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"sap-message": JSON.stringify({
						"code":		"999",
						"message":	"This is test message",
						"severity":	"error",
						"details": []
					})
				}
			};

			var oResponseGET400 = {
				statusCode: "400",
				body: JSON.stringify({
					"error": {
						"message": {
							"value": "Bad Request - ..."
						},
						"code": "999"
					}
				}),
			headers: {
				"location": sServiceURI + "/Products(1)",
				"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;"
			}
		};

			oParser.parse(oResponseGET200, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "Correct target");
			assert.equal(aNewMessages[0].aFullTargets[0], "/Products(1)", "Correct full target");

			oParser.parse(oResponseGET400, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].getTargets()[0], "/Products(1)", "Correct target");
			assert.equal(aNewMessages[0].aFullTargets[0], "/Products(1)", "Correct full target");
			assert.equal(aNewMessages[0].technical, true);

			assert.equal(aOldMessages.length, 1);

			done();
		});
	});

	QUnit.test("ODataMessageParser: technicalDetails", function(assert) {
		var done = assert.async();

		var sServiceURI = "fakeservice://testdata/odata/function-imports";

		var oMetadata = new ODataMetadata(sServiceURI + "/$metadata", {});
		oMetadata.loaded().then(function() {


			var oParser = new ODataMessageParser(sServiceURI, oMetadata);
			// Use processor to get new messages
			var aNewMessages = [];
			var aOldMessages = [];
			oParser.setProcessor({
				getId: function() {
					return "myProcessor";
				},
				fireEvent: function(sType, oObj) {
					aNewMessages = oObj.newMessages;
					aOldMessages = oObj.oldMessages;
				},
				setMessages: function() {},
				resolve: function(sPath){
					return sPath;
				}
			});

			//SETUP
			var oRequest = {
				method: "POST",
				key: "Activate",
				created: true,
				requestUri: sServiceURI + "/Activate"
			};

			var oResponse412 = {
				statusCode: "412",
				body: JSON.stringify({
					"error": {
						"message": {
							"value": "Precondition failed"
						},
						"code": "412"
					}
				}),
				headers: {
					"location": sServiceURI + "/Products(1)",
					"Content-Type": "text/plain;charset=utf-8",
					"DataServiceVersion": "2.0;",
					"preference-applied": "handling=strict"
				}
			};

			oParser.parse(oResponse412, oRequest);

			assert.equal(aNewMessages.length, 1);
			assert.equal(aNewMessages[0].technical, true);
			assert.strictEqual(aNewMessages[0].technicalDetails.headers, oResponse412.headers);
			assert.strictEqual(aNewMessages[0].technicalDetails.statusCode, "412");
			assert.equal(aOldMessages.length, 0);

			done();
		});
	});
});