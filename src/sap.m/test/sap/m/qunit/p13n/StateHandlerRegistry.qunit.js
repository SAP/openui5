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
					oError.message === "StateHandlerRegistry: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.m.p13n.Engine.getInstance().stateHandlerRegistry' instead"
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
