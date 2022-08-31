/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/m/ScrollContainer",
	"sap/m/Panel",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/core/Configuration"
], function (_LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter, _promiseWaiter,
	ScrollContainer, Panel, opaTest, Opa5, Configuration) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("JSAnimationnWaiter - ScrollContainer", {
		beforeEach: function () {
			this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
			this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
			this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
			this.oTimeoutWaiterStub.returns(false);
			this.oXHRWaiterStub.returns(false);
			this.oPromiseWaiterStub.returns(false);
			Configuration.setAnimationMode("full");

			this.oScrollContainer = new ScrollContainer({
				content: [new Panel({ height: "2000px" })]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oScrollContainer.destroy();
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Autowait while scroll animation in progress", function (assert) {
		var fnDone = assert.async(),
			oJsAnimationLogRegExp = new RegExp("jsAnimation in progress", "g"),
			bInitialResultBeforeAnimationEnd,
			bSecondResultBeforeAnimationEnd,
			bInitialResultAfterAnimationEnd,
			bSecondResultAfterAnimationEnd,
			oScrollContainer = this.oScrollContainer,
			iAnimationDuration = 1000;

		oScrollContainer.scrollTo(0, 300, iAnimationDuration);

		function onStart() {
			bInitialResultBeforeAnimationEnd = _autoWaiter.hasToWait();
			bSecondResultBeforeAnimationEnd = _autoWaiter.hasToWait();
			assert.strictEqual(oLogCollector.getAndClearLog().match(oJsAnimationLogRegExp).length, 2);

			function onEnd() {
				bInitialResultAfterAnimationEnd = _autoWaiter.hasToWait();
				bSecondResultAfterAnimationEnd = _autoWaiter.hasToWait();

				assert.ok(bInitialResultBeforeAnimationEnd, "animation is in progress");
				assert.ok(bSecondResultBeforeAnimationEnd, "animation is in progress");
				assert.ok(!bInitialResultAfterAnimationEnd, "animation is done");
				assert.ok(!bSecondResultAfterAnimationEnd, "animation is done");
				assert.ok(!oLogCollector.getAndClearLog().match(oJsAnimationLogRegExp));
				fnDone();
			}

			setTimeout(onEnd, iAnimationDuration + 100 /* add tolerance*/);
		}

		setTimeout(onStart, 0);
	});

});
