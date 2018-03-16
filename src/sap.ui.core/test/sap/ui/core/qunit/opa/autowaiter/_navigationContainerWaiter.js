sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/m/NavContainer",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function ($, _LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter, _promiseWaiter,
		NavContainer, App, Page, Button, opaTest, Opa5) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	[NavContainer, App].forEach(function (fnConstructor) {
		QUnit.module("NavigationContainerWaiter - " + fnConstructor.getMetadata().getName(), {
			beforeEach: function () {
				this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
				this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
				this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
				this.oTimeoutWaiterStub.returns(false);
				this.oXHRWaiterStub.returns(false);
				this.oPromiseWaiterStub.returns(false);

				this.oInitialPageButton = new Button();
				this.oSecondPageButton = new Button();
				var oInitialPage = new Page({
					content: this.oInitialPageButton
				});
				this.oSecondPage = new Page({
					content: this.oSecondPageButton
				});
				this.oNavContainer = new fnConstructor({
					pages: [oInitialPage, this.oSecondPage]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();
			},

			afterEach: function () {
				this.oTimeoutWaiterStub.restore();
				this.oXHRWaiterStub.restore();
				this.oPromiseWaiterStub.restore();
				this.oNavContainer.destroy();
				sap.ui.getCore().applyChanges();
			}
		});

		QUnit.test("Should not match a Button while its navContainer is navigating", function (assert) {
			var fnDone = assert.async();
			var oNavigationLogRegExp = new RegExp("The NavContainer " + this.oNavContainer + " is currently navigating", "g");

			this.oNavContainer.to(this.oSecondPage);
			var bInitialResultBeforeNavigationFinished = _autoWaiter.hasToWait();
			var bSecondResultBeforeNavigationFinished = _autoWaiter.hasToWait();

			assert.strictEqual(oLogCollector.getAndClearLog().match(oNavigationLogRegExp).length, 2);

			this.oNavContainer.attachAfterNavigate(function () {
				var bInitialResultAfterNavigationFinished = _autoWaiter.hasToWait();
				var bSecondResultAfterNavigationFinished = _autoWaiter.hasToWait();

				assert.ok(bInitialResultBeforeNavigationFinished, "Navigation is in progress");
				assert.ok(bSecondResultBeforeNavigationFinished, "Navigation is in progress");
				assert.ok(!bInitialResultAfterNavigationFinished, "Navigation is done");
				assert.ok(!bSecondResultAfterNavigationFinished, "Navigation is done");
				assert.ok(!oLogCollector.getAndClearLog().match(oNavigationLogRegExp));
				fnDone();
			}, this);
		});
	});

	QUnit.module("NavigationContainerWaiter - iFrame");

	opaTest("Should wait for navigating NavContainers in an IFrame", function (oOpa) {
		oOpa.iStartMyAppInAFrame("../../testdata/miniUI5Site.html");

		oOpa.waitFor({
			viewName: "myView",
			id: "myApp",
			success: function (oApp) {
				oOpa.waitFor({
					viewName: "myView",
					id: "buttonOutsideOfTheApp",
					success: function (oButton) {
						var oIFrameWindow = Opa5.getWindow();
						oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.test.autowaiter._timeoutWaiter, "hasPending").returns(false);
						oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.test.autowaiter._XHRWaiter, "hasPending").returns(false);
						oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.test.autowaiter._promiseWaiter, "hasPending").returns(false);

						Opa5.assert.ok(!oIFrameWindow.sap.ui.test.autowaiter._autoWaiter.hasToWait(), "Navigation not started");

						oApp.to(oApp.getPages()[1].getId());
						Opa5.assert.ok(oIFrameWindow.sap.ui.test.autowaiter._autoWaiter.hasToWait(), "autoWaiter detected the navigation");
					}
				});
			}
		});

		oOpa.iTeardownMyApp();
	});
});
