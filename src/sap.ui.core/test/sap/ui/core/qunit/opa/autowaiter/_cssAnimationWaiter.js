/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/f/DynamicPage",
	"sap/m/Toolbar",
	"sap/ui/core/ControlBehavior",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter, _promiseWaiter,
		DynamicPage,  Toolbar, ControlBehavior, jQuery, nextUIUpdate) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("CSSAnimationWaiter - DynamicPage", {
		beforeEach: function () {
			this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
			this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
			this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
			this.oTimeoutWaiterStub.returns(false);
			this.oXHRWaiterStub.returns(false);
			this.oPromiseWaiterStub.returns(false);
			ControlBehavior.setAnimationMode("full");

			this.oDynamicPage = new DynamicPage({
				footer: [new Toolbar()]
			}).placeAt("qunit-fixture");

			return nextUIUpdate();
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oDynamicPage.destroy();
			return nextUIUpdate();
		}
	});

	QUnit.test("Autowait while toogle footer animation in progress", function (assert) {
		var fnDone = assert.async(),
			oCssAnimationLogRegExp = new RegExp("cssAnimation in progress", "g"),
			bInitialResultBeforeAnimationEnd,
			bSecondResultBeforeAnimationEnd,
			bInitialResultAfterAnimationEnd,
			bSecondResultAfterAnimationEnd,
			oDynamicPage = this.oDynamicPage;

		oDynamicPage.setShowFooter(true);

		function onStart() {
			jQuery(document).off("webkitAnimationStart animationstart", onStart);
			bInitialResultBeforeAnimationEnd = _autoWaiter.hasToWait();
			bSecondResultBeforeAnimationEnd = _autoWaiter.hasToWait();
			assert.strictEqual(oLogCollector.getAndClearLog().match(oCssAnimationLogRegExp).length, 2);

			function onEnd() {
				bInitialResultAfterAnimationEnd = _autoWaiter.hasToWait();
				bSecondResultAfterAnimationEnd = _autoWaiter.hasToWait();

				assert.ok(bInitialResultBeforeAnimationEnd, "animation is in progress");
				assert.ok(bSecondResultBeforeAnimationEnd, "animation is in progress");
				assert.ok(!bInitialResultAfterAnimationEnd, "animation is done");
				assert.ok(!bSecondResultAfterAnimationEnd, "animation is done");
				assert.ok(!oLogCollector.getAndClearLog().match(oCssAnimationLogRegExp));
				fnDone();
				jQuery(document).off("webkitAnimationEnd animationend", onEnd);
			}

			jQuery(document).on("webkitAnimationEnd animationend", onEnd);
		}

		jQuery(document).on("webkitAnimationStart animationstart", onStart);
	});

});
