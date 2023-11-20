/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/test/Opa5',
	'sap/ui/thirdparty/URI',
	'sap/ui/test/autowaiter/_autoWaiter',
	'sap/ui/test/launchers/iFrameLauncher',
	'sap/ui/test/_OpaUriParameterParser',
	"../utils/sinon",
	'../utils/customQUnitAssertions',
	'samples/components/button/Component' // loaded early although not needed to comply with 'noglobals' option
], function ($, Opa5, URI, _autoWaiter, iFrameLauncher, _OpaUriParameterParser, sinonUtils) {
	"use strict";

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySite.html";
	var BUSY_AFTER_START_URL = "test-resources/sap/ui/core/qunit/opa/fixture/busyAfterStart.html";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

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

		oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);

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

	QUnit.module("Launchers and app params", {
		beforeEach: function () {
			var fnOrig = URI.prototype.search;
			this.oStub = sinonUtils.createStub(URI.prototype, "search", function (query) {
				var mParams = fnOrig.apply(this, arguments);
				if (query === true) {
					mParams.opaSpecific = "value";
				}
				return mParams;
			});
			Opa5.extendConfig({
				appParams: {
					key: "value"
				}
			});
		},
		afterEach: function () {
			this.oStub.restore();
			Opa5._appUriParams = _OpaUriParameterParser._getAppParams();
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should start a component with app params", function(assert) {
		var fnDone = assert.async();
		var mOriginalSearch = new URI().search(true);
		delete mOriginalSearch.testId;
		Opa5._appUriParams = _OpaUriParameterParser._getAppParams();
		Opa5.extendConfig({});

		var oOpa5 = new Opa5();
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.waitFor({
			success: function () {
				var oUriParams = new URI().search(true);
				assert.strictEqual(oUriParams.key, "value", "Should include params from OPA config");
				assert.strictEqual(oUriParams.opaSpecific, "value", "Should include OPA excluded param");
				for (var sKey in mOriginalSearch) {
					assert.strictEqual(oUriParams[sKey], mOriginalSearch[sKey], "Should include initial param " + sKey);
				}
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			var oUriParams = new URI().search(true);
			assert.ok(!oUriParams.key, "Should remove params from OPA config");
			assert.strictEqual(oUriParams.opaSpecific, "value", "Should not remove OPA excluded param");
			for (var sKey in mOriginalSearch) {
				assert.strictEqual(oUriParams[sKey], mOriginalSearch[sKey], "Should not remove initial params");
			}
			fnDone();
		});
	});

	[EMPTY_SITE_URL, [EMPTY_SITE_URL]].forEach(function (vUrl) {
		QUnit.test("Should start an IFrame with app params and source " + vUrl, function(assert) {
			var fnDone = assert.async();
			var oOpa5 = new Opa5();

			oOpa5.iStartMyAppInAFrame(vUrl);

			oOpa5.waitFor({
				success: function () {
					var oUriParams = new URI(Opa5.getWindow().location.href).search(true);
					assert.strictEqual(oUriParams.key, "value", "Should include params from OPA config");
					for (var sKey in this.mOriginalSearch) {
						assert.strictEqual(oUriParams[sKey], this.mOriginalSearch[sKey], "Should include initial param " + sKey);
					}
				}
			});

			oOpa5.iTeardownMyApp();

			Opa5.emptyQueue().done(function () {
				var oUriParams = new URI().search(true);
				assert.ok(!oUriParams.key, "Should remove params from OPA config");
				for (var sKey in this.mOriginalSearch) {
					assert.strictEqual(oUriParams[sKey], this.mOriginalSearch[sKey], "Should not remove initial params");
				}
				fnDone();
			});
		});
	});

	QUnit.module("Launchers and autoWait", {
		beforeEach: function () {
			Opa5.resetConfig();
		},
		afterEach: function () {
			Opa5.resetConfig();
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

		oOpa5.iStartMyAppInAFrame(BUSY_AFTER_START_URL).done(function () {
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

		oOpa5.iStartMyAppInAFrame({source: BUSY_AFTER_START_URL, autoWait: true}).done(function () {
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
			this.clock.tick(500);
			assert.ok(fnSpy.calledOnce, "Teardown exception should also be handled by the queue's fail callback");
		});
	});

});
