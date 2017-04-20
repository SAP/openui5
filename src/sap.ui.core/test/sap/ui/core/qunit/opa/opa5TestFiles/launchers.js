sap.ui.define([
	'jquery.sap.global',
	'sap/ui/test/Opa5',
	"sap/ui/test/launchers/iFrameLauncher",
	'sap/ui/thirdparty/URI'
	], function ($, Opa5, IFrameLauncher,URI) {
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
				assert.ok($(".sapUiOpaComponent").is(":visible"), "Component is launched");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
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
				assert.ok(IFrameLauncher.hasLaunched(), "IFrame has launched");
				assert.ok($(".opaFrame").is(":visible"), "IFrame is visible");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
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

	var aAutoWaiterStubs = [];

	function stubAutoWaiter () {
		var oAutoWaiter = IFrameLauncher._getAutoWaiter();
		aAutoWaiterStubs.push(sinon.stub(oAutoWaiter, "hasToWait").returns(false));
	}

	QUnit.module("Launchers and autoWait", {
		beforeEach: function () {
			Opa5.extendConfig({
				autoWait: true
			});
		},
		afterEach: function () {
			aAutoWaiterStubs.forEach(function (oStub) {
				oStub.restore();
			});
			aAutoWaiterStubs = [];
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should ignore autosync when starting/tearing down an IFrame", function(assert) {
		// System under Test
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		// waiter in the outer frame
		stubAutoWaiter();

		oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");
			sinon.assert.notCalled(aAutoWaiterStubs[0]);
			fnDone();
		});
	});

	QUnit.test("Should ignore autosync when starting/tearing down a component", function (assert) {
		var fnDone = assert.async();
		var oOpa5 = new Opa5();

		stubAutoWaiter();

		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			sinon.assert.notCalled(aAutoWaiterStubs[0]);
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

	QUnit.test("Should complain if nothing is launched", function (assert) {
		var oOpa5 = new Opa5();

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue();

		assert.throws(function () {
			this.clock.tick(500);
		}.bind(this), "A teardown was called but there was nothing to tear down");
	});
});