/* global sinon, QUnit */
sap.ui.define([
    "sap/ui/mdc/flexibility/Util",
    "sap/ui/core/Control",
    "sap/m/p13n/Engine",
    "sap/ui/core/UIArea"
], function(Util, Control, Engine, UIArea) {
	"use strict";

	QUnit.module("changehandler error handling");

    QUnit.test("Create a change handler with missing information", function(assert){

		assert.throws(function () {
			Util.createChangeHandler();
		}, function(oError) {
			return oError instanceof Error;
		},  "Error thrown when no arguments are provided");

    });

    QUnit.test("Create a change handler without apply function", function(assert){

		assert.throws(function () {
			Util.createChangeHandler({
                revert: function() {}
            });
		}, function(error) {
			return error instanceof Error;
		},  "Error thrown when no apply function is provided");

    });

    QUnit.test("Create a change handler without revert function", function(assert){

		assert.throws(function () {
			Util.createChangeHandler({
                apply: function() {}
            });
		}, function(oError) {
			return oError instanceof Error;
		},  "Error thrown when no revert function is provided");

    });

    QUnit.module("changehandler creation");

    QUnit.test("Create a change handler with the proper arguments", function(assert){
        const oChangeHandler = Util.createChangeHandler({
            apply: function() {

            },
            revert: function() {

            }
        });
        assert.ok(oChangeHandler, "Changehandler has been created");
        assert.ok(oChangeHandler.hasOwnProperty("changeHandler"), "correct attribute provided in changehandler");
        assert.ok(oChangeHandler.changeHandler.hasOwnProperty("applyChange"), "correct attribute provided in changehandler");
        assert.ok(oChangeHandler.changeHandler.hasOwnProperty("completeChangeContent"), "correct attribute provided in changehandler");
        assert.ok(oChangeHandler.changeHandler.hasOwnProperty("revertChange"), "correct attribute provided in changehandler");
        assert.ok(oChangeHandler.changeHandler.hasOwnProperty("onAfterXMLChangeProcessing"), "correct attribute provided in changehandler");
    });

    QUnit.test("Check that completeChangeContent is being propagated", function(assert){

        const done = assert.async(2);

        const applyChange = function() {
            assert.ok(true, "apply is provided and triggerable");
            done(1);
            return Promise.resolve();
        };

        const revertChange = function() {
            assert.ok(true, "revert is provided and triggerable");
            done(2);
            return Promise.resolve();
        };

        const oChangeHandler = Util.createChangeHandler({
            apply: applyChange,
            revert: revertChange
        });

        oChangeHandler.changeHandler.applyChange();
        oChangeHandler.changeHandler.revertChange();
    });

    QUnit.test("Check that completeChangeContent is being propagated", function(assert){

        const done = assert.async();

        const completeChangeContent = function() {
            assert.ok(true, "CompleteChangeContent info is provided on changehandler");
            done();
        };

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {

            },
            revert: function() {

            },
            complete: completeChangeContent
        });

        oChangeHandler.changeHandler.completeChangeContent();
    });

    QUnit.test("Check that condenser info is being propagated", function(assert){

        const done = assert.async();

        const getCondenserInfo = function() {
            assert.ok(true, "Condenser info is provided on changehandler");
            done();
        };

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {

            },
            revert: function() {

            },
            getCondenserInfo: getCondenserInfo
        });

        oChangeHandler.changeHandler.getCondenserInfo();
    });

    QUnit.test("Check optional _onModifiations hook", function(assert){

        const done = assert.async();

        const oControl = new Control();

        oControl._onModifications = function() {
            assert.ok(true, "_onModifications callback triggered");
            Engine.getInstance().waitForChanges.restore();
            done();
        };

        sinon.stub(Engine.getInstance(), "waitForChanges").returns(Promise.resolve());

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {
                return Promise.resolve();
            },
            revert: function() {
                return Promise.resolve();
            }
        });

        oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);
    });

    QUnit.module("Render suppression and resumption");

    QUnit.test("Check that rendering is suppressed", function(assert){

        const done = assert.async();
        const oControl = new Control();
        oControl.placeAt("qunit-fixture");

        const suppressSpy = sinon.stub(oControl.getUIArea(), "suppressInvalidationFor").callsFake(function() {
            assert.step("suppressInvalidation");
            return suppressSpy.wrappedMethod.apply(this, arguments);
        });
        const resumeSpy = sinon.stub(oControl.getUIArea(), "resumeInvalidationFor").callsFake(function() {
            assert.step("resumeInvalidation");
            resumeSpy.wrappedMethod.apply(this, arguments);
            assert.ok(suppressSpy.calledOnceWithExactly(oControl), "Suspend has been called once with the correct agruments");
            assert.ok(resumeSpy.calledOnceWithExactly(oControl), "Resume has been called once with the correct agruments");
            assert.verifySteps(["suppressInvalidation", "onModifications", "resumeInvalidation"], "Execution order");
            done();
            oControl.getUIArea().suppressInvalidationFor.restore();
            oControl.getUIArea().resumeInvalidationFor.restore();
        });

        //Hook will be called once the changes are done processing --> check that each has been called once
        oControl._onModifications = function() {
            Engine.getInstance().waitForChanges.restore();
            return Promise.resolve().then(() => {
                assert.step("onModifications");
            });
        };

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {
                return Promise.resolve();
            },
            revert: function() {
                return Promise.resolve();
            }
        });

        oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);
    });

    QUnit.test("Check that #fireStateChange is executed after change processing", function(assert){

        const oControl = new Control();
        oControl.placeAt("qunit-fixture");

        sinon.stub(Engine.getInstance(), "waitForChanges").returns(Promise.resolve());
        oControl._onModifications = function() { };

        const stateChangeSpy = sinon.spy(Engine.getInstance(), "fireStateChange");

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {
                return Promise.resolve();
            },
            revert: function() {
                return Promise.resolve();
            }
        });

        return oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl)
        .then(function(){
            assert.ok(stateChangeSpy.calledOnce, "State change event has been triggered");
            Engine.getInstance().waitForChanges.restore();
        });

    });

    QUnit.test("Resume invalidation on error", function(assert){

        const done = assert.async();
        const oControl = new Control();
        oControl.placeAt("qunit-fixture");

        const suppressSpy = sinon.stub(oControl.getUIArea(), "suppressInvalidationFor").callsFake(function() {
            assert.step("suppressInvalidation");
            return suppressSpy.wrappedMethod.apply(this, arguments);
        });
        const resumeSpy = sinon.stub(oControl.getUIArea(), "resumeInvalidationFor").callsFake(function() {
            assert.step("resumeInvalidation");
            resumeSpy.wrappedMethod.apply(this, arguments);
            assert.ok(suppressSpy.calledOnceWithExactly(oControl), "Suspend has been called once with the correct agruments");
            assert.ok(resumeSpy.calledOnceWithExactly(oControl), "Resume has been called once with the correct agruments");
            assert.verifySteps(["suppressInvalidation", "resumeInvalidation"], "Execution order");
            done();
            oControl.getUIArea().suppressInvalidationFor.restore();
            oControl.getUIArea().resumeInvalidationFor.restore();
        });

        oControl._onModifications = function() {
            Engine.getInstance().waitForChanges.restore();
            return Promise.reject();
        };

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {
                return Promise.resolve();
            },
            revert: function() {
                return Promise.resolve();
            }
        });

        oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);
    });

});
