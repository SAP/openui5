sap.ui.define([
	"unitTests/utils/loggerInterceptor",
	"sap/ui/core/util/MockServer",
	"sap/ui/Device",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (loggerInterceptor, MockServer, Device, opaTest, Opa5) {

	jQuery.sap.unloadResources("sap/ui/test/autowaiter/_XHRWaiter.js", false, true, true);
	var aLoggers = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._XHRWaiter");
	var XHRWaiter = sap.ui.test.autowaiter._XHRWaiter;

	function whenRequestDone(oXHR) {
		return new Promise(function (fnResolve) {
			oXHR.addEventListener("readystatechange", function() {
				if (this.readyState === 4) {
					fnResolve();
				}
			});
		})
	}

	function createAndSendXHR (sUrl) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", sUrl, true);
		oXHR.send();
		return oXHR;
	}

	QUnit.module("XHRWaiter - no xhrs");

	QUnit.test("Should return that there are no pending Xhrs", function (assert) {
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should return that there are no pending Xhrs when an Xhr is created", function (assert) {
		new XMLHttpRequest();
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.module("XHRWaiter - open xhr with sinon", {
		beforeEach: function () {
			// Mock server sets it to true when loaded
			sinon.FakeXMLHttpRequest.useFilters = false;
			this.oXHR = sinon.useFakeXMLHttpRequest();
			var aRequests = [];

			this.oXHR.onCreate = function (xhr) {
				aRequests.push(xhr);
			};
			this.aRequests = aRequests;
			this.oTraceSpy = sinon.spy(aLoggers[0], "trace");
			this.oDebugSpy = sinon.spy(aLoggers[1], "debug");
		},
		afterEach: function () {
			sinon.FakeXMLHttpRequest.useFilters = true;
			this.oXHR.restore();
			this.oDebugSpy.restore();
			this.oTraceSpy.restore();
		}
	});

	QUnit.test("Should return no pending request if there is an open xhr", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", "/foo", true);
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.notCalled(this.oDebugSpy);
		sinon.assert.notCalled(this.oTraceSpy);
	});

	QUnit.test("Should return pending request if there is a send xhr", function (assert) {
		createAndSendXHR("/foo");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 0 open XHRs and 1 open FakeXHRs.\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending FakeXHR:\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 0 open XHRs and 1 open FakeXHRs.\nFakeXHR: URL: '/foo' Method: 'GET'\nStack: ");
	});

	QUnit.test("Should return that there is no open xhr when the request has been responded", function (assert) {
		createAndSendXHR("/foo");
		this.aRequests[0].respond(200, {}, '{}');
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending FakeXHR:\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, "FakeXHR finished:\nFakeXHR: URL: '/foo' Method: 'GET'");
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.notCalled(this.oDebugSpy);
	});

	QUnit.test("Should return that there is an open xhr when 1 of 2 request have been responded", function (assert) {
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		createAndSendXHR("/foo");
		createAndSendXHR("/bar");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 0 open XHRs and 2 open FakeXHRs." +
			"\nFakeXHR: URL: '/foo' Method: 'GET'\nStack: ");
		this.aRequests[0].respond(200, {}, '{}');
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		this.aRequests[1].respond(200, {}, '{}');
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should return that there is no open xhr when the request has been aborted", function (assert) {
		var oXHR = createAndSendXHR("/foo");
		oXHR.abort();
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending FakeXHR");
		sinon.assert.calledWithMatch(this.oTraceSpy, "FakeXHR finished");
	});

	QUnit.test("Should log args and execution stack trace", function callingFunction (assert) {
		createAndSendXHR("/foo");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending FakeXHR:\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, new Error().stack ? "callingFunction" : "No stack trace available");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 0 open XHRs and 1 open FakeXHRs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oDebugSpy, new Error().stack ? "callingFunction" : "No stack trace available");
		this.aRequests[0].respond(200, {}, '{}');
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.calledWithMatch(this.oTraceSpy, "FakeXHR finished:\nFakeXHR: URL: '/foo' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, new Error().stack ? "callingFunction" : "No stack trace available");
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
			this.oTraceSpy = sinon.spy(aLoggers[0], "trace");
			this.oDebugSpy = sinon.spy(aLoggers[1], "debug");
		},
		afterEach: function () {
			this.oDebugSpy.restore();
			this.oTraceSpy.restore();
		}
	});

	QUnit.test("Should return no pending request if there is an open xhr", function (assert) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", "/foo", true);
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.notCalled(this.oDebugSpy);
	});

	QUnit.test("Should return pending request if there is a send xhr", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending XHR:\nXHR: URL: 'actions.js' Method: 'GET'");
		return whenRequestDone(oXHR);
	});

	QUnit.test("Should return that there is no open xhr when the request has been responded", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	/*
	On IE11 we use native promises polyfill that (seems) not to use microtasks. With native promises the then blocks are
	scheduled in the microtask queue that has higher priority than the task queue.
	So with properly working native promises, the first then block will be executed before the second response and so the code inside will
	correctly detect there are pending requests.
	But with pormise polyfill and if the responses are received in a very short interval and are scheduled in sequential ticks,
	the promise then's are executed in sequential tickes, AFTER both responses are processed and there are no more pengind requests.
	*/
	if (!Device.browser.msie) {
		QUnit.test("Should return that there is an open xhr when 1 of 2 request are done", function (assert) {
			var done = assert.async();

			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs at test start");

			var oXHR1 = createAndSendXHR("/foo");
			var oXHR2 = createAndSendXHR("/bar");

			assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
			sinon.assert.calledWithMatch(this.oDebugSpy, "There are 2 open XHRs and 0 open FakeXHRs." +
				"\nXHR: URL: '/foo' Method: 'GET'\nStack: ");
			sinon.assert.calledWithMatch(this.oDebugSpy, "\nXHR: URL: '/bar' Method: 'GET'\nStack:");

			var oFirstRequestPromise = whenRequestDone(oXHR1);
			var oSecondRequestPromise = whenRequestDone(oXHR2);

			var bFirstRequestPassed = false;
			var bSecondRequestPassed = false;
			var bhasPending = false;

			oFirstRequestPromise.then(function () {
				bFirstRequestPassed = true;
				bhasPending = bhasPending || XHRWaiter.hasPending();
				assertPassedConditions();
			});

			oSecondRequestPromise.then(function () {
				bSecondRequestPassed = true;
				bhasPending = bhasPending || XHRWaiter.hasPending();
				assertPassedConditions();
			});

			function assertPassedConditions() {
				if (bFirstRequestPassed && bSecondRequestPassed) {
					assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs at test end");
					assert.ok(bhasPending, "After the first request passed there were still pending requests");
					done();
				}
			}
		});
	}

	QUnit.test("Should return that there is no open xhr when the request has been aborted", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		oXHR.abort();
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending XHR:\nXHR: URL: 'actions.js' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, "XHR finished:\nXHR: URL: 'actions.js' Method: 'GET'");
	});

	QUnit.test("Should log args and execution stack trace", function callingFunction (assert) {
		var oXHR = createAndSendXHR("actions.js");
		sinon.assert.calledWithMatch(this.oTraceSpy, "New pending XHR:\nXHR: URL: 'actions.js' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oTraceSpy, new Error().stack ? "callingFunction" : "No stack trace available");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 1 open XHRs and 0 open FakeXHRs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "\nXHR: URL: 'actions.js' Method: 'GET'");
		sinon.assert.calledWithMatch(this.oDebugSpy, new Error().stack ? "callingFunction" : "No stack trace available");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.module("XHRWaiter - fake XHR in iFrame");

	opaTest("Should wait for open XHRs in an iFrame", function (oOpa) {
		var aRequests = [];
		var oFakeIFrameXHR;
		var iFrameXHRWaiter;

		oOpa.iStartMyAppInAFrame("../../testdata/miniUI5Site.html");

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			actions: function () {
				var oIFrameWindow = Opa5.getWindow();
				iFrameXHRWaiter = oIFrameWindow.sap.ui.test.autowaiter._XHRWaiter
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
				Opa5.assert.ok(!iFrameXHRWaiter.hasPending(), "Fake XHR finished");
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
			this.oDebugSpy = sinon.spy(aLoggers[1], "debug");
		},
		afterEach: function () {
			this.oServer.restore();
			// restore mockservers filters
			sinon.FakeXMLHttpRequest.filters = this.aFiltersOfMockServer;
			this.oDebugSpy.restore();
		}
	});

	QUnit.test("Should hook into defaked requests", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should hook into faked requests", function (assert) {
		createAndSendXHR("foo");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		this.oServer.respond();
		assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
	});

	QUnit.test("Should combine faked and defaked requests", function (assert) {
		createAndSendXHR("foo");
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 1 open XHRs and 1 open FakeXHRs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "\nXHR: URL: 'actions.js' Method: 'GET'\nStack: ");
		sinon.assert.calledWithMatch(this.oDebugSpy, "\nFakeXHR: URL: 'foo' Method: 'GET'\nStack: ");
		this.oServer.respond();
		this.oDebugSpy.reset();
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 1 open XHRs and 0 open FakeXHRs." +
			"\nXHR: URL: 'actions.js' Method: 'GET'\nStack: ");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.module("XHR Waiter - mock server", {
		beforeEach: function () {
			this.sServiceUrl = "/my/odata/service/";
			var oMockServer = new MockServer({ rootUri : this.sServiceUrl});

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 30
			});

			oMockServer.simulate("../../../testdata/annotations/metadata.xml", {
				bGenerateMissingMockData : true
			});

			oMockServer.start();
			this.oMockServer = oMockServer;
			this.oDebugSpy = sinon.spy(aLoggers[1], "debug");
		},
		afterEach: function () {
			this.oMockServer.stop();
			this.oMockServer.destroy();
			this.oDebugSpy.restore();
		}
	});

	QUnit.test("Should hook into a oData request", function (assert) {
		var oXHR = createAndSendXHR("/my/odata/service/Products");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 0 open XHRs and 1 open FakeXHRs." +
			"\nFakeXHR: URL: '/my/odata/service/Products' Method: 'GET'\nStack: ");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});

	QUnit.test("Should hook into a defaked mockserver request", function (assert) {
		var oXHR = createAndSendXHR("actions.js");
		assert.ok(XHRWaiter.hasPending(), "there are pending xhrs");
		sinon.assert.calledWithMatch(this.oDebugSpy, "There are 1 open XHRs and 0 open FakeXHRs." +
			"\nXHR: URL: 'actions.js' Method: 'GET'\nStack: ");
		return whenRequestDone(oXHR).then(function () {
			assert.ok(!XHRWaiter.hasPending(), "there are no pending xhrs");
		});
	});
});
