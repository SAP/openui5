/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/core/util/MockServer",
	"sap/ui/Device",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/autowaiter/_XHRWaiter"
], function (_LogCollector, _OpaLogger, MockServer, Device, opaTest, Opa5, _XHRWaiter) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	function whenRequestDone(oXHR) {
		return new Promise(function (fnResolve) {
			oXHR.addEventListener("readystatechange", function() {
				if (this.readyState === 4) {
					fnResolve();
				}
			});
		});
	}

	function createAndSendXHR (sUrl, bSync) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", sUrl, !bSync);
		oXHR.send();
		return oXHR;
	}

	QUnit.module("XHRWaiter - no xhrs");

	QUnit.test("Should return that there are no pending Xhrs", function (assert) {
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should return that there are no pending Xhrs when an Xhr is created", function (assert) {
		new XMLHttpRequest();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.module("XHRWaiter - open xhr with sinon", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
			// Mock server sets it to true when loaded
			sinon.FakeXMLHttpRequest.useFilters = false;
			this.oXHR = sinon.useFakeXMLHttpRequest();
			var aRequests = [];

			this.oXHR.onCreate = function (xhr) {
				aRequests.push(xhr);
			};
			this.aRequests = aRequests;
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
			sinon.FakeXMLHttpRequest.useFilters = true;
			this.oXHR.restore();
		}
	});

	QUnit.test("Should return no pending request if there is an open xhr", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", "/foo", true);
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should return pending request if there is a send xhr", function (assert) {
		createAndSendXHR("/foo");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");

		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("There are 0 open XHRs and 1 open FakeXHRs.\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'"));
		assert.ok(sLog.match("New pending:\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'"));
		assert.ok(sLog.match("There are 0 open XHRs and 1 open FakeXHRs.\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'\nStack: "));
	});

	QUnit.test("Should return that there is no open xhr when the request has been responded", function (assert) {
		createAndSendXHR("/foo");
		this.aRequests[0].respond(200, {}, '{}');

		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("New pending:\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'"));
		assert.ok(sLog.match("Finished:\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'"));
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		assert.ok(!oLogCollector.getAndClearLog());
	});

	QUnit.test("Should return that there is an open xhr when 1 of 2 request have been responded", function (assert) {
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		createAndSendXHR("/foo");
		createAndSendXHR("/bar");

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("There are 0 open XHRs and 2 open FakeXHRs." +
			"\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'true'\nStack: "));

		this.aRequests[0].respond(200, {}, '{}');
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");

		this.aRequests[1].respond(200, {}, '{}');
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should return that there is no open xhr when the request has been aborted", function (assert) {
		var oXHR = createAndSendXHR("/foo");
		oXHR.abort();

		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("New pending:\nFakeXHR"));
		assert.ok(sLog.match("Finished:\nFakeXHR"));
	});

	QUnit.test("Should log args and execution stack trace", function callingFunction (assert) {
		createAndSendXHR("/foo");

		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("New pending:\nFakeXHR: URL: '/foo' Method: 'GET'"));
		assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("There are 0 open XHRs and 1 open FakeXHRs"));
		assert.ok(sLog.match("\nFakeXHR: URL: '/foo' Method: 'GET'"));
		assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));

		this.aRequests[0].respond(200, {}, '{}');
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("Finished:\nFakeXHR: URL: '/foo' Method: 'GET'"));
		assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));
	});

	QUnit.test("Should ignore sinon XHRs sent by OPA", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("XHR_WAITER_IGNORE:POST", "/foo");
		oXHR.send();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.module("XHRWaiter - sinon cleanup");

	QUnit.test("Should restore the send function", function (assert) {
		var oXhr = new XMLHttpRequest();
		var fnSendBeforeSinon = oXhr.send;

		var oSinonXhr = sinon.useFakeXMLHttpRequest();
		var fnFirstSinonSend = new XMLHttpRequest().send;
		oSinonXhr.restore();

		var oSecondSinonXhr = sinon.useFakeXMLHttpRequest();
		var fnSeconSinonSend = new XMLHttpRequest().send;
		oSecondSinonXhr.restore();
		assert.strictEqual(fnFirstSinonSend, fnSeconSinonSend, "the restore function is reused");

		var oSecondXhr = new XMLHttpRequest();
		var fnSendAfterSinon = oSecondXhr.send;

		if (Device.browser.firefox) {
			fnSendBeforeSinon = fnSendBeforeSinon.toString();
			fnSendAfterSinon = fnSendAfterSinon.toString();
		}

		assert.strictEqual(fnSendBeforeSinon, fnSendAfterSinon, "the xhr send function is reused");
	});

	QUnit.module("XHR Waiter - Native XHR", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
		}
	});

	QUnit.test("Should return no pending request if there is an open xhr", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", "/foo", true);
		oLogCollector.getAndClearLog();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		assert.ok(!oLogCollector.getAndClearLog());
	});

	QUnit.test("Should return pending request if there is a send xhr", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("New pending:\nXHR: URL: 'actions.js' Method: 'GET' Async: 'true'"));
		return whenRequestDone(oXHR);
	});

	QUnit.test("Should return that there is no open xhr when the request has been responded", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should return that there is no pending request if there is a sent sync xhr", function (assert) {
		var oSyncXHR = createAndSendXHR("actions.js", true);
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		assert.ok(oSyncXHR.readyState === 4 && oSyncXHR.response, "sync XHR has responce");
		assert.ok(oLogCollector.getAndClearLog().match("Finished:\nXHR: URL: 'actions.js' Method: 'GET' Async: 'false'"));
	});

	QUnit.test("Should return that there is an open xhr when 1 of 2 request are done", function (assert) {
		var done = assert.async();

		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs at test start");

		var oXHR1 = createAndSendXHR("/foo");
		var oXHR2 = createAndSendXHR("/bar");

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("There are 2 open XHRs and 0 open FakeXHRs." +
			"\nXHR: URL: '/foo' Method: 'GET' Async: 'true'\nStack: "));
		assert.ok(sLog.match("\nXHR: URL: '/bar' Method: 'GET' Async: 'true'\nStack:"));

		var oFirstRequestPromise = whenRequestDone(oXHR1);
		var oSecondRequestPromise = whenRequestDone(oXHR2);

		var bFirstRequestPassed = false;
		var bSecondRequestPassed = false;
		var bhasPending = false;

		oFirstRequestPromise.then(function () {
			bFirstRequestPassed = true;
			bhasPending = bhasPending || _XHRWaiter.hasPending();
			assertPassedConditions();
		});

		oSecondRequestPromise.then(function () {
			bSecondRequestPassed = true;
			bhasPending = bhasPending || _XHRWaiter.hasPending();
			assertPassedConditions();
		});

		function assertPassedConditions() {
			if (bFirstRequestPassed && bSecondRequestPassed) {
				assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs at test end");
				assert.ok(bhasPending, "After the first request passed there were still pending requests");
				done();
			}
		}
	});

	QUnit.test("Should return that there is no open xhr when the request has been aborted", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		oXHR.abort();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("New pending:\nXHR: URL: 'actions.js' Method: 'GET'"));
		assert.ok(sLog.match("Finished:\nXHR: URL: 'actions.js' Method: 'GET'"));
	});

	QUnit.test("Should log args and execution stack trace", function callingFunction (assert) {
		var oXHR = createAndSendXHR("actions.js");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("New pending:\nXHR: URL: 'actions.js' Method: 'GET'"));
		assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("There are 1 open XHRs and 0 open FakeXHRs"));
		assert.ok(sLog.match("\nXHR: URL: 'actions.js' Method: 'GET'"));
		assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));

		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should ignore native XHRs sent by OPA", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("XHR_WAITER_IGNORE:POST", "/foo");
		oXHR.send();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.module("XHRWaiter - fake XHR in iFrame");

	opaTest("Should wait for open XHRs in an iFrame", function (oOpa) {
		var aRequests = [];
		var oFakeIFrameXHR;
		var iFrameXHRWaiter;

		oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/miniUI5Site.html");

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			actions: function () {
				var oIFrameWindow = Opa5.getWindow();
				iFrameXHRWaiter = oIFrameWindow.sap.ui.require("sap/ui/test/autowaiter/_XHRWaiter");
				Opa5.assert.ok(!iFrameXHRWaiter.hasPending(), "There are no open XHRs initially");

				oFakeIFrameXHR = oIFrameWindow.sinon.useFakeXMLHttpRequest();
				oFakeIFrameXHR.onCreate = function (xhr) {
					aRequests.push(xhr);
				};

				Opa5.getJQuery().get({url: "foo"});
			}
		});

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function (oButton) {
				Opa5.assert.ok(iFrameXHRWaiter.hasPending(), "There is an open fake XHR");
				aRequests[0].respond(200, {}, '{}');
				Opa5.assert.ok(!iFrameXHRWaiter.hasPending(), "Finished:\nFakeXHR");
			}
		});

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			actions: function () {
				Opa5.assert.ok(!iFrameXHRWaiter.hasPending(), "There are no open XHR");
				oFakeIFrameXHR.restore();
			}
		});

		oOpa.iTeardownMyApp();
	});

	QUnit.module("XHR Waiter - sinon fake server", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
			this.aFiltersOfMockServer = sinon.FakeXMLHttpRequest.filters;
			// don't let mockserver interfere
			sinon.FakeXMLHttpRequest.filters.length = 0;

			sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl) {
				// only let request to actions.js be defaked
				return sUrl === "actions.js";
			});
			this.oServer = sinon.fakeServer.create();
			this.oServer.respondWith("GET", "/foo",
				[200, {},'{}']);
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
			this.oServer.restore();
			// restore mockservers filters
			sinon.FakeXMLHttpRequest.filters = this.aFiltersOfMockServer;
		}
	});

	QUnit.test("Should hook into defaked requests", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should hook into faked requests", function (assert) {
		createAndSendXHR("foo");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		this.oServer.respond();
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should combine faked and defaked requests", function (assert) {
		createAndSendXHR("foo");
		var oXHR = createAndSendXHR("actions.js");

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		var sLog = oLogCollector.getAndClearLog();
		assert.ok(sLog.match("There are 1 open XHRs and 1 open FakeXHRs"));
		assert.ok(sLog.match("\nXHR: URL: 'actions.js' Method: 'GET' Async: 'true'\nStack: "));
		assert.ok(sLog.match("\nFakeXHR: URL: 'foo' Method: 'GET' Async: 'true'\nStack: "));

		this.oServer.respond();

		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("There are 1 open XHRs and 0 open FakeXHRs." +
			"\nXHR: URL: 'actions.js' Method: 'GET' Async: 'true'\nStack: "));

		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	// sinon needs a preconfigured response for sync xhrs
	QUnit.test("Should return correct pending count when sync request is sent", function (assert) {
		createAndSendXHR("/foo", true);
		assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("Finished:\nFakeXHR: URL: '/foo' Method: 'GET' Async: 'false'"));
	});

	QUnit.module("XHR Waiter - mock server", {
		beforeEach: function () {
			this.sServiceUrl = "/my/odata/service/";
			var oMockServer = new MockServer({ rootUri : this.sServiceUrl});

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 30
			});

			oMockServer.simulate("test-resources/sap/ui/core/qunit/testdata/annotations/metadata.xml", {
				bGenerateMissingMockData : true
			});

			oMockServer.start();
			this.oMockServer = oMockServer;
		},
		afterEach: function () {
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Should hook into a oData request", function (assert) {
		var oXHR = createAndSendXHR("/my/odata/service/Products");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("There are 0 open XHRs and 1 open FakeXHRs." +
			"\nFakeXHR: URL: '/my/odata/service/Products' Method: 'GET' Async: 'true'\nStack: "));

		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should hook into a defaked mockserver request", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(_XHRWaiter.hasPending(), "there are pending xhrs");
		assert.ok(oLogCollector.getAndClearLog().match("There are 1 open XHRs and 0 open FakeXHRs." +
			"\nXHR: URL: 'actions.js' Method: 'GET' Async: 'true'\nStack: "));

		return whenRequestDone(oXHR).then(function () {
			assert.ok(!_XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});
});
