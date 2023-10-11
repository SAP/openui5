/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/ui/test/autowaiter/_navigationContainerWaiter",
	"sap/f/FlexibleColumnLayout",
	"sap/m/Page",
	"sap/base/strings/capitalize",
	"sap/ui/core/ControlBehavior",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter, _promiseWaiter,
		_navigationContainerWaiter, FlexibleColumnLayout, Page, capitalize, ControlBehavior, jQuery, nextUIUpdate) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("TransitionWaiter - basic transitions", {
		beforeEach: function () {
			this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
			this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
			this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
			this.oNavigationContainerWaiterStub = sinon.stub(_navigationContainerWaiter, "hasPending");
			this.oTimeoutWaiterStub.returns(false);
			this.oXHRWaiterStub.returns(false);
			this.oPromiseWaiterStub.returns(false);
			this.oNavigationContainerWaiterStub.returns(false);

			this.oElement = document.createElement("div");
			this.oElement.style.height = "300px";
			this.oElement.style.width = "300px";
			this.oElement.style.transitionProperty = "width";
			this.oElement.style.transitionDuration = "600ms";

			document.getElementById("qunit-fixture").appendChild(this.oElement);
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oNavigationContainerWaiterStub.restore();
			this.oElement = null;
		}
	});

	QUnit.test("Should wait while transition ends", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),

			triggerTransition = function () {
				this.oElement.style.width = "100px";
			}.bind(this),

			checkStartDetected = function () {
				assert.ok(true, "browser fires transitionstart event"); // checks platform prerequisite
				assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
				assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				// cleanup
				jQuery(document.body).off("webkitTransitionStart transitionstart", checkStartDetected);
			},

			checkEndDetected = function () {
				assert.ok(true, "browser fires transitionend event");  // checks platform prerequisite
					assert.ok(!_autoWaiter.hasToWait(), "transition waiter detects transition end");
					assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
					fnDone();
				// cleanup
				jQuery(document.body).off("webkitTransitionEnd transitionend", checkEndDetected);
			};

		jQuery(document.body).on("webkitTransitionStart transitionstart", checkStartDetected);
		jQuery(document.body).on("webkitTransitionEnd transitionend", checkEndDetected);

		// Act
		setTimeout(triggerTransition, 100);
	});

	QUnit.test("Should wait while transition with delay ends", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),

			triggerTransition = function() {
				this.oElement.style.transitionDelay = "300ms";
				this.oElement.style.width = "100px";
			}.bind(this),

			checkStartDetected = function () {
				assert.ok(true, "browser fires transitionrun event"); // checks platform prerequisite
					assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
					assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				// cleanup
				jQuery(document.body).off("webkitTransitionRun transitionrun", checkStartDetected);
			},

			checkEndDetected = function () {
				assert.ok(true, "browser fires transitionend event");  // checks platform prerequisite
					assert.ok(!_autoWaiter.hasToWait(), "transition waiter detects transition end");
					assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
					fnDone();
				// cleanup
				jQuery(document.body).off("webkitTransitionEnd transitionend", checkEndDetected);
			};

		jQuery(document.body).on("webkitTransitionRun transitionrun", checkStartDetected);
		jQuery(document.body).on("webkitTransitionEnd transitionend", checkEndDetected);

		// Act
		setTimeout(triggerTransition, 100);
	});

	QUnit.test("Should wait while transition with negative delay ends", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),

			triggerTransition = function() {
				this.oElement.style.transitionDelay = "-300ms";
				this.oElement.style.width = "100px";
			}.bind(this),

			checkStartDetected = function () {
				assert.ok(true, "browser fires transitionrun event"); // checks platform prerequisite
				assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
				assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				jQuery(document.body).off("webkitTransitionRun transitionrun", checkStartDetected);
			},

			checkEndDetected = function () {
				assert.ok(true, "browser fires transitionend event");  // checks platform prerequisite
				assert.ok(!_autoWaiter.hasToWait(), "transition waiter detects transition end");
				assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
				fnDone();
				jQuery(document.body).off("webkitTransitionEnd transitionend", checkEndDetected);
			};

		jQuery(document.body).on("webkitTransitionRun transitionrun", checkStartDetected);
		jQuery(document.body).on("webkitTransitionEnd transitionend", checkEndDetected);

		// Act
		setTimeout(triggerTransition, 100);
	});

	QUnit.test("Should wait while transition of two properties ends", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),

			triggerTransition = function() {
				this.oElement.style.transitionProperty = "width, height";
				this.oElement.style.transitionDuration = "600ms, 1s";
				this.oElement.style.width = "100px";
				this.oElement.style.height = "100px";
			}.bind(this),

			checksForPropertyNames = {
				checkStartDetectedForWidth: function() {
					assert.ok(true, "browser fires transitionrun event for width"); // checks platform prerequisite
					assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
					assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				},
				checkStartDetectedForHeight: function() {
					assert.ok(true, "browser fires transitionrun event for height"); // checks platform prerequisite
					assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
					assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);

				},
				checkEndDetectedForWidth: function() {
					assert.ok(true, "browser fires transitionend event for width");  // checks platform prerequisite
					assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition end");
					assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				},
				checkEndDetectedForHeight: function() {
					assert.ok(true, "browser fires transitionend event for height");  // checks platform prerequisite
					assert.ok(!_autoWaiter.hasToWait(), "transition waiter detects transition end");
					assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
					fnDone();
					jQuery(document.body).off("webkitTransitionEnd transitionend", checkEndDetected);
					jQuery(document.body).off("webkitTransitionRun transitionrun", checkStartDetected);
				}
			},

			checkStartDetected = function (oEvent) {
				var sPropertyName = oEvent.originalEvent.propertyName,
					sFunctionForPropertyName = "checkStartDetectedFor" + capitalize(sPropertyName);
				checksForPropertyNames[sFunctionForPropertyName].call();
			},

			checkEndDetected = function (oEvent) {
				var sPropertyName = oEvent.originalEvent.propertyName,
				sFunctionForPropertyName = "checkEndDetectedFor" + capitalize(sPropertyName);
				checksForPropertyNames[sFunctionForPropertyName].call();
			};

		jQuery(document.body).on("webkitTransitionRun transitionrun", checkStartDetected);
		jQuery(document.body).on("webkitTransitionEnd transitionend", checkEndDetected);

		// Act
		setTimeout(triggerTransition, 100);
	});

	QUnit.test("Should timeout if transition aborted", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),

			triggerTransition = function() {
				this.oElement.style.width = "100px";
			}.bind(this),

			abortTransition = function() {
				this.oElement.remove();
			}.bind(this),

			checkStartDetected = function () {
				assert.ok(_autoWaiter.hasToWait(), "transition waiter detects transition in progress");
				assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 1);
				jQuery(document.body).off("webkitTransitionRun transitionrun", checkStartDetected);
			},

			checkWaitingEnded = function () {
				assert.ok(!_autoWaiter.hasToWait(), "transition waiter no longer waits");
				assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
				fnDone();
			};

		jQuery(document.body).on("webkitTransitionRun transitionrun", checkStartDetected);

		// Act
		setTimeout(triggerTransition, 100);
		setTimeout(checkStartDetected, 200);
		setTimeout(abortTransition, 400);
		setTimeout(checkWaitingEnded, 1200);
	});

	QUnit.module("TransitionWaiter - FlexibleColumnLayout", {
		beforeEach: function () {
			this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
			this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
			this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
			this.oNavigationContainerWaiterStub = sinon.stub(_navigationContainerWaiter, "hasPending");
			this.oTimeoutWaiterStub.returns(false);
			this.oXHRWaiterStub.returns(false);
			this.oPromiseWaiterStub.returns(false);
			this.oNavigationContainerWaiterStub.returns(false);
			ControlBehavior.setAnimationMode("full");

			this.oFcl = new FlexibleColumnLayout({
				beginColumnPages: [new Page()],
				midColumnPages: [new Page()]
			}).placeAt("qunit-fixture");

			return nextUIUpdate();
		},

		afterEach: function () {
			this.oTimeoutWaiterStub.restore();
			this.oXHRWaiterStub.restore();
			this.oPromiseWaiterStub.restore();
			this.oNavigationContainerWaiterStub.restore();
			this.oFcl.destroy();
			return nextUIUpdate();
		}
	});

	QUnit.test("Should wait while FCL is navigating", function (assert) {
		var fnDone = assert.async(),
			oTransitionLogRegExp = new RegExp("transition in progress", "g"),
			bInitialResultBeforeNavigationFinished,
			bSecondResultBeforeNavigationFinished,
			bInitialResultAfterNavigationFinished,
			bSecondResultAfterNavigationFinished,
			oFcl = this.oFcl;

		oFcl.setLayout("TwoColumnsBeginExpanded");

		function onStart() {
			assert.ok(true, "browser fires transitionstart event"); // checks platform prerequisite
			jQuery(document.body).off("webkitTransitionStart transitionstart", onStart);
			bInitialResultBeforeNavigationFinished = _autoWaiter.hasToWait();
			bSecondResultBeforeNavigationFinished = _autoWaiter.hasToWait();
			assert.strictEqual(oLogCollector.getAndClearLog().match(oTransitionLogRegExp).length, 2);

			function onEnd() {
				assert.ok(true, "browser fires transitionend event");  // checks platform prerequisite
				bInitialResultAfterNavigationFinished = _autoWaiter.hasToWait();
				bSecondResultAfterNavigationFinished = _autoWaiter.hasToWait();

				assert.ok(bInitialResultBeforeNavigationFinished, "Transition is in progress");
				assert.ok(bSecondResultBeforeNavigationFinished, "Transition is in progress");
				assert.ok(!bInitialResultAfterNavigationFinished, "Transition is done");
				assert.ok(!bSecondResultAfterNavigationFinished, "Transition is done");
				assert.ok(!oLogCollector.getAndClearLog().match(oTransitionLogRegExp));
				fnDone();
				jQuery(document.body).off("webkitTransitionEnd transitionend", onEnd);
			}

			jQuery(document.body).on("webkitTransitionEnd transitionend", onEnd);
		}

		jQuery(document.body).on("webkitTransitionStart transitionstart", onStart);
	});

});
