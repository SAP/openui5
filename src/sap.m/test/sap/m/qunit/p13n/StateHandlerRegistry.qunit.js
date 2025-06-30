/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/modules/StateHandlerRegistry"
], function (Control, StateHandlerRegistry) {
	"use strict";

	QUnit.module("Init");

	QUnit.test("Use StateHandlerRegistry as Singleton", function(assert){

		var oFirstStateHandlerRegistry = StateHandlerRegistry.getInstance();
		var oSecondStateHandlerRegistry = StateHandlerRegistry.getInstance();
		assert.ok(oFirstStateHandlerRegistry.isA("sap.m.p13n.modules.StateHandlerRegistry"), "getInstance() returns an instance of StateHandlerRegistry");
		assert.deepEqual(oFirstStateHandlerRegistry, oSecondStateHandlerRegistry, "There is only one 'StateHandlerRegistry' instance per session");

		assert.throws(
			function() {
				return new StateHandlerRegistry();
			},
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message === "StateHandlerRegistry: This class is a singleton and should not be used without an AdaptationProvider. Please use 'Engine.getInstance().stateHandlerRegistry' instead"
				);
			},
			"calling the constructor subsequently throws an error."
		);
	});


	QUnit.module("API tests", {
		beforeEach: function() {
			this.oFirstControl = new Control("myControl1");
			this.oSecondControl = new Control("myControl2");
			this.stateHandlerRegistry = StateHandlerRegistry.getInstance();
		},
		afterEach: function() {
			this.oFirstControl.destroy();
			this.oSecondControl.destroy();
			this.stateHandlerRegistry.destroy();
		}
	});

	QUnit.test("Check 'attachChange'", function(assert) {

		var testHandler1 = function(oEvt) {};
		var testHandler2 = function(oEvt) {};
		this.stateHandlerRegistry.attachChange(testHandler1);
		this.stateHandlerRegistry.attachChange(testHandler2);

		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 2, "The event handlers have been registered");
	});

	QUnit.test("Check 'detachChange'", function(assert) {

		var testHandler1 = function(oEvt) {};
		var testHandler2 = function(oEvt) {};
		this.stateHandlerRegistry.attachChange(testHandler1);
		this.stateHandlerRegistry.attachChange(testHandler2);
		this.stateHandlerRegistry.detachChange(testHandler1);

		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 1, "The event handlers have been registered");
		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange[0].fFunction, testHandler2, "The first handler has been removed, the second remains");
	});

	QUnit.test("Check 'attachChange' with oListener", function(assert) {

		const oTestContext = {
			testProperty: "testValue"
		};

		const fnTestHandler = function(oEvt) {
			assert.equal(this.testProperty, "testValue", "The oListener context is correct");
		};

		this.stateHandlerRegistry.attachChange(fnTestHandler, oTestContext);

		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 1, "The event handler has been registered");
		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange[0].oListener, oTestContext, "The event handler has the correct context");
	});

	QUnit.test("Check 'detachChange' with oListener", function(assert) {
		// arrange
		const oTestContext = {
			testProperty: "testValue"
		};

		const fnTestHandler1 = function(oEvt) {
			assert.equal(this.testProperty, "testValue", "The oListener context is correct");
		};
		const fnTestHandler2 = function(oEvt) {};

		this.stateHandlerRegistry.attachChange(fnTestHandler1, oTestContext);
		this.stateHandlerRegistry.attachChange(fnTestHandler2);

		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 2, "The event handler has been registered");
		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange[0].oListener, oTestContext, "The event handler has the correct context");

		// act
		this.stateHandlerRegistry.detachChange(fnTestHandler1);

		// assert
		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 2, "The event handler cannot be detached without context");

		// act
		this.stateHandlerRegistry.detachChange(fnTestHandler1, oTestContext);

		// assert
		assert.equal(this.stateHandlerRegistry.mEventRegistry.stateChange.length, 1, "The event handler gets detached with correct context");
	});

	QUnit.test("Check 'fireChange' with multiple listeners", function(assert) {

		var done = assert.async(2);
		var testHandler1 = function(oEvt) {
			assert.ok(oEvt.getParameter("control"), "Control instance provided");
			done();
		};
		var testHandler2 = function(oEvt) {
			assert.ok(oEvt.getParameter("control"), "Control instance provided");
			done();
		};
		this.stateHandlerRegistry.attachChange(testHandler1);
		this.stateHandlerRegistry.attachChange(testHandler2);

		this.stateHandlerRegistry.fireChange(this.oFirstControl);
	});

	QUnit.test("Check 'fireChange' with different control instances", function(assert) {

		var done = assert.async(2);
		var iCallCount = 0;

		var testHandler1 = function(oEvt) {
			if (iCallCount == 0) {
				assert.equal(oEvt.getParameter("control"), this.oFirstControl, "First Control instance provided");
			}
			if (iCallCount == 1) {
				assert.equal(oEvt.getParameter("control"), this.oSecondControl, "First Control instance provided");
			}
			iCallCount++;
			done(2);
		}.bind(this);

		this.stateHandlerRegistry.attachChange(testHandler1);

		this.stateHandlerRegistry.fireChange(this.oFirstControl);
		this.stateHandlerRegistry.fireChange(this.oSecondControl);
	});

});
