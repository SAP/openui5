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

    QUnit.test("Check that rendering is resumed with failing 'waitForChanges'", function(assert){

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

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        const oChangeHandler = Util.createChangeHandler({
            apply: function() {
                return Promise.reject();
            },
            revert: function() {
                return Promise.resolve();
            }
        });

        oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);

        Engine.getInstance().waitForChanges.restore();
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

    QUnit.test("_pPendingModification stays set until _onModifications resolves", async function(assert){
        const oControl = new Control();
        oControl.placeAt("qunit-fixture");

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        const oOnModifications = Promise.withResolvers();
        oControl._onModifications = sinon.stub().returns(oOnModifications.promise);

        const oChangeHandler = Util.createChangeHandler({
            apply: () => Promise.resolve(),
            revert: () => Promise.resolve()
        });

        await oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);

        await new Promise((resolve) => { setTimeout(resolve, 0); });

        assert.ok(oControl._pPendingModification, "_pPendingModification is still set while _onModifications is pending");
        assert.strictEqual(oControl._onModifications.callCount, 1, "_onModifications has been invoked");

        oOnModifications.resolve();
        await oControl._pPendingModification;

        assert.notOk(oControl._pPendingModification, "_pPendingModification is cleared after _onModifications resolves");

        Engine.getInstance().waitForChanges.restore();
        oControl.destroy();
    });

    QUnit.test("Re-entrant change from _onModifications is processed in the same cycle", async function(assert) {
        const oControl = new Control();
        oControl.placeAt("qunit-fixture");

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        // Simulate Engine.getTrace/clearTrace against an in-memory trace that fConfigModified pushes to via Engine.trace.
        let aTrace = [];
        sinon.stub(Engine.getInstance(), "trace").callsFake((c, oChange) => {
            aTrace.push(oChange.changeSpecificData.changeType);
        });
        sinon.stub(Engine.getInstance(), "getTrace").callsFake(() => aTrace);
        sinon.stub(Engine.getInstance(), "clearTrace").callsFake(() => {aTrace = [];});

        const oChangeHandler = Util.createChangeHandler({
            apply: () => Promise.resolve(),
            revert: () => Promise.resolve()
        });

        const oReentrantChange = {
            getChangeType: () => "reentrantChange",
            getContent: () => ({})
        };

        // First call: trigger a re-entrant change by invoking applyChange again.
        // Second call: just resolve, signalling the re-entrant change was processed.
        const aLog = [];
        oControl._onModifications = sinon.stub();
        oControl._onModifications.onFirstCall().callsFake(async (aKeys) => {
            await oChangeHandler.changeHandler.applyChange(oReentrantChange, oControl);
            aLog.push({call: "first", keys: aKeys});
        });
        oControl._onModifications.onSecondCall().callsFake((aKeys) => {
            aLog.push({call: "second", keys: aKeys});
        });

        await oChangeHandler.changeHandler.applyChange({
            getChangeType: () => "initialChange",
            getContent: () => ({})
        }, oControl);

        await oControl._pPendingModification;
        aLog.push({call: "pendingModification resolved"});

        assert.deepEqual(aLog, [
            {call: "first", keys: ["initialChange"]},
            {call: "second", keys: ["reentrantChange"]},
            {call: "pendingModification resolved"}
        ], "_pPendingModification resolves after both _onModifications calls have completed, in order");
        assert.notOk(oControl._pPendingModification, "_pPendingModification is cleared only after re-entrant changes are drained");

        Engine.getInstance().waitForChanges.restore();
        Engine.getInstance().trace.restore();
        Engine.getInstance().getTrace.restore();
        Engine.getInstance().clearTrace.restore();
        oControl.destroy();
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

    QUnit.test("Resume invalidation on the UIArea captured at suppress time (control left its UIArea before resume)", async function(assert){
        // Scenario: A ValueHelp FilterBar has its invalidation suppressed while its Dialog is open (control is
        // in the static UIArea). The Dialog is closed before _onModifications finishes, so at resume time the
        // control is no longer assigned to that UIArea. The resume must still target the UIArea on which the
        // suppression was registered - otherwise it stays suppressed forever and the control never rerenders.
        const oControl = new Control();
        oControl.placeAt("qunit-fixture");
        const oOriginalUIArea = oControl.getUIArea();

        const resumeSpy = sinon.spy(oOriginalUIArea, "resumeInvalidationFor");

        // Keep _onModifications pending so we can close the "Dialog" before the resume happens.
        const oOnModifications = Promise.withResolvers();
        oControl._onModifications = () => oOnModifications.promise;

        sinon.stub(Engine.getInstance(), "waitForChanges").resolves();

        const oChangeHandler = Util.createChangeHandler({
            apply: () => Promise.resolve(),
            revert: () => Promise.resolve()
        });

        // applyChange suppresses invalidation synchronously and schedules fConfigModified (which sets up
        // _pPendingModification) once the apply promise resolves. Awaiting the returned promise guarantees
        // fConfigModified has run, so _pPendingModification is set.
        await oChangeHandler.changeHandler.applyChange({
            getChangeType: function() {},
            getContent: function() {}
        }, oControl);

        assert.ok(oControl._bInvalidationSuppressed, "Invalidation has been suppressed");
        assert.ok(oControl._pPendingModification, "Pending modification has been set up");

        // Simulate the Dialog closing: the control loses its UIArea assignment before _onModifications resolves.
        sinon.stub(oControl, "getUIArea").returns(null);

        // Now let _onModifications resolve, which triggers the resume in the fConfigModified 'finally'.
        oOnModifications.resolve();
        await oControl._pPendingModification;

        assert.ok(resumeSpy.calledOnceWithExactly(oControl), "Resume was performed on the UIArea captured at suppress time");
        assert.notOk(oControl._bInvalidationSuppressed, "Suppression flag has been cleared");

        oControl.getUIArea.restore();
        Engine.getInstance().waitForChanges.restore();
        oOriginalUIArea.resumeInvalidationFor.restore();
        oControl.destroy();
    });

});
