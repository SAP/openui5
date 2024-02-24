/*global QUnit */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/Label",
	"sap/base/util/isEmptyObject"
], function(MockServer, Control, Element, ODataModelV1, jQuery, ODataModelV2, Label, isEmptyObject) {
	"use strict";

	const sMockUri = "/mock/";
	const sURI = "/myservice/";
	const syncAjax = MockServer._syncAjax; // convenience helper for synchronous ajax calls

	/**
	 * Creates an OData V2 model and waits until the metadata is loaded.
	 *
	 * @param {string} sURI The service URL
	 * @returns {sap.ui.model.odata.v2.ODataModel} The OData model instance
	 */
	async function initModelV2(sURI) {
		const oModel = new ODataModelV2(sURI);
		await oModel.metadataLoaded();
		return oModel;
	}

	/**
	 * Destroys after a timeout the given model and mock server and calls the given function to end the test.
	 *
	 * @param {sap.ui.model.Model} oModel The model to be destroyed
	 * @param {sap.ui.core.util.MockServer} oMockServer The mock server to be destroyed
	 * @param {function} fnDone The callback function to end an async test
	 */
	function cleanup(oModel, oMockServer, fnDone) {
		setTimeout(function() {
			oModel.destroy();
			oMockServer.destroy();
			fnDone();
		}, 0);
	}

	/**
	 * Gets the number of properties of the given object.
	 *
	 * @param {object} oObject The object
	 * @returns {int} The number of properties
	 */
	function countProperties(oObject) {
		return Object.keys(oObject).length;
	}

	/**
	 * Returns the value of the <code>textContent</code> or <code>text</code> property of the given XML node.
	 *
	 * @param {object} oXmlNode The XML node
	 * @returns {string} The <code>textContent</code> or <code>text</code> property of the given XML node
	 */
	function getXmlNodeText(oXmlNode) {
		return oXmlNode.textContent || oXmlNode.text;
	}

	//*********************************************************************************************
	QUnit.module("sap/ui/core/util/MockServer");

	//*********************************************************************************************
	QUnit.test("Basic", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects",
				response: function (oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": "323233"}]');
				}
			}, {
				method: "get", // Implicit Test: Gets uppercased
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}, {
				method: "GET",
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		assert.ok(oMockServer, "Mock server is created");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, "200", "Response status is right");
		assert.deepEqual(oResponse.data, [{
			"id": "323233"
		}], "Response is right");

		oMockServer.stop();
		assert.ok(!oMockServer.isStarted(), "Mock server is stopped");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/projects",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Response not faked");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started again");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/projects",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, "200", "Response status is right");
		assert.deepEqual(oResponse.data, [{
			"id": "323233"
		}], "Response is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test entity read with boolean key property (invalid)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, {
			"sMockdataBaseUrl": sMockdataBaseUrl,
			"bGenerateMissingMockData": false
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/BooleanKeyEntitySet(ThisIsNotABoolean)",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded well");
		assert.equal(oResponse.statusCode, "400", "Response status is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test entity read with boolean key property (true)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, {
			"sMockdataBaseUrl": sMockdataBaseUrl,
			"bGenerateMissingMockData": false
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/BooleanKeyEntitySet(true)",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded well");
		assert.equal(oResponse.data.d.Secret, "May the Force be with you.", "The correct entity was loaded");
		assert.equal(oResponse.statusCode, "200", "Response status is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test entity read with boolean key property (false)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/boolean-key-property/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, {
			"sMockdataBaseUrl": sMockdataBaseUrl,
			"bGenerateMissingMockData": false
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/BooleanKeyEntitySet(false)",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded well");
		assert.equal(oResponse.data.d.Secret, "Only at the end do you realize the power of the Dark Side.", "The correct entity was loaded");
		assert.equal(oResponse.statusCode, "200", "Response status is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test URL parameters with ampersand in value", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection?$filter=startswith(flightDetails,'Smartphones&$Tab&lets')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded well");
		assert.equal(oResponse.data.d.results.length, 0, "No values found for the filter query");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?key1=1&key2=22&key3='h&m'&key4='42\" tv'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded well");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Path with RegExp Pattern", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects2/323234",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data[0].id, "323234", "RegExp groups are used right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Path with placeholder", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects/323234",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data[0].id, "323234", "Id is parsed right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test assertion: Missing method", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		assert.throws(function () {
			oMockServer.start();
		}, /method/, "Throws exception");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test assertion: Missing path", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		assert.throws(function () {
			oMockServer.start();
		}, /path/, "Throws exception");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test assertion: Missing response", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects2/(.*)"
			}]
		});

		assert.throws(function () {
			oMockServer.start();
		}, /response/, "Throws exception");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Two server", function (assert) {
		var oMockServer1 = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects",
				response: function (oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": "323233"}]');
				}
			}, {
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});
		var oMockServer2 = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer1.start();
		assert.ok(oMockServer1.isStarted(), "Mock server 1 is started");
		oMockServer2.start();
		assert.ok(oMockServer2.isStarted(), "Mock server 2 is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, "200", "Response status is right");
		assert.deepEqual(oResponse.data, [{
			"id": "323233"
		}], "Response is right");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/projects2/323234",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data[0].id, "323234", "Id is parsed right");
		oMockServer2.stop();
		assert.ok(!oMockServer2.isStarted(), "Mock server 2 is stopped");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/projects2/323234",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Response is not faked");
		oMockServer1.stop();
		assert.ok(!oMockServer1.isStarted(), "Mock server 1 is stopped");
		oMockServer1.destroy();
		oMockServer2.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Clean up", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects",
				response: function (oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": "323233"}]');
				}
			}, {
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}, {
				method: "GET",
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});
		var oServer = MockServer._getInstance();

		assert.equal(MockServer._aServers.indexOf(oMockServer), 0, "Mock server is registered");
		assert.ok(oMockServer, "Mock server is created");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		assert.equal(MockServer._aFilters.length, 3, "Filters are added to server");
		assert.equal(oServer.responses.length, 3, "Right response length at real sinonfake server obj");
		oMockServer.stop();
		assert.ok(!oMockServer.isStarted(), "Mock server is stopped");
		assert.equal(MockServer._aFilters.length, 0, "Filters are removed from server");
		assert.equal(oServer.responses.length, 0, "Right response length on real sinonfake server obj");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started again");
		assert.equal(MockServer._aFilters.length, 3, "Filters are added to server");
		assert.equal(oServer.responses.length, 3, "Right response length at real sinonfake server obj");
		oMockServer.destroy();
		assert.ok(!oMockServer.isStarted(), "Mock server is destroyed");
		assert.equal(MockServer._aFilters.length, 0, "Filters are removed from server");
		assert.equal(oServer.responses.length, 0, "Right response length on real sinonfake server obj");
		assert.equal(MockServer._aServers.indexOf(oMockServer), -1, "Mock server is not registered anymore");
	});

	//*********************************************************************************************
	QUnit.test("Start / Stop / Destroy all", function (assert) {
		var oMockServer1 = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects",
				response: function (oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": "323233"}]');
				}
			}, {
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});
		var oMockServer2 = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects2/(.*)",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		// code under test
		MockServer.startAll();

		assert.ok(oMockServer1.isStarted(), "Mock server 1 is started");
		assert.ok(oMockServer2.isStarted(), "Mock server 2 is started");

		// code under test
		MockServer.stopAll();

		assert.ok(!oMockServer1.isStarted(), "Mock server 1 is stopped");
		assert.ok(!oMockServer2.isStarted(), "Mock server 2 is stopped");

		// code under test
		MockServer.startAll();

		assert.ok(oMockServer1.isStarted(), "Mock server 1 is started");
		assert.ok(oMockServer2.isStarted(), "Mock server 2 is started");

		// code under test
		MockServer.destroyAll();

		assert.ok(!oMockServer1.isStarted(), "Mock server 1 is stopped");
		assert.ok(!oMockServer2.isStarted(), "Mock server 2 is stopped");
		assert.ok(oMockServer1.bIsDestroyed, "Mock server 1 is destroyed");
		assert.ok(oMockServer2.bIsDestroyed, "Mock server 2 is destroyed");
	});

	//*********************************************************************************************
	QUnit.test("Test Config: autoRespondAfter & async", function (assert) {
		var done = assert.async();

		MockServer.config({autoRespondAfter: 10});
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var iBefore = new Date().getTime();

		jQuery.ajax({
			url: "/myservice/projects/323234",
			dataType: "json",
			success: function () {
				assert.ok(true, "Mock server responded");
				var iNow = new Date().getTime();
				var iRespondedAfter = iNow - iBefore;
				// FF seem to have to strange timing behaviour when the browser is started
				// This is why we only use 950 ms here -> this is fair enough, as we only want to check hear if the response is delayed
				// and the real implemention uses browser setTimeout functionality
				assert.ok(iRespondedAfter > 9, "Response after 10ms (" + iRespondedAfter + " ms)");
				oMockServer.destroy();
				MockServer.config({});
				done();
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("Test Config: autoRespond false & async", function (assert) {
		var done = assert.async();

		MockServer.config({autoRespond: false});
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respond(200, {
						"Content-Type": "application/json"
					}, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		jQuery.ajax({
			url: "/myservice/projects/323234",
			dataType: "json",
			success: function () {
				assert.ok(true, "Mock server responded");
				oMockServer.destroy();
				MockServer.config({});
				done();
			}
		});
		window.setTimeout(function () {
			MockServer.respond();
		}, 1000);
	});

	//*********************************************************************************************
	QUnit.test("xhr.respondJSON", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respondJSON(200, null, '[{ "id": ' + id + ' }]');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects/323234",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data[0].id, "323234", "Right json is responded");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("xhr.respondXML", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respondXML(200, null, '<test>works</test>');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects/323234",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(getXmlNodeText(oResponse.data.firstChild), "works", "Response is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("xhr.respondFile", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice",
			requests: [{
				method: "GET",
				path: "/projects/:id",
				response: function (oXhr, id) {
					oXhr.respondFile(200, null, 'test-resources/sap/ui/core/qunit/mockserver/testdata/respondFile/mockServerJSON.json');
				}
			}, {
				method: "GET",
				path: "/projects2/:id",
				response: function (oXhr, id) {
					oXhr.respondFile(200, null, 'test-resources/sap/ui/core/qunit/mockserver/testdata/respondFile/mockServerXML.xml');
				}
			}]
		});

		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/projects/323234",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.test, "works", "JSON: Response is right");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/projects2/323234",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(getXmlNodeText(oResponse.data.firstChild), "works", "Response is right");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks - example - use of callbacks in rest API", function (assert) {
		let iTesterPre = 0;
		var oMockServer = new MockServer({
			rootUri: "/mydummyservice/",
			requests: [{
				method: "GET",
				path: new RegExp("path(\\?.*)?"),
				response: function (oXhr, sUrlParameters) {
					var self = oMockServer;
					self.fireEvent(MockServer.HTTPMETHOD.GET + 'path' + ':before', { oXhr: oXhr, sUrlParameters: sUrlParameters });
					//console.log("processing");
					oXhr.responseText = "test";
					self.fireEvent(MockServer.HTTPMETHOD.GET + 'path' + ':after', { oXhr: oXhr });
					oXhr.respondJSON(200, null, '{"name": "' + oXhr.responseText + '"}');
				}
			}]
		});
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.getParameter("oXhr").responseText = "finished";
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "path");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "path");
		oMockServer.start();

		// code under test
		var oResponse = syncAjax({
			url: "/mydummyservice/path?customParameter=123"
		});

		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data.name, "finished");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, 'path');
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, 'path');

		// code under test
		oResponse = syncAjax({
			url: "/mydummyservice/path?customParameter=123"
		});

		assert.equal(iTesterPre, 0, "Pre function was not executed");
		assert.equal(oResponse.data.name, "test");
		assert.ok(oResponse.success, "Mock server responded");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get entity set count", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.getParameter("oFilteredData").results.splice(0, 1);
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "FlightCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data, 99, "callback on $count on entityset attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded  - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(oResponse.data, 100, "callback on $count on entityset detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get entity set - calls to two entity sets", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent, oXhr, args) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent, oXhr, oFilteredData) {
			oEvent.getParameter("oFilteredData").results.splice(0, 1);
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre);
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost);

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data, 99, "callback on $count on entityset attach");
		iTesterPre = 0;

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data, 99, "callback on $count on entityset attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre);
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(oResponse.data, 100, "callback on $count on entityset attach");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(oResponse.data, 100, "callback on $count on entityset attach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get entity set query option - get data", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.getParameter("oFilteredData").results.splice(0, 1);
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "FlightCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data.d.results.length, 99, "callback on query options on entityset attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded  - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(oResponse.data.d.results.length, 100, "callback on query options on entityset detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get entity set query option - single entry", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.getParameter("oEntry").CARRNAME = "CARRNAME 2";
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data.d.CARRNAME, "CARRNAME 2", "callback on single entry on entityset attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded  - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(oResponse.data.d.CARRNAME, "CARRNAME 1", "callback on single entry on entityset detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get navigation property-count", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.getParameter("oFilteredData").results.splice(0, 1);
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data, 99, "callback on navigation property count attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded  - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(oResponse.data, 100, "callback on navigation property count detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Get entity set navigation property - query option", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			oEvent.mParameters.oFilteredData.results.splice(0, 1);
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights?$skip=10",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(oResponse.data.d.results.length, 89, "callback on navigation property query option attach");
		iTesterPre = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.GET, fnCbPre, "CarrierCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.GET, fnCbPost, "CarrierCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights?$skip=10",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded  - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(oResponse.data.d.results.length, 90, "callback on navigation property query option detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Post", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPost = 0;
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			iTesterPost = iTesterPost + 1;
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.POST, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.POST, fnCbPost, "FlightCollection");
		var oPostResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: '{"carrid1":"BB","connid":"007","fldate":"\/Date(1287532800000)\/"}'
		});

		assert.ok(oPostResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(iTesterPost, 1, "Post function was executed");
		assert.equal(oPostResponse.statusCode, 201, "callback on post attach");
		iTesterPre = 0;
		iTesterPost = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.POST, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.POST, fnCbPost, "FlightCollection");
		oPostResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: '{"carrid1":"BB","connid":"007","fldate":"\/Date(1287532800000)\/"}'
		});
		assert.ok(oPostResponse.success, "Mock server responded - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(iTesterPost, 0, "Post function was executed");
		assert.equal(oPostResponse.statusCode, 201, "callback on post detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Put", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPost = 0;
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			iTesterPost = iTesterPost + 1;
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.PUT, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.PUT, fnCbPost, "FlightCollection");
		var oPutResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'PUT',
			data: '{"carrid":"BB","connid":"009"}'
		});

		assert.ok(oPutResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(iTesterPost, 1, "Post function was executed");
		assert.equal(oPutResponse.statusCode, 204, "callback on put attach");
		iTesterPre = 0;
		iTesterPost = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.PUT, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.PUT, fnCbPost, "FlightCollection");
		oPutResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'PUT',
			data: '{"carrid":"BB","connid":"009"}'
		});
		assert.ok(oPutResponse.success, "Mock server responded - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(iTesterPost, 0, "Post function was executed");
		assert.equal(oPutResponse.statusCode, 204, "callback on put detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Merge", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPost = 0;
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			iTesterPost = iTesterPost + 1;
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.MERGE, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.MERGE, fnCbPost, "FlightCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'MERGE',
			dataType: "json",
			data: '{"carrid":"BB","connid":"009"}'
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(iTesterPost, 1, "Post function was executed");
		assert.equal(oResponse.statusCode, 204, "callback on merge attach");
		iTesterPre = 0;
		iTesterPost = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.MERGE, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.MERGE, fnCbPost, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'MERGE',
			dataType: "json",
			data: '{"carrid":"BB","connid":"009"}'
		});

		assert.ok(oResponse.success, "Mock server responded - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(iTesterPost, 0, "Post function was executed");
		assert.equal(oResponse.statusCode, 204, "callback on merge detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Patch", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPost = 0;
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			iTesterPost = iTesterPost + 1;
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.PATCH, fnCbPre, "FlightCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.PATCH, fnCbPost, "FlightCollection");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'PATCH',
			dataType: "json",
			data: '{"carrid":"BB","connid":"009"}'
		});

		assert.ok(oResponse.success, "Mock server responded - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(iTesterPost, 1, "Post function was executed");
		assert.equal(oResponse.statusCode, 204, "callback on merge attach");
		iTesterPre = 0;
		iTesterPost = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.PATCH, fnCbPre, "FlightCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.PATCH, fnCbPost, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'MERGE',
			dataType: "json",
			data: '{"carrid":"BB","connid":"009"}'
		});

		assert.ok(oResponse.success, "Mock server responded - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(iTesterPost, 0, "Post function was executed");
		assert.equal(oResponse.statusCode, 204, "callback on merge detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Callbacks Delete", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});
		let iTesterPost = 0;
		let iTesterPre = 0;

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var fnCbPre = function (oEvent) {
			iTesterPre = iTesterPre + 1;
		};
		var fnCbPost = function (oEvent) {
			iTesterPost = iTesterPost + 1;
		};

		oMockServer.attachBefore(MockServer.HTTPMETHOD.DELETE, fnCbPre, "CarrierCollection");
		oMockServer.attachAfter(MockServer.HTTPMETHOD.DELETE, fnCbPost, "CarrierCollection");
		var oDelResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')",
			type: 'DELETE'
		});

		assert.ok(oDelResponse.success, "Mock server responded - delete - attach");
		assert.equal(iTesterPre, 1, "Pre function was executed");
		assert.equal(iTesterPost, 1, "Post function was executed");
		assert.equal(oDelResponse.statusCode, 204, "callback on delete attach");
		iTesterPre = 0;
		iTesterPost = 0;
		oMockServer.detachBefore(MockServer.HTTPMETHOD.DELETE, fnCbPre, "CarrierCollection");
		oMockServer.detachAfter(MockServer.HTTPMETHOD.DELETE, fnCbPost, "CarrierCollection");
		oDelResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 2')",
			type: 'DELETE'
		});
		assert.ok(oDelResponse.success, "Mock server responded - detach");
		assert.equal(iTesterPre, 0, "Pre function was executed");
		assert.equal(iTesterPost, 0, "Post function was executed");
		assert.equal(oDelResponse.statusCode, 204, "callback on merge detach");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test XSRF fetch request", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/$metadata",
			headers: {
				"x-csrf-token": "Fetch"
			}
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 200, "CSRF token fetched");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SomeNonExistentEntity"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "CSRF token fetched");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test undefined key", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var oPostResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: '{"carrid":"BB","connid":"007"}'
		});
		assert.ok(oPostResponse.success, "Mock server responded the POST resquest");
		assert.equal(oPostResponse.statusCode, 201, "resource successfully created");
		assert.ok(oPostResponse.data.uri, "resource uri available");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test partial and mixed json mockdata", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection from json file");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SubscriptionCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "SubscriptionCollection");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': false
		});
		oMockServer.start();

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection from json file");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SubscriptionCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "SubscriptionCollection");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': true
		});
		oMockServer.start();

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection from json file");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SubscriptionCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "SubscriptionCollection");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl, null);
		oMockServer.start();

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SubscriptionCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "SubscriptionCollection");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': null,
			'bGenerateMissingMockData': false
		});
		oMockServer.start();

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "FlightCollection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/SubscriptionCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "SubscriptionCollection");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Custom Query Options", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection?sap-client=100",
			dataType: "json"
		});

		assert.ok(oResponse.success, "?sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$top=1&sap-client=100",
			dataType: "json"
		});

		assert.ok(oResponse.success, "?$top=1&sap-client=100");
		assert.equal(oResponse.data.d.results.length, 1, "?$top=1&sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$sap-client=100",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "?$sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')?sap-client=100",
			dataType: "json"
		});

		assert.ok(oResponse.success, "?sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')?$sap-client=100",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "?$sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights?sap-client=100",
			dataType: "json"
		});

		assert.ok(oResponse.success, "?sap-client=100");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights?$sap-client=100",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "?$sap-client=100");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test orderby on expended property", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection?$expand=FlightCarrier&$orderby=FlightCarrier/CARRNAME",
			dataType: "json"
		});

		assert.ok(oResponse.success, "");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test request to service uri", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		let oResponse = syncAjax({
			url: sURI,
			type: 'HEAD',
			dataType: "json"
		});

		assert.ok(oResponse.success);

		// code under test
		oResponse = syncAjax({
			url: sURI,
			dataType: "json"
		});

		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.EntitySets.length, 9);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/?sap-client=200",
			type: 'HEAD',
			dataType: "json"
		});

		assert.ok(oResponse.success);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test get/set entity set data", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 3);
		var aFlights = oMockServer.getEntitySetData("FlightCollection");

		aFlights = [];
		oMockServer.setEntitySetData("FlightCollection", aFlights);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 0);
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		oMockServer.start();
		aFlights = oMockServer.getEntitySetData("FlightCollection");
		assert.equal(aFlights, undefined);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test deep insert!", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 18);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1&$expand=FlightCarrier",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 1);
		var oDeepCreate = oResponse.data.d.results[0];

		oDeepCreate["FlightCarrier"].CARRNAME = "Deeply Created";

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: JSON.stringify(oDeepCreate)
		});

		assert.ok(oResponse.success, "Mock server responded the POST resquest");
		assert.equal(oResponse.statusCode, 201, "resource successfully created");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 19);
		oMockServer.setEntitySetData("CarrierCollection", []);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: JSON.stringify(oDeepCreate)
		});

		assert.ok(oResponse.success, "Mock server responded the POST resquest");
		assert.equal(oResponse.statusCode, 201, "resource successfully created");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 1);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test mockdata linkage to entityset", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveItemSubCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "");
		assert.equal(oResponse.data.d.results.length, 2, "");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "");
		assert.equal(oResponse.data.d.results.length, 7, "");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test ignore missing properties", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection?$select=flightbooking/SMOKER",
			dataType: "json"
		});

		assert.ok(oResponse.success);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$select=fldate,flightDetails/countryFrom",
			dataType: "json"
		});

		assert.ok(oResponse.success);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Relationship name with multiple dots", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/EVALUATIONS('ID 1')/FILTERS?$format=json",
			dataType: "json"
		});

		assert.ok(oResponse.success);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test load json mockdata from list of entity sets names", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/";
		const oMockServer = new MockServer({rootUri: sURI});
		// Check simulate with specifying specific aEntitySetsNames (entity sets to fetch)

		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': false,
			'aEntitySetsNames': ["TravelagencyCollection", "FlightCollection"]
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server has started");

		// code under test, check FlightCollection
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "FlightCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection json file");

		// code under test, check TravelagencyCollection
		oResponse = syncAjax({
			url: "/myservice/TravelagencyCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "TravelagencyCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "TravelagencyCollection json file");

		// code under test, check CarrierCollection
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "CarrierCollection not retrieved since it was not in aEntitySetsNames");
		oMockServer.destroy();
		// Check simulate with specifying empty list of aEntitySetsNames - should behave as if no list was sent
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': false,
			'aEntitySetsNames': []
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server has started");

		// code under test, check FlightCollection
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "FlightCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection json file");

		// code under test, check TravelagencyCollection
		oResponse = syncAjax({
			url: "/myservice/TravelagencyCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "TravelagencyCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "TravelagencyCollection json file");

		// code under test, check CarrierCollection
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 18, "CarrierCollection json file");
		oMockServer.destroy();
		// Check simulate without specifying entity sets to fetch - should retrieve all entity sets
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': false
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server has started");

		// code under test, check FlightCollection
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "FlightCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 3, "FlightCollection json file");

		// code under test, check TravelagencyCollection
		oResponse = syncAjax({
			url: "/myservice/TravelagencyCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "TravelagencyCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "TravelagencyCollection json file");

		// code under test, check CarrierCollection
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 18, "CarrierCollection json file");
		oMockServer.destroy();
		// Check simulate with specifying wrong aEntitySetsNames - should not retrieve any entity set
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': false,
			'aEntitySetsNames': ["none01", "none02"]
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server has started");

		// code under test, check FlightCollection
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "FlightCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "FlightCollection json file");

		// code under test, check TravelagencyCollection
		oResponse = syncAjax({
			url: "/myservice/TravelagencyCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "TravelagencyCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "TravelagencyCollection json file");

		// code under test, check CarrierCollection
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection - mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "CarrierCollection not retrieved since it was not in aEntitySetsNames");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test EDM.Binary", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/patient/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, "test-resources/sap/ui/core/qunit/mockserver/testdata/patient/");
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test, test binary of type X'<hexadecimal number>'
		var oResponse = syncAjax({
			url: "/myservice/Patient(X'49534830317A67634C684A75484848746B4C4372444A61477A5534')",
			dataType: "json"
		});

		assert.ok(oResponse.success);
		assert.ok(oResponse.data.d);

		// code under test, test for binary of type binary'<hexadecimal number>'
		oResponse = syncAjax({
			url: "/myservice/Patient(binary'49534830317A67634C684A75484848746B4C4372444A61477A5534')",
			dataType: "json"
		});

		assert.ok(!oResponse.success);
		assert.equal(oResponse.statusCode, 404);

		// code under test, test for an illegal binary value
		oResponse = syncAjax({
			url: "/myservice/Patient('notBinary')",
			dataType: "json"
		});

		assert.ok(!oResponse.success);
		assert.equal(oResponse.statusCode, 400);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test $format", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')?$format=json",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection('carrid 1')?$format=json");
		assert.ok(oResponse.data.d, "CarrierCollection('carrid 1')?$format=json");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$format=json",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection?$format=json");
		assert.ok(oResponse.data.d.results, "CarrierCollection?$format=json");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$format=json&$top=3",
			dataType: "json"
		});

		assert.ok(oResponse.success, "CarrierCollection?$format=json&$top=3");
		assert.equal(oResponse.data.d.results.length, 3, "CarrierCollection?$format=json&$top=3");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')?$format=xml",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "CarrierCollection('carrid 1')?$format=xml");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$format=xml",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "CarrierCollection?$format=xml");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData get single entry", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d, "single entry no OData system query options");
		assert.equal(oResponse.data.d.__metadata.uri, "/myservice/CarrierCollection('carrid%201')", "single key");
		syncAjax({
			url: "/myservice/CarrierCollection(carrid='carrid 1')",
			dataType: "json"
		});
		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d, "single entry no OData system query options");
		assert.equal(oResponse.data.d.__metadata.uri, "/myservice/CarrierCollection('carrid%201')", "single key");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/?$select=carrid",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.carrid, "single entry with OData system query options");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection/?$top=1&$select=flightDetails/cityFrom,flightDetails/cityTo,fldate,FlightCarrier/CARRNAME&$expand=FlightCarrier",
			dataType: "json"
		});

		assert.ok(oResponse.success, "$top=1&$select=flightDetails/cityFrom,flightDetails/cityTo,fldate");
		assert.ok(oResponse.data.d.results[0].flightDetails.cityFrom, "$top=1&$select=flightDetails/cityFrom,flightDetails/cityTo,fldate");
		assert.ok(oResponse.data.d.results[0].flightDetails.cityTo, "$top=1&$select=flightDetails/cityFrom,flightDetails/cityTo,fldate");
		assert.ok(oResponse.data.d.results[0].fldate, "$top=1&$select=flightDetails/cityFrom,flightDetails/cityTo,fldate");
		assert.ok(oResponse.data.d.results[0].FlightCarrier.CARRNAME, "$top=1&$select=FlightCarrier/CARRNAME&$expand=FlightCarrier");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/?$selsdfect=carrid",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "fake query option");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/?$top=1",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "query option not valid for single entry");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Draft-enabled OData", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/draft/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/SalesOrder",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData get entity set", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data, 100, "$count on entityset");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection/$count?$top=10",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data, 10, "$count on entityset");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "entity set no opts.");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$top=1&format=json",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 1, "entity set with opts.");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection/?$top=1",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 1, "entity set / with opts.");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollect",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "entitySet doesn't exist ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$fsdf=sfsdf",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "query option dosn't exist");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData navigation properties", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "navigation to collection");
		assert.equal(oResponse.data.d.results[0].__metadata.type, "RMTSAMPLEFLIGHT.Flight", "simple navigation returns flight");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1&$expand=flightbooking",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].fldate, oResponse.data.d.results[0].flightbooking.fldate, "FlightCollection?$top=1&$expand=flightbooking");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/$count",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data, 100, "navigation $count");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/$count?$skip=10",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data, 90, "navigation $count");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights/?$select=carrid,connid",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "navigation to collection with OData query");
		assert.equal(oResponse.data.d.results[0].__metadata.type, "RMTSAMPLEFLIGHT.Flight",
			"navigation to collection with OData query returns flight");
		assert.equal(countProperties(oResponse.data.d.results[0]), 3, "navigation to collection with OData query returns only 2 properties ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		var skey = oResponse.data.d.results[0].__metadata.uri;

		// code under test
		oResponse = syncAjax({
			url: skey + "/FlightCarrier",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.carrid, "navigation to one entry");
		assert.equal(oResponse.data.d.__metadata.type, "RMTSAMPLEFLIGHT.Carrier", "navigation to one entry returns Carrier ");

		// code under test
		oResponse = syncAjax({
			url: skey + "/FlightCarrier?$select=carrid",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.carrid, "navigation to one entry");
		assert.equal(oResponse.data.d.__metadata.type, "RMTSAMPLEFLIGHT.Carrier", "navigation to one entry returns Carrier ");
		assert.equal(countProperties(oResponse.data.d), 2, "navigation to singel entry with OData query returns only 1 properties ");

		// code under test
		oResponse = syncAjax({
			url: skey + "/FlightCarrier?$top=1",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "navigation to singel entry with not valid OData query ");

		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData paging top and skip", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$top=2&$skip=1",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 2, "query chaining worked");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "top and skip returned ok");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$skip=1&$top=1",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 1, "query chaining worked");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "skip and top returned ok");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$skip=1&$top=sdlfksdf",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "top invalid value ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$skip=1.5",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "skip invalid value [not a number]");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$skip=5,",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "skip invalid value [ends with ,]");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$skip=-5",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "skip invalid value [negative]");
		oMockServer.destroy();
	});

//*********************************************************************************************
	QUnit.test("test OData orderby", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=type",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "simple orderby single property");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=type asc",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "simple orderby single property asc");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=type desc",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Vacation", "simple orderby single property desc");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=entitlement,pendingitems",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Unpaid Leave", "multiple orderby worked");
		assert.equal(oResponse.data.d.results[2].type, "Sick Leave", "multiple orderby worked");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=entitlement desc, pendingitems asc",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "multiple orderby asc/desc");
		assert.equal(oResponse.data.d.results[2].type, "Vacation", "multiple orderby asc/desc");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=entitlement%20desc%2Cpendingitems%20asc",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "encoded multiple orderby asc/desc");
		assert.equal(oResponse.data.d.results[2].type, "Vacation", "encoded multiple orderby asc/desc");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=entitlement descjkh",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "orderby invalid order param");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=entitlementFood",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "orderby invalid param");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$orderby=type%20asc",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "encoded url orderby single property asc");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $filter", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test, test for filtering while sample data contains null values
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=substringof('e', organizationunit)",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock didn't crash on null");
		assert.equal(oResponse.data.d.results.length, 2, "");

		// code under test, test for filtering by comma
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=substringof(',', type)",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' or type eq 'Sick Leave'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A or B");
		assert.equal(oResponse.data.d.results.length, 2, "A or B");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=(type eq 'Vacation' or type eq 'Sick Leave')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "(A or B)");
		assert.equal(oResponse.data.d.results.length, 2, "(A or B)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection/$count?$filter=(type eq 'Vacation' or type eq 'Sick Leave')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "$count on (A or B)");
		assert.equal(oResponse.data, 2, "(A or B)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=(((type eq 'Vacation' or type eq 'Sick Leave')",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "(((A or B)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' or type eq 'Sick Leave' or type eq 'Unpaid Leave'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A or B or C");
		assert.equal(oResponse.data.d.results.length, 3, "A or B or C");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' or ",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "malformed: A or ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' and type eq 'Sick Leave'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A and B");
		assert.equal(oResponse.data.d.results.length, 0, "A and B");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' and type eq 'Sick Leave' or type eq 'Vacation'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A and B or C");
		assert.equal(oResponse.data.d.results.length, 1, "A and B or C");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' or type eq 'Sick Leave' and type eq 'Sick Leave'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A or B and C");
		assert.equal(oResponse.data.d.results.length, 1, "A or B and C");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=(type eq 'Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "(A)");
		assert.equal(oResponse.data.d.results.length, 1, "(A)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' and (type eq 'Sick Leave' or type eq 'Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A op (B op C)");
		assert.equal(oResponse.data.d.results.length, 1, "A op (B op C)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' and (type eq 'Sick Leave') or type eq 'Vacation'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "A op (B) op C");
		assert.equal(oResponse.data.d.results.length, 1, "A op (B) op C");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=(type eq 'Vacation' and type eq 'Sick Leave') or type eq 'Vacation'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "(A op B) op C");
		assert.equal(oResponse.data.d.results.length, 1, "(A op B) op C");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=(type eq 'Vacation' and type eq 'Sick Leave') or (type eq 'Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "(A op B) op (C)");
		assert.equal(oResponse.data.d.results.length, 1, "(A op B) op (C)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=((type eq 'Vacation' and type eq 'Sick Leave') or type eq 'Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "((A op B) op C)");
		assert.equal(oResponse.data.d.results.length, 1, "((A op B) op C)");

		// code under test
		oResponse = syncAjax({
				url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation' or ( type eq 'Sick Leave' and  substringof('elina', type))",
				dataType: "json"
			});

		assert.ok(oResponse.success, "A op (B)");
		assert.equal(oResponse.data.d.results.length, 1, "A op (B)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=substringof('ac', type)",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Vacation", "filter substringof('ac', type)");

		// code under test
		oResponse = syncAjax({
				url: "/myservice/LeaveHeaderCollection?$skip=0&$top=4&$filter=(substringof('',type)%20or%20substringof('Pink%20Straits%20Corp.',type))",
				dataType: "json"
			});

		assert.ok(oResponse.success, "(substringof() op substringof())");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=startswith(type, 'Va')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Vacation", "filter startswith(type, 'Va')");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=endswith(type, 've')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "filter endswith(type, 've')");
		assert.equal(oResponse.data.d.results.length, 2, "filter endswith(type, 've')");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type eq 'Vacation'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Vacation", "filter type eq 'Vacation'");
		assert.equal(oResponse.data.d.results.length, 1, "filter type eq 'Vacation'");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type ne 'Vacation'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "filter type ne 'Vacation'");
		assert.equal(oResponse.data.d.results.length, 2, "filter type ne 'Vacation'");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid gt 6",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Unpaid Leave", "filter itemid gt 6'");
		assert.equal(oResponse.data.d.results.length, 1, "itemid gt 6'");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid lt 6",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 5, "itemid lt 6");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid ge 6",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 2, "itemid le 6");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid le 6",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 6, "itemid le 6");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid lfde 6",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "filter option doesn't exist");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemidFood le 6",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "filter path doesn't exist");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection?$filter=itemid%20le%206",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 6, "itemid%20le%206");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$filter=type%20ne%20%27Vacation%27",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].type, "Sick Leave", "type%20ne%20%27Vacation%27");
		assert.equal(oResponse.data.d.results.length, 2, "type%20ne%20%27Vacation%27");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";// url to the service metadata document
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$filter=flightDetails/cityFrom eq 'cityFrom 1'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 1, "flightDetails/cityFrom eq 'cityFrom 1'");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/northwind/metadata.xml";
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': "test-resources/sap/ui/core/qunit/mockserver/testdata/northwind/",
			'bGenerateMissingMockData': true
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$filter=Discontinued eq true",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 3, "$filter=Discontinued eq true");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$top=1&$orderby=ProductID desc",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results[0].ProductID, 20, "$filter=Discontinued eq 1");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$filter=UnitsInStock lt 40",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 15, "$filter=UnitsInStock lt 40");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$filter=(UnitsInStock eq 120)",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 1, "$filter=(UnitsInStock eq 120)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products(5)/Category",
			dataType: "json"
		});

		assert.ok(oResponse.data.d.CategoryName, "Products(5)/Category");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$filter=UnitsInStock eq (120)",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 1, "$filter=UnitsInStock eq (120)");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Order_Details?$filter=UnitPrice le 100M",
			dataType: "json"
		});

		assert.ok(oResponse, "$filter=UnitPrice le 100M");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Order_Details?$filter=UnitPrice le 100m",
			dataType: "json"
		});

		assert.ok(oResponse, "$filter=UnitPrice le 100m");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$top=20&$filter=Category/CategoryName eq 'Beverages'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "$filter=Category/CategoryName eq 'Beverages'");
		assert.ok(!oResponse.data.d.results[0].Category.CategoryName);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Products?$top=20&$filter=Category/CategoryName eq 'Beverages'&$expand=Category",
			dataType: "json"
		});

		assert.ok(oResponse.success, "/myservice/Products?$top=20&$filter=Category/CategoryName eq 'Beverages'&$expand=Category");
		assert.equal(oResponse.data.d.results[0].Category.CategoryName, "Beverages");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $filter datetimeoffset and datetime", function (assert) {
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate("test-resources/sap/ui/core/qunit/mockserver/testdata/shopping/metadata.xml",
			"test-resources/sap/ui/core/qunit/mockserver/testdata/shopping/");
		oMockServer.start();
		[
			"ChangedAt gt datetimeoffset'2015-04-02T21:59:59Z' and ChangedAt lt datetimeoffset'2015-04-02T22:00:01Z'",
			"ChangedAt gt datetimeoffset'2015-04-02T21:59:59.999Z'"
				+ " and ChangedAt lt datetimeoffset'2015-04-02T22:00:00.001Z'",
			"ChangedAt gt datetimeoffset'2015-04-02T22:59:59.999+01:00'"
				+ " and ChangedAt lt datetimeoffset'2015-04-02T23:00:00.001+01:00'",
			"ChangedAt gt datetimeoffset'2015-04-02T21:59:59.9999999Z'"
				// mockserver supports only a precision of 3; .0000001 does not work
				+ " and ChangedAt lt datetimeoffset'2015-04-02T22:00:00.001Z'"
		].forEach((sFilter) => {

			// code under test
			const oResponse = syncAjax({
				url: "/myservice/Reviews?$top=5&$filter=" + sFilter,
				dataType: "json"
			});

			assert.ok(oResponse.success, "DateTimeOffset $filter=" + sFilter);
			assert.strictEqual(oResponse.data.d.results.length, 1);
			assert.strictEqual(oResponse.data.d.results[0].Id, "00505691-115B-1EE5-98EF-D8AB48B28A78");
		});
		[// all values are treated as UTC timestamps
			"ChangedAt gt datetime'2015-04-02T21:59:59' and ChangedAt lt datetime'2015-04-02T22:00:01'",
			"ChangedAt gt datetime'2015-04-02T21:59:59.999' and ChangedAt lt datetime'2015-04-02T22:00:00.001'",
			// mockserver supports only a precision of 3; .0000001 does not work
			"ChangedAt gt datetime'2015-04-02T21:59:59.9999999' and ChangedAt lt datetime'2015-04-02T22:00:00.001'"
		].forEach((sFilter) => {

			// code under test
			const oResponse = syncAjax({
				url: "/myservice/Reviews?$top=5&$filter=" + sFilter,
				dataType: "json"
			});

			assert.ok(oResponse.success, "DateTime $filter=" + sFilter);
			assert.strictEqual(oResponse.data.d.results.length, 1);
			assert.strictEqual(oResponse.data.d.results[0].Id, "00505691-115B-1EE5-98EF-D8AB48B28A78");
		});
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $select", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$select=type",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(countProperties(oResponse.data.d.results[0]), 2, "select 1 property");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$select=type, availablebalance",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(countProperties(oResponse.data.d.results[0]), 3, "select 2 properties");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?%24select=type%2Cavailablebalance",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(countProperties(oResponse.data.d.results[0]), 3, "select 2 properties encoded");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$select=*",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(countProperties(oResponse.data.d.results[0]), 8, "select all properties by *");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$select=sdfsdf",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "select parm invalid");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $select and $expand with selection on results of navigation property", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/shopping/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/shopping/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/Products('HT-2001')?$select=Name,Price,CurrencyCode,Reviews/UserDisplayName,Reviews/Rating&$expand=Reviews",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.Reviews.results.length, 9, "Not all expanded properties were returned");
		assert.equal(oResponse.data.d.Reviews.results[3].Rating, 1, "Error fetching expanded navigation property of Reviews");
		assert.equal(oResponse.data.d.Reviews.results[3].UserDisplayName, "Romain Le Mason", "Error fetching expanded navigation property UserDisplayName");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $inlinecount", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$top=3&$inlinecount=allpages",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.__count, 3, "inlinecount = allpages, with count = 3 ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$inlinecount=none",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.__count, undefined, "inlinecount = none,  No count ");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$inlinecount=sfg",
			dataType: "json"
		});

		assert.ok(!oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "inlinecount parm invalid");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?$inlinecount=",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.statusCode, 200, "inlinecount parm is missing");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData $expand", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$expand=carrierFlights",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.results[0].carrierFlights.results[0].CURRENCY, "expand with multiplicity many");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1&$expand=FlightCarrier",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.results[0].FlightCarrier.CARRNAME, "expand with multiplicity one");
		assert.equal(oResponse.data.d.results.length, 1, "expand and top");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(!oResponse.data.d.results[0].FlightCarrier.CARRNAME, "Expand didn't changed the data");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1&$expand=FlightCarrier, flightbooking",
			dataType: "json"

		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.results[0].FlightCarrier.CARRNAME, "expand with 2 params,first ok");
		assert.ok(!oResponse.data.d.results[0].flightBooking, "expand with 2 params, second ok");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$expand=carrierFlights",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data.d.results[0].carrierFlights.results[0].CURRENCY, "expand with multiplicity many");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')/carrierFlights?$expand=flightbooking",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "Expand with nav- return 100 nav entries");
		assert.equal(oResponse.data.d.results[0].fldate, oResponse.data.d.results[0].flightbooking.fldate);

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection?$expand=carrierFlights/flightbooking",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results[0].__metadata.type, "RMTSAMPLEFLIGHT.Carrier",
			"Expand on carrier collection with deepDown, result of type carrier collection");
		assert.equal(oResponse.data.d.results[0].carrierFlights.results[0].__metadata.type, "RMTSAMPLEFLIGHT.Flight",
			"Expand deepDown first level, entry of type Flight");
		assert.ok(!isEmptyObject(oResponse.data.d.results[0].carrierFlights.results[0].flightBookings),
			"Expand deepDown second level, flightBookings not in expand, not empty");
		assert.ok(oResponse.data.d.results[0].carrierFlights.results[0].flightBookings.__deferred,
			"Expand deepDown second level, flightBookings not in expand, not expanded");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/CarrierCollection('carrid 1')?$expand=carrierFlights/flightbooking",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.__metadata.type, "RMTSAMPLEFLIGHT.Carrier",
			"Expand on carrier entry with deepDown, result of type carrier ");
		assert.equal(oResponse.data.d.carrierFlights.results[0].__metadata.type, "RMTSAMPLEFLIGHT.Flight",
			"Expand deepDown first level, entry of type Flight");
		assert.ok(!isEmptyObject(oResponse.data.d.carrierFlights.results[0].flightBookings),
			"Expand deepDown second level, flightBookings not in expand, not empty");
		assert.ok(oResponse.data.d.carrierFlights.results[0].flightBookings.__deferred,
			"Expand deepDown second level, flightBookings not in expand, not expanded");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection?$top=1&$expand=FlightFood",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "expand with false navigation property path");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/metadata.xml";
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test, deep multi navigation expand
		oResponse = syncAjax({
			url: "/myservice/AccountCollection('accountID 1')?$expand=Contacts/Attachments,Contacts/Account",
			dataType: "json"
		});

		assert.ok(oResponse.success, "200");
		assert.equal(oResponse.data.d.Contacts.results[0].Attachments.results[0].name, "name 1", "Contacts/Attachments");
		assert.equal(oResponse.data.d.Contacts.results[0].Account.name1, "name1 1", "Contacts/Account");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test OData search and search-focus URL parameter", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test, search with search-focus on porperty employeeid
		var oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?search=JSM&search-focus=employeeid",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded with success");
		assert.equal(oResponse.data.d.results.length, 3, "3 entries found with search and search-focus (key)");

		// code under test, no search focus (=search on all key fields)
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?search=JSM",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded with success");
		assert.equal(oResponse.data.d.results.length, 3, "3 entries found without search-focus (only search)");

		// code under test, non-key search focus
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?search=53&search-focus=entitlement",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded with success");
		assert.equal(oResponse.data.d.results.length, 2, "2 entries found with search and non-key search-focus");

		// code under test, neagtive test: search with not existing value
		oResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection?search=HelloWorld",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded with success");
		assert.equal(oResponse.data.d.results.length, 0, "0 entries found with search for not existing value");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	//Expand and multi select
	QUnit.test("Test Expand & MultiSelect entries", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/expand-multi-select/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FRA_CV_ExcludedTermList?$select=to_ListTypeGroupAssignment/ListTypeGroup,to_ListTypeGroupAssignment/ListTypeGroupDescription&$expand=to_ListTypeGroupAssignment",
			dataType: "json"
		});

		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 100, "Expand and select multi response count");
		assert.equal(oResponse.data.d.results[0].to_ListTypeGroupAssignment.results[0].ListTypeGroup, 'ListTypeGroup 1', "Expand and select multi value");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test Entity keys order", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(employeeid='JSMITH',itemid='1',type='Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data, "same order as in md xml");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(itemid='1', employeeid='JSMITH',type='Vacation')",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.ok(oResponse.data, "scrumbled order");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(dummykey='1', employeeid='JSMITH',type='Vacation')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "false key");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(itemid='dummyValue', employeeid='JSMITH',type='Vacation')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "false key value");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(key='keyvalue')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "no commas");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection('keyvalue')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "single key only value");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test quoted key values", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, null);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='AA',connid='0017',fldate=dattime'2010-10-20T00%3A00%3A00')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 404, "dattime is written incorrect (datetime)");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/Model10Entities.xml";
		oMockServer.simulate(sMetadataUrl, null);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/Titles(1)",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "unquoted key value - 1 key without key name");
		oMockServer.destroy();
		oMockServer = new MockServer({rootUri: sURI});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection(employeeid='JSMITH',itemid = 1 ,type='Vacation')",
			dataType: "json"
		});

		assert.equal(oResponse.success, false, "Mock server responded");
		assert.equal(oResponse.statusCode, 400, "unquoted key value of itemid key name");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test CRUD simple data model", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "100 entities generated");
		var oPostResponse = syncAjax({
			url: "/myservice/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/Items",
			type: 'POST',
			data: '{"type":"Vacation","from":"2014-03-26","to":"2014-03-27","length":"1 day","state":"Pending"}'
		});

		assert.ok(oPostResponse.success, "Mock server responded the POST resquest");
		assert.equal(oPostResponse.statusCode, 201, "resource successfully created");
		assert.ok(oPostResponse.data.d.type, "New entry created");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 101, "101 entities read");
		var oPutResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'PUT',
			data: '{"type":"Vacation","from":"2014-03-27","to":"2014-03-28","length":"1 day","state":"Pending"}'
		});

		assert.ok(oPutResponse.success, "Mock server responded the PUT resquest");
		assert.equal(oPutResponse.statusCode, 204, "resource successfully updated");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 101, "101 entities returned");
		// read the just created resource again
		var oGetResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'GET'
		});

		assert.ok(oGetResponse.success, "Mock server responded the GET request");
		assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
		var oDelResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'DELETE'
		});

		assert.ok(oDelResponse.success, "Mock server responded the DELETE request");
		assert.equal(oDelResponse.statusCode, 204, "resource successfully deleted");
		// Try to read the just delted resource -this shall fail
		var oGetAgainResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'GET'
		});

		assert.equal(oGetAgainResponse.success, false, "Mock server responded the GET request");
		assert.equal(oGetAgainResponse.statusCode, 404, "Read of deleted resource intensionally failed");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/LeaveItemCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 100, "100 entities returned");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test CRUD rmtsampleflight", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "100 entities generated");
		var oPostResponse = syncAjax({
			url: "/myservice/FlightCollection",
			type: 'POST',
			data: '{"carrid1":"BB","connid":"007","fldate":"\/Date(1287532800000)\/"}'
		});
		assert.ok(oPostResponse.success, "Mock server responded the POST resquest");
		assert.equal(oPostResponse.statusCode, 201, "resource successfully created");
		assert.ok(oPostResponse.data.uri, "resource uri available");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 101, "101 entities returned");
		var oPutResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'PUT',
			data: '{"carrid":"BB","connid":"008","fldate":"\/Date(1287532800000)\/"}'
		});

		assert.ok(oPutResponse.success, "Mock server responded the PUT resquest");
		assert.equal(oPutResponse.statusCode, 204, "resource successfully updated");
		oPutResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='008',fldate=datetime'2010-10-20T00:00:00')",
			type: 'PUT',
			data: '{"carrid":"BB","connid":"009"}'
		});
		assert.ok(oPutResponse.success, "Mock server responded the PUT resquest");
		assert.equal(oPutResponse.statusCode, 204, "resource successfully updated");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 101, "101 entities returned");
		// read the just created resource again with encode datetime
		var oGetResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='009',fldate=datetime'2010-10-20T00%3A00%3A00')",
			type: 'GET'
		});

		assert.ok(oGetResponse.success, "Mock server responded the GET request");
		assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull with encoded datetime");
		assert.equal(oGetResponse.data.d.connid, "009", "re-read of new resource successfull with encoded datetime");
		// read the just created resource again
		oGetResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='009',fldate=datetime'2010-10-20T00:00:00')",
			type: 'GET'
		});
		assert.ok(oGetResponse.success, "Mock server responded the GET request");
		assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
		assert.equal(oGetResponse.data.d.connid, "009", "re-read of new resource successfull");
		var oDelResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='009',fldate=datetime'2010-10-20T00:00:00')",
			type: 'DELETE'
		});

		assert.ok(oDelResponse.success, "Mock server responded the DELETE request");
		assert.equal(oDelResponse.statusCode, 204, "resource successfully deleted");
		// Try to read the just delted resource -this shall fail
		var oGetAgainResponse = syncAjax({
			url: "/myservice/FlightCollection(carrid='BB',connid='009',fldate=datetime'2010-10-20T00:00:00')",
			type: 'GET'
		});

		assert.equal(oGetAgainResponse.success, false, "Mock server responded the GET request");
		assert.equal(oGetAgainResponse.statusCode, 404, "Read of deleted resource intensionally failed");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/FlightCollection",
			dataType: "json"
		});

		assert.equal(oResponse.data.d.results.length, 100, "100 entities returned");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test mock data state changer", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "http://anyserver.sap.com:8080/sap/ui/mock/myservice.svc/?sap-client=001"
		});
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "http://anyserver.sap.com:8080/sap/ui/mock/myservice.svc/$metadata?sap-client=001",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(jQuery(oResponse.data).find("Schema").children().length, 4, "Metadata XML: Response is right");
		var oPostResponse = syncAjax({
				url: "http://anyserver.sap.com:8080/sap/ui/mock/myservice.svc/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/Items",
				type: 'POST',
				data: '{"type":"Vacation","from":"2013-09-26","to":"2013-09-27","length":"1 day","state":"Pending"}'
			});

		assert.ok(oPostResponse.success, "Mock server responded the POST resquest");
		assert.equal(oPostResponse.statusCode, 201, "resource successfully created");
		assert.ok(oPostResponse.data.uri, "resource uri available");
		var oPutResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'PUT',
			data: '{"type":"Vacation","from":"2013-10-26","to":"2013-10-27","length":"1 day","state":"Pending"}'
		});

		assert.ok(oPutResponse.success, "Mock server responded the POST resquest");
		assert.equal(oPutResponse.statusCode, 204, "resource successfully created");
		// read the just created resource again
		var oGetResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'GET'
		});

		assert.ok(oGetResponse.success, "Mock server responded the GET request");
		assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
		var oDelResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'DELETE'
		});

		assert.ok(oDelResponse.success, "Mock server responded the DELETE request");
		assert.equal(oDelResponse.statusCode, 204, "resource successfully deleted");
		// Try to read the just delted resource -this shall fail
		var oGetAgainResponse = syncAjax({
			url: oPostResponse.data.uri,
			type: 'GET'
		});

		assert.equal(oGetAgainResponse.success, false, "Mock server responded the GET request");
		assert.equal(oGetAgainResponse.statusCode, 404, "Read of deleted resource intensionally failed");
		oMockServer.destroy();
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 */
	QUnit.test("$batch - 2 GET, and 1 ChangeSet with 4 operations (2 PUT, 1 DELETE and 1 POST) (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchReadOperations = [];
		var oFirstGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchReadOperations.push(oFirstGetOp);
		var oSecGetOp = oModel.createBatchOperation("/LeaveItemCollection?$top=2", "GET");

		aBatchReadOperations.push(oSecGetOp);
		var aBatchChangeOperations = [];
		var oPutOp = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchChangeOperations.push(oPutOp);
		var oPutOp2 = oModel
			.createBatchOperation(
				"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
				"PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchChangeOperations.push(oPutOp2);
		var oDeleteOp = oModel.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Unpaid Leave')", "DELETE",
			null);

		aBatchChangeOperations.push(oDeleteOp);
		var oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "TRIEVISH", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchChangeOperations.push(oPostOp);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData first read succeeded");
			assert.equal(oData.__batchResponses[1].statusCode, 200, "oData second read succeeded");
			assert.equal(oResponse.data.__batchResponses[0].statusCode, 200, "oResponse first read succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[1].statusCode, 204, "oData put succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[2].statusCode, 204, "oData delete succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[3].statusCode, 201, "oData post succeeded");
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
		};

		oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchChangeOperations(aBatchChangeOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("$batch - 2 GET, and 1 ChangeSet with 4 operations (2 PUT, 1 DELETE and 1 POST) (ODataModel V2)", function (assert) {
		const done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV2(sMockUri);

		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["batch1"]);
		oModel.read("/LeaveHeaderCollection?$top=1", { groupId: "batch1" });
		oModel.read("/LeaveItemCollection?$top=2", { groupId: "batch1" });
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
			"PUT",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1" }
		);
		oModel.remove(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Unpaid Leave')",
			{ groupId: "batch1" }
		);
		oModel.create(
			"/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "TRIEVISH",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1" }
		);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].__changeResponses[0].statusCode, 204, "oData put succeeded");
			assert.equal(oData.__batchResponses[0].__changeResponses[1].statusCode, 204, "oData delete succeeded");
			assert.equal(oData.__batchResponses[0].__changeResponses[2].statusCode, 201, "oData post succeeded");
			assert.equal(oData.__batchResponses[1].statusCode, 200, "oData first read succeeded");
			assert.equal(oData.__batchResponses[2].statusCode, 200, "oData second read succeeded");
			cleanup(oModel, oMockServer, done);
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
			cleanup(oModel, oMockServer, done);
		};

		oModel.submitChanges({
			groupId: "batch1",
			success: fnSuccess,
			error: fnError
		});
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 */
	QUnit.test("$batch Multiple ChangeSets (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchReadOperations = [];
		var oFirstGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchReadOperations.push(oFirstGetOp);
		var aBatchFirstChangeOperations = [];
		var oPutOp = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter1", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPutOp);
		var oDeleteOp = oModel.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Unpaid Leave')", "DELETE",
			null);

		aBatchFirstChangeOperations.push(oDeleteOp);
		var oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "LIDOR1", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPostOp);

		var aBatchSecondChangeOperations = [];
		var oPutOp_2 = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPutOp_2);
		var oPostOp_2 = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "LIDOR2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPostOp_2);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData first read succeeded");
			assert.equal(oResponse.data.__batchResponses[0].statusCode, 200, "oResponse first read succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[0].statusCode, 204, "oData put succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[1].statusCode, 204, "oData delete succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[2].statusCode, 201, "oData post succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[1].statusCode, 201, "oData post succeeded");
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
		};

		oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchChangeOperations(aBatchFirstChangeOperations);
		oModel.addBatchChangeOperations(aBatchSecondChangeOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("$batch Multiple ChangeSets (ODataModel V2)", function (assert) {
		const done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV2(sMockUri);

		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["batch1"]);
		oModel.read("/LeaveHeaderCollection?$top=1", { groupId: "batch1" });
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter1",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.remove(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Unpaid Leave')",
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.create(
			"/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "LIDOR1",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter2",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		oModel.create(
			"/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "LIDOR2",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].__changeResponses[0].statusCode, 204, "oData put succeeded");
			assert.equal(oData.__batchResponses[0].__changeResponses[1].statusCode, 204, "oData delete succeeded");
			assert.equal(oData.__batchResponses[0].__changeResponses[2].statusCode, 201, "oData post succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[1].statusCode, 201, "oData second change set post succeeded");
			assert.equal(oData.__batchResponses[2].statusCode, 200, "oData first read succeeded");
			cleanup(oModel, oMockServer, done);
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
			cleanup(oModel, oMockServer, done);
		};
		oModel.submitChanges({
			success: fnSuccess,
			error: fnError
		});
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 */
	QUnit.test("$batch first changeset rollback (second changeset succeed) (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchReadOperations = [];
		var oFirstGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchReadOperations.push(oFirstGetOp);
		var aBatchFirstChangeOperations = [];
		var oPutOp = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPutOp);
		var oPutOp2 = oModel
			.createBatchOperation(
				"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
				"PUT",
				{ "type": "Vacation", "employeeid": "David Freidlin", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPutOp2);
		var oDeleteOp = oModel.createBatchOperation("/LeaveHeaderCollection(employeeid='dummy',type='Sick Leave')", "DELETE", null);

		aBatchFirstChangeOperations.push(oDeleteOp);
		var oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "TRIEVISH", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPostOp);
		var aBatchSecondChangeOperations = [];
		var oPutOp_2 = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPutOp_2);
		var oPostOp_2 = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "LIDOR2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPostOp_2);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData  read succeeded");
			assert.equal(oData.__batchResponses[1].message, "HTTP request failed", "HTTP request failed");
			assert.equal(oData.__batchResponses[1].response.statusCode, 400, "StatusCode is propagated");
			assert.equal(oData.__batchResponses[1].response.statusText, "Bad Request", "StatusText is propagated"); // TODO clarify: is reason phrase mandatory in batch response?
			// read to verify no changes made
			var oGetResponse = syncAjax({
				url: '/mock/LeaveHeaderCollection',
				type: 'GET'
			});
			assert.ok(oGetResponse.success, "Mock server responded the GET request");
			assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
			assert.equal(oGetResponse.data.d.results[0].employeeid, "Gal Roter2", "no changes after rollback");
			assert.equal(oData.__batchResponses[2].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[2].__changeResponses[1].statusCode, 201, "oData post succeeded");
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
		};

		oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchChangeOperations(aBatchFirstChangeOperations);
		oModel.addBatchChangeOperations(aBatchSecondChangeOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("$batch first changeset rollback (second changeset succeed) (ODataModel V2)", function (assert) {
		const done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV2(sMockUri);

		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["batch1"]);
		oModel.read("/LeaveHeaderCollection?$top=1", { groupId: "batch1" });
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
			{
				"type": "Vacation",
				"employeeid": "David Freidlin",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.remove(
			"/LeaveHeaderCollection(employeeid='dummy',type='Sick Leave')",
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.create(
			"/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "TRIEVISH",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter2",
				 "entitlement": "53 days",
				 "availablebalance": "41 days",
				 "pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		oModel.create(
			"/LeaveHeaderCollection",
			{ "type": "Sick Leave", "employeeid": "LIDOR2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" },
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].message, "HTTP request failed", "HTTP request failed");
			assert.equal(oData.__batchResponses[0].response.statusCode, 400, "StatusCode is propagated");
			assert.equal(oData.__batchResponses[0].response.statusText, "Bad Request", "StatusText is propagated"); // TODO clarify: is reason phrase mandatory in batch response?
			assert.equal(oData.__batchResponses[1].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[1].statusCode, 201, "oData post succeeded");
			assert.equal(oData.__batchResponses[2].statusCode, 200, "oData  read succeeded");
			// read to verify no changes made
			var oGetResponse = syncAjax({
				url: '/mock/LeaveHeaderCollection',
				type: 'GET'
			});
			assert.ok(oGetResponse.success, "Mock server responded the GET request");
			assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
			assert.equal(oGetResponse.data.d.results[0].employeeid, "Gal Roter2", "no changes after rollback");
			cleanup(oModel, oMockServer, done);
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
			cleanup(oModel, oMockServer, done);
		};

		oModel.submitChanges({
			success: fnSuccess,
			error: fnError
		});
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 */
	QUnit.test("$batch second changeset rollback (first changeset succeed) (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchReadOperations = [];
		var oFirstGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchReadOperations.push(oFirstGetOp);
		var aBatchFirstChangeOperations = [];
		var oPutOp = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPutOp);
		var oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "LIDOR2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPostOp);
		var aBatchSecondChangeOperations = [];
		var oPutOp1 = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPutOp1);
		var oPutOp2 = oModel
			.createBatchOperation(
				"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
				"PUT",
				{ "type": "Vacation", "employeeid": "David Freidlin", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPutOp2);
		var oDeleteOp = oModel.createBatchOperation("/LeaveHeaderCollection(employeeid='dummy',type='Sick Leave')", "DELETE", null);

		aBatchSecondChangeOperations.push(oDeleteOp);
		oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "TRIEVISH", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchSecondChangeOperations.push(oPostOp);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData  read succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[1].__changeResponses[1].statusCode, 201, "oData post succeeded");
			// read to verify no changes made
			var oGetResponse = syncAjax({
				url: '/mock/LeaveHeaderCollection',
				type: 'GET'
			});
			assert.ok(oGetResponse.success, "Mock server responded the GET request");
			assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
			assert.equal(oGetResponse.data.d.results[0].employeeid, "Gal Roter2", "no changes after rollback");
			assert.equal(oData.__batchResponses[2].message, "HTTP request failed", "HTTP request failed");
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
		};

		oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchChangeOperations(aBatchFirstChangeOperations);
		oModel.addBatchChangeOperations(aBatchSecondChangeOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("$batch second changeset rollback (first changeset succeed) (ODataModel V2)", function (assert) {
		const done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV2(sMockUri);

		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["batch1"]);
		oModel.read("/LeaveHeaderCollection?$top=1", { groupId: "batch1" });
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter2",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.create("/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "LIDOR2",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet1" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')",
			{
				"type": "Vacation",
				"employeeid": "Gal Roter",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		oModel.update(
			"/LeaveHeaderCollection(employeeid='JSMITH',type='Sick Leave')",
			{
				"type": "Vacation",
				"employeeid": "David Freidlin",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		oModel.remove("/LeaveHeaderCollection(employeeid='dummy',type='Sick Leave')",
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		oModel.create("/LeaveHeaderCollection",
			{
				"type": "Sick Leave",
				"employeeid": "TRIEVISH",
				"entitlement": "53 days",
				"availablebalance": "41 days",
				"pendingitems": "1 pending items"
			},
			{ groupId: "batch1", changeSetId: "changeSet2" }
		);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].__changeResponses[0].statusCode, 204, "oData second change set put succeeded");
			assert.equal(oData.__batchResponses[0].__changeResponses[1].statusCode, 201, "oData post succeeded");
			assert.equal(oData.__batchResponses[1].message, "HTTP request failed", "HTTP request failed");
			assert.equal(oData.__batchResponses[2].statusCode, 200, "oData  read succeeded");
			// read to verify no changes made
			var oGetResponse = syncAjax({
				url: '/mock/LeaveHeaderCollection',
				type: 'GET'
			});
			assert.ok(oGetResponse.success, "Mock server responded the GET request");
			assert.equal(oGetResponse.statusCode, 200, "re-read of new resource successfull");
			assert.equal(oGetResponse.data.d.results[0].employeeid, "Gal Roter2", "no changes after rollback");
			cleanup(oModel, oMockServer, done);
		};
		var fnError = function (oError) {
			assert.ok(false, "fnError - batch failed");
			cleanup(oModel, oMockServer, done);
		};

		oModel.submitChanges({
			success: fnSuccess,
			error: fnError
		});
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 *
	 * Note: there's no corresponding test provided for ODataModel V2, because embedding
	 *       a GET request into a change set is against the ODATA spec.
	 */
	QUnit.test("$batch GET in ChangeSet (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchFirstChangeOperations = [];
		var oPutOp = oModel
			.createBatchOperation("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", "PUT",
				{ "type": "Vacation", "employeeid": "Gal Roter2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPutOp);
		var oFakeGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchFirstChangeOperations.push(oFakeGetOp);
		var oPostOp = oModel
			.createBatchOperation("/LeaveHeaderCollection", "POST",
				{ "type": "Sick Leave", "employeeid": "LIDOR2", "entitlement": "53 days", "availablebalance": "41 days", "pendingitems": "1 pending items" });

		aBatchFirstChangeOperations.push(oPostOp);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData  read succeeded");
			assert.equal(oData.__batchResponses[1].statusCode, 204, "oData  read succeeded");
		};
		var fnError = function (oError) {
			assert.equal(oError.response.statusCode, 400,
				"Get in Changeset - Respond 400 - The Data Services Request could not be understood due to malformed syntax");
		};

		// oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchChangeOperations(aBatchFirstChangeOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});
	/**
	 * @deprecated As of version 1.48, as ODataModel V1 has been deprecated
	 */
	QUnit.test("$batch GET Operation not succeed (ODataModel V1)", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sMockUri, true);

		oModel.setUseBatch(true);
		var aBatchReadOperations = [];
		var oFirstGetOp = oModel.createBatchOperation("/LeaveHeaderCollection?$top=1", "GET");

		aBatchReadOperations.push(oFirstGetOp);
		//$to instead of $top - should return 400
		var oSecGetOp = oModel.createBatchOperation("/LeaveItemCollection?$to=2", "GET");

		aBatchReadOperations.push(oSecGetOp);
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData  read succeeded");
			assert.equal(oData.__batchResponses[1].response.statusCode, 400, "Second Read failed due to incorrect syntax");
		};
		var fnError = function (oError) {
			assert.equal(oError.response.statusCode, 400,
				"Get in Changeset - Respond 400 - The Data Services Request could not be understood due to malformed syntax");
		};

		// oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.addBatchReadOperations(aBatchReadOperations);
		oModel.submitBatch(fnSuccess, fnError, false);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("$batch GET Operation not succeed (ODataModel V2)", function (assert) {
		const done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV2(sMockUri);

		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["batch1"]);
		oModel.read("/LeaveHeaderCollection", { urlParameters: { $top: "1" }, groupId: "batch1" });
		//$to instead of $top - should return 400
		oModel.read("/LeaveItemCollection", { urlParameters: { $to: "2" }, groupId: "batch1" });
		var fnSuccess = function (oData, oResponse) {
			assert.equal(oResponse.statusCode, 202, "batch completed");
			assert.equal(oData.__batchResponses[0].statusCode, 200, "oData  read succeeded");
			assert.equal(oData.__batchResponses[1].response.statusCode, 400, "Second Read failed due to incorrect syntax");
			cleanup(oModel, oMockServer, done);
		};
		var fnError = function (oError) {
			assert.equal(oError.response.statusCode, 400,
				"Get in Changeset - Respond 400 - The Data Services Request could not be understood due to malformed syntax");
			cleanup(oModel, oMockServer, done);
		};

		oModel.submitChanges({
			success: fnSuccess,
			error: fnError
		});
	});

	//*********************************************************************************************
	QUnit.test("$batch GET Operation with dfferent status codes", function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});
		var oStatusList = {
			"200": { statusCode: 200, statusText: "OK" },
			"201": { statusCode: 201, statusText: "Created" },
			"204": { statusCode: 204, statusText: "No Content" },
			"400": { statusCode: 400, statusText: "Bad Request" },
			"401": { statusCode: 401, statusText: "Unauthorized" },
			"403": { statusCode: 403, statusText: "Forbidden" },
			"404": { statusCode: 404, statusText: "Not Found" },
			"405": { statusCode: 405, statusText: "Method Not Allowed" },
			"409": { statusCode: 409, statusText: "Conflict" },
			"412": { statusCode: 412, statusText: "Precondition Failed" },
			"415": { statusCode: 415, statusText: "Unsupported Media Type" },
			"500": { statusCode: 500, statusText: "Internal Server Error" },
			"501": { statusCode: 501, statusText: "Not Implemented" },
			"503": { statusCode: 503, statusText: "Service Unavailable" },
			"418": { statusCode: 418, statusText: "error" }  // One generic testcase
		};

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		var aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "GET",
			path: /.*LeaveItemCollection\?code=(.*)/,//path : new RegExp(".*\\?(projects)"),
			response: function (oXhr, sCode) {
				oXhr.respondJSON(parseInt(sCode),
					{
						"Content-Type": "application/json"
					},
					{
						d: [{
							"itemid": sCode,
							"employeeid": sCode,
							"type": "Vacation",
							"from": "2012-12-27",
							"to": "2012-12-27",
							"length": "1 day",
							"availablebalance": "41 days",
							"state": "Rejected"
						}]
					}
				);
				return true;
			}
		});
		oMockServer.setRequests(aRequests);
		oMockServer.start();
		const oModel = new ODataModelV2(sMockUri);

		oModel.setDeferredGroups(["myId"]);
		var fnReadResult = function (oResponse) {
			assert.ok(oResponse.statusCode != undefined, "Status Code " + oResponse.statusCode + " is set");
		};
		var aStatusListKeys = Object.keys(oStatusList);

		function fnSuccess(oData, oResponse) {
			fnReadResult(oResponse);
		}
		function fnError(oResponse) {
			fnReadResult(oResponse);
		}
		for (var i = 0; i < aStatusListKeys.length; i++) {
			oModel.read("/LeaveItemCollection", {
				urlParameters: { code: oStatusList[aStatusListKeys[i]].statusCode },
				groupId: "myId",
				success: fnSuccess,
				error: fnError
			});
		}
		oModel.attachBatchRequestCompleted(this, function (test) {
			//assert.ok(true, "requests with same id should be combined in a batch request");
			//Tidy Up in set Timeout to get at the end...
			setTimeout(function () {
				oMockServer.destroy();
				done();
			}, 0);
		});
		oModel.submitChanges();
	});

	//*********************************************************************************************
	QUnit.test("$batch: custom headers of contained requests", function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		var aRequests = oMockServer.getRequests();
		var sHeaderMsgString = JSON.stringify({
			"code": "CI_DRAFTBP_MESSAGE/015",
			"message": "Enter Reconciliation Account under Company Code before saving your entry",
			"severity": "warning",
			"target": "ReconciliationAccount",
			"details": []
		});

		aRequests.push({
			method: "GET",
			path: /.*LeaveItemCollection/,
			response: function (oXhr, sCode) {
				oXhr.respondJSON(200,
					{
						"Content-Type": "application/json",
						"sap-message": sHeaderMsgString,
						"my-custom-header": "HelloWorld"
					},
					{ d: [{ "itemid": sCode }] }
				);
				return true;
			}
		});
		oMockServer.setRequests(aRequests);
		oMockServer.start();
		const oModel = new ODataModelV2(sMockUri);

		oModel.setDeferredGroups(["myId"]);
		oModel.read("/LeaveItemCollection", {
			groupId: "myId",
			success: function (oData, oResponse) {
				assert.equal(oResponse.headers["sap-message"], sHeaderMsgString, "sap-message header available");
				assert.equal(oResponse.headers["my-custom-header"], "HelloWorld", "my-custom-header was transferred correctly");
			},
			error: function (oResponse) {
				assert.ok(false, "Request failed...");
			}
		});
		oModel.attachBatchRequestCompleted(this, function (test) {
			setTimeout(function () {
				oMockServer.destroy();
				done();
			}, 0);
		});
		oModel.submitChanges();
	});

	//*********************************************************************************************
	QUnit.test("test mock data in one file", async function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/AllInOne.json";// JSON file which contains the mockdata
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/$metadata",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(jQuery(oResponse.data).find("Schema").children().length, 4, "Metadata XML: Response is right");
		const oModel = await initModelV2(sURI);
		var oBinding = oModel.bindList("/LeaveHeaderCollection");
		var handler = function () { // delay the following test
			assert.ok(oBinding.oEntityType, "entity type binding check");
			assert.equal(oBinding.oEntityType.name, "LeaveHeader", "entity type name check");
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/LeaveHeaderCollection");
			assert.ok(oEntityType, "get entity type check");
			assert.equal(oEntityType.name, "LeaveHeader", "entity type name check");
			var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "type");
			assert.ok(oPropMeta, "property type check");
			assert.equal(oPropMeta.name, "type", "entity type property check");
			assert.equal(oPropMeta.type, "Edm.String", "entity type property check");
			oBinding.detachChange(handler);
			cleanup(oModel, oMockServer, done); // resume normal testing
		};

		oBinding.attachChange(handler);
		oBinding.initialize();
		oBinding.getContexts();
	});

	//*********************************************************************************************
	QUnit.test("test mock data generation", async function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/$metadata",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(jQuery(oResponse.data).find("Schema").children().length, 4, "Metadata XML: Response is right");
		const oModel = await initModelV2(sURI);
		var oBinding = oModel.bindList("/LeaveHeaderCollection");
		var handler = function () { // delay the following test
			assert.ok(oBinding.oEntityType, "entity type binding check");
			assert.equal(oBinding.oEntityType.name, "LeaveHeader", "entity type name check");
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/LeaveHeaderCollection");
			assert.ok(oEntityType, "get entity type check");
			assert.equal(oEntityType.name, "LeaveHeader", "entity type name check");
			var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "type");
			assert.ok(oPropMeta, "property type check");
			assert.equal(oPropMeta.name, "type", "entity type property check");
			assert.equal(oPropMeta.type, "Edm.String", "entity type property check");
			oBinding.detachChange(handler);
			cleanup(oModel, oMockServer, done); // resume normal testing
		};

		oBinding.attachChange(handler);
		oBinding.initialize();
		oBinding.getContexts();
	});

	//*********************************************************************************************
	QUnit.test("test $metadata xml", async function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/$metadata",
			dataType: "xml"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(jQuery(oResponse.data).find("Schema").children().length, 4, "Metadata XML: Response is right");
		const oModel = await initModelV2(sURI);
		var oBinding = oModel.bindList("/LeaveHeaderCollection");
		var handler = function () { // delay the following test
			assert.ok(oBinding.oEntityType, "entity type binding check");
			assert.equal(oBinding.oEntityType.name, "LeaveHeader", "entity type name check");
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/LeaveHeaderCollection");
			assert.ok(oEntityType, "get entity type check");
			assert.equal(oEntityType.name, "LeaveHeader", "entity type name check");
			var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "type");
			assert.ok(oPropMeta, "property type check");
			assert.equal(oPropMeta.name, "type", "entity type property check");
			assert.equal(oPropMeta.type, "Edm.String", "entity type property check");
			oBinding.detachChange(handler);
			cleanup(oModel, oMockServer, done); // resume normal testing
		};

		oBinding.attachChange(handler);
		oBinding.initialize();
		oBinding.getContexts();
	});

	//*********************************************************************************************
	QUnit.test("test filter on complex type properties", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";// url to the service metadata document
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/FlightCollection?$filter=flightDetails/cityFrom eq 'cityFrom 1'",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 1, "flightDetails/cityFrom eq 'cityFrom 1'");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test GW JSON format", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";// url to the service metadata document
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/";// base url which contains the mockdata
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/CarrierCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 18, "successfuly parsed the GW response for collection");

		// code under test
		oResponse = syncAjax({
			url: "/myservice/TravelagencyCollection",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 0, "invalid GW response for collection");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test error messages on invalid operations", async function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		let oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		let oModel = await initModelV2(sURI);

		function read(urlWithParams, expectedStatusCode, expectedError, assertionMsg) {
			const [url, query] = urlWithParams.split("?");
			if ( typeof expectedStatusCode === "string" ) {
				assertionMsg = expectedError;
				expectedError = expectedStatusCode;
				expectedStatusCode = 400;
			}
			return new Promise(function(resolve, reject) {
				oModel.read(url, {
					urlParameters: Object.fromEntries(new URLSearchParams(query)),
					success: function() {
						reject(new Error("read operation succeeded unexpectedly"));
					},
					error: function(oResult) {
						assert.equal(oResult.message, "HTTP request failed", "HTTP request failed");
						assert.equal(oResult.statusCode, expectedStatusCode, "status code = " + expectedStatusCode);
						const response = oResult.responseText ?? oResult.response?.body;
						assert.equal(JSON.parse(response).error.message.value, expectedError, assertionMsg);
						resolve();
					}
				});
			});
		}
		//Query negative tests
		await read('/LeaveHeaderCollection?$ski=5',
			"'$ski' is not a valid system query option"
		);
		await read('/LeaveHeaderCollection?$select=type, availablebalance,',
			oMockServer._oErrorMessages.URI_VIOLATING_CONSTRUCTION_RULES,
			"The URI is violating the construction rules defined in the Data Services specification [, at the end of string]"
		);
		await read('/LeaveHeaderCollection?$skip=5,',
			oMockServer._oErrorMessages.URI_VIOLATING_CONSTRUCTION_RULES,
			"skip invalid value [ends with ,]"
		);
		//skip & top
		await read('/LeaveHeaderCollection?$skip=1&$top=sdlfksdf',
			oMockServer._oErrorMessages.INVALID_SYSTEM_QUERY_OPTION_VALUE,
			"top invalid value"
		);
		await read('/LeaveHeaderCollection?$skip=1.5',
			oMockServer._oErrorMessages.INVALID_SYSTEM_QUERY_OPTION_VALUE,
			"skip invalid value [not an integer]"
		);
		await read('/LeaveHeaderCollection?$top=x',
			oMockServer._oErrorMessages.INVALID_SYSTEM_QUERY_OPTION_VALUE,
			"top invalid value [not an integer]"
		);
		//orderby
		await read("/LeaveHeaderCollection?$orderby=entitlement descjkh",
			"Invalid sortorder 'descjkh' detected",
			"Invalid sortorder 'descjkh' detected"
		);
		await read("/LeaveHeaderCollection?$orderby=entitlementFood",
			"Property 'entitlementFood' not found",
			"Property 'entitlementFood' not found"
		);
		//filter
		await read("/LeaveHeaderCollection?$filter=(((type eq 'Vacation' or type eq 'Sick Leave')",
			"Property '((type' not found",
			"Property '((type' not found"
		);
		await read("/LeaveHeaderCollection?$filter=type eq 'Vacation' or ",
			oMockServer._oErrorMessages.INVALID_FILTER_QUERY_STATEMENT,
			"Invalid filter query statement"
		);
		await read("/LeaveItemCollection?$filter=itemid lfde 6",
			oMockServer._oErrorMessages.INVALID_FILTER_QUERY_STATEMENT,
			"Invalid filter query statement ((filter option 'lfde' doesn't exist))"
		);
		await read("/LeaveItemCollection?$filter=itemidFood le 6",
			"Property 'itemidFood' not found",
			"Property 'itemidFood' not found"
		);
		//select
		await read("/LeaveHeaderCollection?$select=sdfsdf",
			404,
			"Resource not found for the segment 'sdfsdf'",
			"Resource not found for the segment 'sdfsdf'"
		);
		//inlinecount
		await read("/LeaveHeaderCollection?$inlinecount=sfg",
			oMockServer._oErrorMessages.INVALID_SYSTEM_QUERY_OPTION_VALUE,
			"InlineCount: " + oMockServer._oErrorMessages.INVALID_SYSTEM_QUERY_OPTION_VALUE
		);
		//format
		await read("/LeaveHeaderCollection?$format=xml",
			oMockServer._oErrorMessages.UNSUPPORTED_FORMAT_VALUE,
			"Format: " + oMockServer._oErrorMessages.UNSUPPORTED_FORMAT_VALUE
		);
		//Single entry negative tests
		await read("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/?$select=type,",
			oMockServer._oErrorMessages.URI_VIOLATING_CONSTRUCTION_RULES,
			"The URI is violating the construction rules defined in the Data Services specification [, at the end of string]"
		);
		await read("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/?$blabla=type",
			"'$blabla' is not a valid system query option",
			"'$blabla' is not a valid system query option (single)"
		);
		await read("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/?$top=1",
			"'$top' is not a valid system query option",
			"'$top' is not a valid system query option (single)"
		);
		//key
		await read("/LeaveItemCollection(itemid='dummy', employeeid='JSMITH',type='Vacation')",
			404,
			oMockServer._oErrorMessages.RESOURCE_NOT_FOUND,
			oMockServer._oErrorMessages.RESOURCE_NOT_FOUND
		);
		await read("/LeaveItemCollection(dummy='1', employeeid='JSMITH',type='Vacation')",
			"Invalid key name in key predicate. Expected name is 'employeeid,itemid,type'",
			"Invalid key name in key predicate. Expected name is 'employeeid,itemid,type'"
		);
		await read("/LeaveItemCollection(employeeid='JSMITH',type='Vacation')",
			oMockServer._oErrorMessages.INVALID_KEY_PREDICATE_QUANTITY,
			oMockServer._oErrorMessages.INVALID_KEY_PREDICATE_QUANTITY
		);
		await read("/LeaveItemCollection(itemid='1, employeeid='JSMITH',type='Vacation')",
			"Malformed URI literal syntax in key 'itemid'",
			"Malformed URI literal syntax in key 'itemid'"
		);
		oMockServer.destroy();
		//Expand
		const sURI2 = sURI;
		oMockServer = new MockServer({rootUri: sURI2});
		sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		oModel = await initModelV2(sURI2);
		await read("/FlightCollection?$expand=FlightFood",
			404,
			"Resource not found for the segment 'FlightFood'",
			"Resource not found for the segment 'FlightFood'"
		);
		await read("/CarrierCollection('carrid 1')/carrierFlights?$expand=flightbooking1",
			404,
			"Resource not found for the segment 'flightbooking1'",
			"Resource not found for the segment 'flightbooking1'"
		);
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test navigation properties with mocked data", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/detection/metadata.xml";// url to the service metadata document
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/detection/";// base url which contains the mockdata
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/StrategyDerivationRequests(DetObjType='DET1', Solution='01')/Results/",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 4, "navigation to collection");
		assert.equal(oResponse.data.d.results[0].__metadata.type, "FRA_STRATEGY_DERIVATION_SRV.StrategyDerivationRequestResult", "simple navigation returns StrategyDerivationRequestResult obj");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("test ODataModel update", async function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/rmtsampleflight/metadata.xml";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();
		const oModel = await initModelV2(sURI);
		oModel.read('/CarrierCollection', {
			success: function (oData, oResponse) {
				var oEntry = {};
				oEntry.CARRNAME = "USD";
				oModel.update("/CarrierCollection('carrid 1')", oEntry, {
					success: function () {

						// code under test
						var oResponse = syncAjax({
							url: "/myservice/CarrierCollection('carrid 1')",
							dataType: "json"
						});

						assert.equal(oResponse.data.d.CARRNAME, "USD");
						assert.equal(oResponse.data.d.mimeType, "mimeType 1");
						cleanup(oModel, oMockServer, done);
					},
					error: function () {
						cleanup(oModel, oMockServer, done);
					}
				}); // merge:true trigger a MERGE request instead of a PUT request to perform a differential update
			},
			error: function () {
				assert.ok(false, "Read failed");
				cleanup(oModel, oMockServer, done);
			}
		});
	});
	/**
	 * @deprecated as of 1.48 as the functionality is not  provided by ODataModel V2
	 */
	QUnit.test("test oDataModel _loadData JSON", function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sURI});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		const oModel = new ODataModelV1(sURI, true);
		oModel._loadData("LeaveHeaderCollection", null, function () {
			assert.equal(oModel.getProperty("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/type"), "Vacation",
				"absolute path without context");
			assert.equal(oModel.getProperty("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/employeeid"), "JSMITH",
				"absolute path without context");
			oModel.createBindingContext("/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')", null, function (newContext) {
				assert.equal(newContext.getProperty("employeeid"), "JSMITH", "relative path with context");
				var employee = oModel.getProperty("/");
				var iKeys = 0;
				jQuery.each(employee, function (iIndex, sKey) {
					iKeys++;
				});
				assert.equal(iKeys, 3);
				cleanup(oModel, oMockServer, done); // resume normal testing
			});
		});
	});

	//*********************************************************************************************
	QUnit.module("Bindings", {
		async beforeEach(assert) {
			this.oMockServer = new MockServer({rootUri: sURI});
			var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
			var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
			this.oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
			this.oMockServer.start();
			assert.ok(this.oMockServer.isStarted(), "Mock server is started");
			this.oModel = await initModelV2(sURI);
		},
		afterEach(assert) {
			this.oModel.destroy();
			this.oMockServer.destroy();
		}
	});

	//*********************************************************************************************
	QUnit.test("test getProperty on label", function (assert) {
		var done = assert.async();
		const oLabel = new Label({text: "testText"});

		oLabel.setModel(this.oModel);
		this.oModel.read("/LeaveItemCollection", {
			success: function () {
				assert.equal(oLabel.getText(), "testText", "old text value");
				oLabel.bindProperty(
					"text", "/LeaveItemCollection(employeeid='JSMITH',itemid='1',type='Vacation')/from");
				assert.equal(oLabel.getText(), "2012-12-27", "text value from model");
				oLabel.unbindProperty("text");
				oLabel.destroy();
				done();
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("test double load update", function (assert) {
		var done = assert.async();
		const oLabel = new Label({text: "testText"});

		oLabel.setModel(this.oModel);
		this.oModel.read("/LeaveItemCollection", {
			success: function() {
				assert.equal(oLabel.getText(), "testText", "old text value");
				oLabel.bindProperty(
					"text", "/LeaveItemCollection(employeeid='JSMITH',itemid='1',type='Vacation')/from");
				assert.equal(oLabel.getText(), "2012-12-27", "new text value from model");
				oLabel.unbindProperty("text");
				this.oModel.read("/LeaveHeaderCollection", {
					success: function() {
						assert.equal(oLabel.getText(), "", "default value");
						oLabel.bindProperty("text", "/LeaveHeaderCollection(employeeid='JSMITH',type='Vacation')/type");
						assert.equal(oLabel.getText(), "Vacation", "2nd new text value from model");
						oLabel.unbindProperty("text");
						oLabel.destroy();
						done();
					}
				});
			}.bind(this)
		});
	});

	//*********************************************************************************************
	QUnit.test("test model bindAggregation on List", function (assert) {
		// notepad control for list binding test
		const MyListItem = Element.extend("MyListItem", {
			metadata: {
				properties: {
					"text": "string"
				}
			}
		});
		const MyList = Control.extend("MyList", {
			metadata: {
				aggregations: {
					"items": {
						type: "MyListItem",
						multiple: true
					}
				}
			}
		});
		const oList = new MyList();
		const oListItem = new MyListItem();
		var done = assert.async();

		oList.setModel(this.oModel);
		oListItem.bindProperty("text", "type");
		var oBinding = oList.bindAggregation("items", "/LeaveHeaderCollection", oListItem).getBinding('items');
		var handler = function () {
			var listItems = oList.getItems();
			assert.equal(listItems.length, 3, "length of items");
			assert.equal(listItems[0].getText(), "Vacation", "LeaveHeader 1 name");
			oBinding.detachChange(handler);
			oList.destroy();
			oListItem.destroy();
			done(); // resume normal testing
		};

		oBinding.attachChange(handler);
	});

	//*********************************************************************************************
	QUnit.test("ListBinding getLength, getContexts", function (assert) {
		var done = assert.async();
		var oBinding = this.oModel.bindList("/LeaveItemCollection");
		var handler = function () {
			assert.equal(oBinding.getPath(), "/LeaveItemCollection", "ListBinding path");
			assert.ok(oBinding.getModel() == this.oModel, "ListBinding model");
			assert.equal(oBinding.getLength(), 7, "length of items");
			oBinding.getContexts().forEach(function (context, i) {
				assert.equal(context.getObject().itemid, (i + 1) + "", "ListBinding context");
			});
			oBinding.detachChange(handler);
			done(); // resume normal testing
		}.bind(this);

		oBinding.attachChange(handler);
		oBinding.initialize();
		oBinding.getContexts();
	});

	//*********************************************************************************************
	QUnit.module("Various");

	//*********************************************************************************************
	QUnit.test("test stable Ids in GenerateMissingMockData", function (assert) {
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/northwind/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/northwind/";
		const oMockServer = new MockServer({rootUri: sURI});
		oMockServer.simulate(sMetadataUrl, {
			'sMockdataBaseUrl': sMockdataBaseUrl,
			'bGenerateMissingMockData': true,
			'aEntitySetsNames': ["Orders"]
		});
		oMockServer.start();

		// code under test
		var oResponse = syncAjax({
			url: "/myservice/Orders",
			dataType: "json"
		});

		assert.ok(oResponse.success, "Mock server responded");
		assert.equal(oResponse.data.d.results.length, 100, "generated 100 Orders");
		assert.equal(oResponse.data.d.results[1].OrderID, 2613, "Check Int: OrderID [1] fixed to 2613");
		assert.equal(oResponse.data.d.results[2].OrderID, 5101, "Check Int: OrderID [2] fixed to 5101");
		assert.equal(oResponse.data.d.results[3].OrderID, 8688, "Check Int: OrderID [3] fixed to 8688");
		assert.equal(oResponse.data.d.results[1].Freight, 416.31, "Check Double: Freight [1] fixed to 416.31");
		assert.equal(oResponse.data.d.results[2].Freight, 6671.92, "Check Double: Freight [1] fixed to 6671.92");
		assert.equal(oResponse.data.d.results[3].Freight, 2613.6, "Check Double: Freight [1] fixed to 2613.6");
		assert.equal(oMockServer._getPseudoRandomNumber("String"), 0.000985394674611232, "next 'String' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("DateTime"), 0.19947249775302894, "next 'DateTime' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Int"), 0.20229533793968885, "next 'Int' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Decimal"), 0.6043817862499473, "next 'Decimal' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Boolean"), 0.000985394674611232, "next 'Boolean' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Byte"), 0.000985394674611232, "next 'Byte' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Double"), 0.000985394674611232, "next 'Double' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Single"), 0.000985394674611232, "next 'Single' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("SByte"), 0.000985394674611232, "next 'SByte' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Time"), 0.000985394674611232, "next 'Time' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Guid"), 0.000985394674611232, "next 'Guid' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("Binary"), 0.000985394674611232, "next 'Binary' pseudo random number stable as expected");
		assert.equal(oMockServer._getPseudoRandomNumber("DateTimeOffset"), 0.000985394674611232, "next 'DateTimeOffset' pseudo random number stable as expected");
		oMockServer.destroy();
	});

	//*********************************************************************************************
	QUnit.test("Test inline-defined metadata for MockServer instance", function (assert) {
		var done = assert.async();
		var oMockServer = new MockServer({
			// Note: to avoid conflicts with metadata already stored in the ODataModel's memory cache (mSharedData),
			// this service uses a new fake URL which is unique within this test page
			rootUri: "/mycustomerservice/"
		});
		var sMetadata = '<?xml version="1.0" encoding="utf-8"?>'
			+ '<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">'
			+ '    <edmx:DataServices m:DataServiceVersion="2.0">'
			+ '        <Schema Namespace="MOCK_TYPES_TEST" xml:lang="en" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">'
			+ '            <EntityType Name="CustomerType" m:HasStream="true">'
			+ '                <Key>'
			+ '                    <PropertyRef Name="ID" />'
			+ '                </Key>'
			+ '                <Property Name="ID" Type="Edm.String" Nullable="false" />'
			+ '                <Property Name="Name" Type="Edm.String" />'
			+ '            </EntityType>'
			+ '            <EntityContainer Name="MOCK_TYPES_TEST" m:IsDefaultEntityContainer="true">'
			+ '                <EntitySet Name="CustomerSet" EntityType="MOCK_TYPES_TEST.CustomerType"  />'
			+ '            </EntityContainer>'
			+ '            <atom:link rel="self" href="http://testservice:8080/sap/opu/odata/sap/MOCK_TYPES_TEST/$metadata" xmlns:atom="http://www.w3.org/2005/Atom" />'
			+ '            <atom:link rel="latest-version" href="http://testservice:8080/sap/opu/odata/sap/MOCK_TYPES_TEST/$metadata" xmlns:atom="http://www.w3.org/2005/Atom" />'
			+ '        </Schema>'
			+ '    </edmx:DataServices>'
			+ '</edmx:Edmx>';

		oMockServer.simulate(sMetadata, {
			"bGenerateMissingMockData": true
		});
		oMockServer.start();
		assert.ok(oMockServer.isStarted(), "Mock server is started");
		var oModel = new ODataModelV2("/mycustomerservice");

		oModel.getMetaModel().loaded().then(function () {
			oModel.createEntry("/CustomerSet", { properties: { ID: "0001", Name: "Gustav" } });
			assert.ok(oModel.hasPendingChanges(), "Pending changes have been created but not yet submitted");
			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					assert.ok(oModel.getObject("/CustomerSet('0001')") != undefined, "New entry has been created");
					assert.ok(!oModel.hasPendingChanges(), "Pending changes have been submitted");
					setTimeout(function () {
						oMockServer.destroy();
						done();
					}, 0);
				},
				error: function () {
					setTimeout(function () {
						oMockServer.destroy();
						done();
					}, 0);
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("$batch: forwarding headers of contained requests", function (assert) {
		var done = assert.async();
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/metadata.xml";
		var sMockdataBaseUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/leave-request/";
		const oMockServer = new MockServer({rootUri: sMockUri});

		oMockServer.simulate(sMetadataUrl, sMockdataBaseUrl);
		var aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "MERGE",
			path: /LeaveItemCollection.*/,
			response: function (oXhr) {
				assert.equal(oXhr.requestHeaders["If-Match"], "123456789", "Etag is transmitted");
				oXhr.respondJSON(204, {});
				return true;
			}
		});
		oMockServer.setRequests(aRequests);
		oMockServer.start();
		const oModel = new ODataModelV2(sMockUri);

		oModel.setDeferredGroups(["myId"]);
		oModel.update("/LeaveItemCollection(employeeid='JSMITH',itemid='1',type='Vacation')", {
			availablebalance: "40 days",
			state: "Approved"
		}, {
			groupId: "myId",
			eTag: "123456789" // Should be transmitted as If-Match request header
		});
		oModel.attachBatchRequestCompleted(this, function (test) {
			setTimeout(function () {
				oMockServer.destroy();
				done();
			}, 0);
		});
		oModel.submitChanges();
	});

	//*********************************************************************************************
	[{
		string: "MeetupID eq 'P'",
		start: undefined,
		end: 0
	}, {
		string: "(MeetupID eq 'P')",
		start: 0,
		end: 16
	}, {
		string: "MeetupID eq 'P' or (Title eq 'P')",
		start: 19,
		end: 32
	}, {
		string: "substringof('P',MeetupID)",
		start: undefined,
		end: 0
	}, {
		string: "substringof('P',toupper(MeetupID))",
		start: undefined,
		end: 0
	}, {
		string: "(substringof('P',toupper(MeetupID)) or substringof('P',toupper(Title)))",
		start: 0,
		end: 70
	}, {
		string: "substringof('P',toupper(MeetupID)) or substringof('P',toupper(Title))",
		start: undefined,
		end: 0
	}, {
		string: "substringof('P',toupper(MeetupID)) or (substringof('P',toupper(Title)))",
		start: 38,
		end: 70
	}].forEach(function (oScenario) {
		QUnit.test("Parenthesis wrapping in filters: " + oScenario.string, function (assert) {
			const oResult = MockServer.prototype._getBracketIndices(oScenario.string);
			assert.strictEqual(oResult.start, oScenario.start, "start");
			assert.strictEqual(oResult.end, oScenario.end, "end");
		});
	});
});
