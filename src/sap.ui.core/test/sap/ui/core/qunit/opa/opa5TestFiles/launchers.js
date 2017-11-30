sap.ui.define([
	'jquery.sap.global',
	'sap/ui/test/Opa5',
	'sap/ui/thirdparty/URI',
	'sap/ui/test/autowaiter/_autoWaiter'
], function ($, Opa5, URI, _autoWaiter) {
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
			Opa5.extendConfig({
				autoWait: true
			});
		},
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should ignore autosync when starting/tearing down an IFrame", function(assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		var oAutoWaiterStub = sinon.stub(_autoWaiter, "hasToWait");
		oAutoWaiterStub.returns(false);

		oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");
		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");

			sinon.assert.notCalled(oAutoWaiterStub);
			oAutoWaiterStub.restore();
			fnDone();
		});
	});

	QUnit.test("Should ignore autosync when starting/tearing down a component", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();
		var oAutoWaiterStub = sinon.stub(_autoWaiter, "hasToWait");
		oAutoWaiterStub.returns(false);

		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			sinon.assert.notCalled(oAutoWaiterStub);
			oAutoWaiterStub.restore();
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
			this.clock.tick(500);
			assert.ok(fnSpy.calledOnce, "Teardown exception should also be handled by the queue's fail callback");
		});
	});
});
