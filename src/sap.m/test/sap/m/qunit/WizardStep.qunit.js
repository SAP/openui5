/*global QUnit */
sap.ui.define(["sap/m/WizardStep", "sap/ui/qunit/utils/nextUIUpdate", "sap/ui/core/Lib"], function(WizardStep, nextUIUpdate, Library) {
	"use strict";

	var oRb = Library.getResourceBundleFor("sap.m");

	QUnit.module("WizardStep API", {
		beforeEach: function () {
			this.wizardStep = new WizardStep();
		},
		afterEach: function () {
			this.wizardStep.destroy();
			this.wizardStep = null;
		},
		addSubSteps: function () {
			this.wizardStep.addSubsequentStep(new WizardStep());
			this.wizardStep.addSubsequentStep(new WizardStep());
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

	QUnit.test("Default accessibility values", async function (assert) {
		this.wizardStep.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.strictEqual(this.wizardStep.$().attr("role"), "region", "Role should be region");
		assert.strictEqual(this.wizardStep.$().attr("aria-labelledby"),
			this.wizardStep.getId() + "-NumberedTitle", "Region should be labelled by the title and position");
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
		beforeEach: function () {
			this.wizardStep = new WizardStep();
		},
		afterEach: function () {
			this.wizardStep.destroy();
			this.wizardStep = null;
		}
	});

	QUnit.test("_activate() is firing the activate event", function (assert) {
		var spy = this.spy();

		this.wizardStep.attachActivate(spy);
		this.wizardStep._activate();

		assert.strictEqual(spy.calledOnce, true, "activate event is fired once");
	});

	QUnit.test("_complete() is firing the complete event", function (assert) {
		var spy = this.spy();

		this.wizardStep.attachComplete(spy);
		this.wizardStep._complete();

		assert.strictEqual(spy.calledOnce, true, "complete event is fired once");
	});

	QUnit.test("_setNumberInvisibleText / _getNumberInvisibleText", function (assert) {
		var sTitle = "Sample title",
			iPosition = 1,
			oStep = new WizardStep({
				title: sTitle
			});

		assert.strictEqual(oStep._setNumberInvisibleText(iPosition).getText(),
			oRb.getText("WIZARD_STEP") + iPosition + " " + sTitle,
			"The invisible text is updated correctly.");

		assert.strictEqual(oStep._setNumberInvisibleText(iPosition),
			oStep._getNumberInvisibleText(),
			"The correct object is returned from the getter.");

		// Cleanup
		oStep.destroy();
	});

	QUnit.module("Title ID propagation");

	QUnit.test("_initTitlePropagationSupport is called on init", function (assert) {
		// Arrange
		var oSpy = this.spy(WizardStep.prototype, "_initTitlePropagationSupport"),
			oControl;

		// Act
		oControl = new WizardStep();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initTitlePropagationSupport called on init of control");
		assert.ok(oSpy.calledOn(oControl), "The spy is called on the tested control instance");

		// Cleanup
		oControl.destroy();
	});

	QUnit.module("Title change");

	QUnit.test("calling setTitle should call _updateProgressNavigator on the parent wizard control", function (assert) {
		// Arrange
		var oControl = new WizardStep(),
			oSpy = this.spy();

		this.stub(oControl, "_getWizardParent").returns({
			_updateProgressNavigator: oSpy
		});

		// Act
		oControl.setTitle("test");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _updateProgressNavigator was called once");

		// Cleanup
		oControl.destroy();
	});
});