sap.ui.define([
	'jquery.sap.global',
	'sap/ui/test/Opa5',
	'sap/ui/thirdparty/URI',
	'sap/ui/test/autowaiter/_autoWaiter',
	'sap/ui/test/launchers/iFrameLauncher'
], function ($, Opa5, URI, _autoWaiter, iFrameLauncher) {
	"use strict";

	QUnit.module("Launchers and teardown");

	QUnit.test("Should teardown a component", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.waitFor({
			success: function () {
				assert.ok(oOpa5.hasUIComponentStarted() && oOpa5.hasAppStarted(), "UIComponent has started");
				assert.ok($(".sapUiOpaComponent").is(":visible"), "Component is launched");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!(oOpa5.hasUIComponentStarted() || oOpa5.hasAppStarted()), "UIComponent has been torn down");
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			fnDone();
		});
	});

	QUnit.test("Should teardown an IFrame", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

		oOpa5.waitFor({
			success: function () {
				assert.ok(oOpa5.hasAppStartedInAFrame() && oOpa5.hasAppStarted(), "IFrame has launched");
				assert.ok($(".opaFrame").is(":visible"), "IFrame is visible");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!(oOpa5.hasAppStartedInAFrame() || oOpa5.hasAppStarted()), "IFrame has been torn down");
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");
			fnDone();
		});
	});

	QUnit.module("Launchers and app params");

	QUnit.test("Should start a component with app params", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		Opa5.extendConfig({
			appParams: {
				key: "value"
			}
		});

		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.waitFor({
			success: function () {
				// should not check for while appParams object
				// as the test itself could be started with some params
				var oUriParams = new URI(window.location.href).search(true);
				assert.strictEqual(oUriParams.key, "value",
					"App param should be presented");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			fnDone();
		});
	});

	QUnit.test("Should start an IFrame with app params", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		Opa5.extendConfig({
			appParams: {
				key: "value"
			}
		});

		oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

		oOpa5.waitFor({
			success: function () {
				// should not check for while appParams object
				// as the test itself could be started with some params
				var oUriParams = new URI(Opa5.getWindow().location.href).search(true);
				assert.strictEqual(oUriParams.key, "value",
					"App param should be presented");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			fnDone();
		});
	});

	QUnit.test("Should start an IFrame with app params and non-string uri", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		Opa5.extendConfig({
			appParams: {
				key: "value"
			}
		});

		oOpa5.iStartMyAppInAFrame(["../testdata/emptySite.html"]);

		oOpa5.waitFor({
			success: function () {
				// should not check for while appParams object
				// as the test itself could be started with some params
				var oUriParams = new URI(Opa5.getWindow().location.href).search(true);
				assert.strictEqual(oUriParams.key, "value",
					"App param should be presented");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			fnDone();
		});
	});

	QUnit.module("Launchers and autoWait", {
		beforeEach: function () {
			Opa5.resetConfig();
			this.fnWindowOnError = window.onerror;
			window.onerror = function () {
				// suppress iFrame errors in IE11
				return true;
			};
		},
		afterEach: function () {
			Opa5.resetConfig();
			window.onerror = this.fnWindowOnError;
		}
	});

	QUnit.test("Should use default autoWait:false while starting/tearing down an IFrame", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		var fnAutoWaiterSpy = sinon.spy();
		var fnGetAutoWaiterStub = sinon.stub(iFrameLauncher, "_getAutoWaiter");
		fnGetAutoWaiterStub.returns({
			hasToWait: fnAutoWaiterSpy,
			extendConfig: function () {}
		});

		Opa5.extendConfig({
			autoWait: true
		});

		oOpa5.iStartMyAppInAFrame("../testdata/busyAfterStart.html").done(function () {
			sinon.assert.notCalled(fnAutoWaiterSpy);
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");
			fnGetAutoWaiterStub.restore();
			fnDone();
		});
	});

	QUnit.test("Should use configured autoWait:true while starting an IFrame", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		var fnAutoWaiterSpy = sinon.spy();
		var fnGetAutoWaiterStub = sinon.stub(iFrameLauncher, "_getAutoWaiter");
		fnGetAutoWaiterStub.returns({
			hasToWait: fnAutoWaiterSpy,
			extendConfig: function () {}
		});

		oOpa5.iStartMyAppInAFrame({source: "../testdata/busyAfterStart.html", autoWait: true}).done(function () {
			sinon.assert.called(fnAutoWaiterSpy);
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");
			fnGetAutoWaiterStub.restore();
			fnDone();
		});
	});

	QUnit.test("Should use default autoWait:false while starting/tearing down a component", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		var fnAutoWaiterSpy = sinon.spy(_autoWaiter, "hasToWait");

		Opa5.extendConfig({
			autoWait: true // global truthy value should be ignored on next startup
		});

		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			// waiter in outer frame and launcher is the same
			sinon.assert.notCalled(fnAutoWaiterSpy);
			fnAutoWaiterSpy.restore();
			fnDone();
		});
	});

	QUnit.test("Should use configured autoWait:true while starting a component", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		// waiter in outer frame and launcher is the same
		var fnAutoWaiterStub = sinon.stub(_autoWaiter, "hasToWait");
		fnAutoWaiterStub.returns(false);

		// simple component with nothing to wait after start
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			},
			autoWait: true
		}).done(function () {
			// autoWait is true, so hasPending will be called once and will return false immediately
			sinon.assert.calledOnce(fnAutoWaiterStub);
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			sinon.assert.calledOnce(fnAutoWaiterStub);
			fnAutoWaiterStub.restore();
			fnDone();
		});
	});

	QUnit.module("Teardown - invalid invokations", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			this.clock.restore();
		}
	});

	var aTeardownOptions = [
		{
			name: "app",
			func: "iTeardownMyApp",
			error: "A teardown was called but there was nothing to tear down use iStartMyComponent or iStartMyAppInAFrame"
		},
		{
			name: "component",
			func: "iTeardownMyUIComponent",
			error: "sap.ui.test.launchers.componentLauncher: Teardown was called before start. No component was started."
		},
		{
			name: "iFrame",
			func: "iTeardownMyAppFrame",
			error: "sap.ui.test.launchers.iFrameLauncher: Teardown was called before launch. No iFrame was loaded."
		}
	];

	aTeardownOptions.forEach(function (mTeardown) {
		QUnit.test("Should complain if " + mTeardown.name + " is not launched", function (assert) {
			var oOpa5 = new Opa5();
			var fnSpy = this.spy();

			assert.expect(3);

			oOpa5[mTeardown.func].apply(oOpa5).fail(function (oOptions) {
				assert.ok(true, "Should execute teardown fail callback");
				QUnit.assert.contains(oOptions.errorMessage, mTeardown.error, "Unexpected teardown error message");
			});

			oOpa5.emptyQueue().fail(fnSpy);
			this.clock.tick(1200);
			assert.ok(fnSpy.calledOnce, "Teardown exception should also be handled by the queue's fail callback");
		});
	});
});
