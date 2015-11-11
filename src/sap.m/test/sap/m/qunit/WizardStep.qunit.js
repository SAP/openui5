(function () {
    "use strict";

    QUnit.module("WizardStep API", {
        setup: function () {
            this.wizardStep = new sap.m.WizardStep();
        },
        teardown: function () {
            this.wizardStep.destroy();
            this.wizardStep = null;
        },
        addSubSteps: function () {
            this.wizardStep.addSubsequentStep(new sap.m.WizardStep());
            this.wizardStep.addSubsequentStep(new sap.m.WizardStep());
        }
    });

    QUnit.test("Default value for title", function (assert) {
        assert.strictEqual(this.wizardStep.getTitle(), "", "should be an empty string");
    });

    QUnit.test("Default value for icon", function (assert) {
        assert.strictEqual(this.wizardStep.getIcon(), "", "should be an empty string");
    });

    QUnit.test("Default value for validated", function (assert) {
        assert.strictEqual(this.wizardStep.getValidated(), true, "should be TRUE");
    });

    QUnit.test("Default accessibility values", function (assert) {
        this.wizardStep.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        assert.strictEqual(this.wizardStep.$().attr("role"), "region", "Role should be region");
        assert.strictEqual(this.wizardStep.$().attr("aria-labelledby"),
            this.wizardStep.getId() + "-Title", "Region should be labelled by the title");
    });

    QUnit.test("_isLeaf() should return TRUE WHEN NO SUBSEQUENT step are defined", function (assert) {
        assert.strictEqual(this.wizardStep._isLeaf(), true, "should be true");
    });

    QUnit.test("_isLeaf() should return FALSE WHEN SUBSEQUENT steps are defined", function (assert) {
        this.addSubSteps();

        assert.strictEqual(this.wizardStep._isLeaf(), false, "should be false");
    });

    QUnit.test("_isBranched() should return FALSE WHEN NO SUBSEQUENT step are defined", function (assert) {
        assert.strictEqual(this.wizardStep._isBranched(), false, "should be false");
    });

    QUnit.test("_isBranched() should return TRUE WHEN SUBSEQUENT step are defined", function (assert) {
        this.addSubSteps();

        assert.strictEqual(this.wizardStep._isBranched(), true, "should be true");
    });

    QUnit.test("_getNextStepReference() should return NULL WHEN NO NEXT step is defined", function (assert) {
        assert.strictEqual(this.wizardStep._getNextStepReference(), null, "should be null");
    });

    QUnit.module("WizardStep Events", {
        setup: function () {
            this.wizardStep = new sap.m.WizardStep();
        },
        teardown: function () {
            this.wizardStep.destroy();
            this.wizardStep = null;
        }
    });

    QUnit.test("_activate() is firing the activate event", function (assert) {
        var spy = sinon.spy();

        this.wizardStep.attachActivate(spy);
        this.wizardStep._activate();

        assert.strictEqual(spy.calledOnce, true, "activate event is fired once");
    });

    QUnit.test("_complete() is firing the complete event", function (assert) {
        var spy = sinon.spy();

        this.wizardStep.attachComplete(spy);
        this.wizardStep._complete();

        assert.strictEqual(spy.calledOnce, true, "complete event is fired once");
    });
}());
