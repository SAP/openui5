/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/m/ScrollContainer",
	"sap/m/Panel",
	"sap/ui/core/ControlBehavior",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter, _promiseWaiter,
	ScrollContainer, Panel, ControlBehavior, nextUIUpdate) {
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
			ControlBehavior.setAnimationMode("full");

			this.oScrollContainer = new ScrollContainer({
				content: [new Panel({ height: "2000px" })]
			}).placeAt("qunit-fixture");

			return nextUIUpdate();
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oScrollContainer.destroy();
			return nextUIUpdate();
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

	function getMockAnimation() {
		var oAnimation = {
			_id: null,
			_animate: function() {
				this._id = requestAnimationFrame(this._animate.bind(this));
			},
			start: function(iDuration) {
				this._animate();
				setTimeout(function() {
					oAnimation.stop();
				}, iDuration);
			},
			stop: function() {
				cancelAnimationFrame(this._id);
			}
		};

		return oAnimation;
	}

	QUnit.module("JSAnimationnWaiter - maxDuration", {
		beforeEach: function () {
			this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
			this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
			this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
			this.oTimeoutWaiterStub.returns(false);
			this.oXHRWaiterStub.returns(false);
			this.oPromiseWaiterStub.returns(false);
			this.oAnimation = getMockAnimation();
			return nextUIUpdate();
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oAnimation.stop();
			this.oAnimation = null;
			return nextUIUpdate();
		}
	});

	QUnit.test("Autowait until animation exceeds maxDuration", function (assert) {
		var fnDone = assert.async(),
			oJsAnimationLogRegExp = new RegExp("jsAnimation in progress", "g"),
			bFirstCheckBefore,
			bSecondCheckBefore,
			bFirstCheckAfter,
			bSecondCheckAfter,
			iMaxDuration = 1000,
			iAnimationDuration = 2000;

		_autoWaiter.extendConfig({
			jsAnimationWaiter: {
				// should be the default already
				maxDuration: iMaxDuration
			}
		});
		this.oAnimation.start(iAnimationDuration);

		function onStart() {
			bFirstCheckBefore = _autoWaiter.hasToWait();
			bSecondCheckBefore = _autoWaiter.hasToWait();
			assert.strictEqual(oLogCollector.getAndClearLog().match(oJsAnimationLogRegExp).length, 2);

			function onEnd() {
				bFirstCheckAfter = _autoWaiter.hasToWait();
				bSecondCheckAfter = _autoWaiter.hasToWait();

				assert.ok(bFirstCheckBefore, "animation is in progress");
				assert.ok(bSecondCheckBefore, "animation is in progress");
				assert.ok(!bFirstCheckAfter, "animation is done");
				assert.ok(!bSecondCheckAfter, "animation is done");
				assert.ok(!oLogCollector.getAndClearLog().match(oJsAnimationLogRegExp));
				fnDone();
			}

			setTimeout(onEnd, iMaxDuration + 300 /* add tolerance*/);
		}

		setTimeout(onStart, 0);
	});
});
