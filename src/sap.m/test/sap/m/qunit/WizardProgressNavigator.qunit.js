(function () {
	"use strict";

	jQuery.sap.require("sap.m.WizardProgressNavigator");

	QUnit.module("sap.m.WizardProgressNavigator API", {
		setup: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
		}
	});

	QUnit.test("Default value for varyingStepCount", function (assert) {
		assert.strictEqual(this.oProgressNavigator.getVaryingStepCount(), false, "should be false");
	});

	QUnit.test("Default value for stepTitles", function (assert) {
		assert.deepEqual(this.oProgressNavigator.getStepTitles(), [], "should be and empty array");
	});

	QUnit.test("Default value for stepIcons", function (assert) {
		assert.deepEqual(this.oProgressNavigator.getStepIcons(), [], "should be and empty array");
	});

	QUnit.test("stepIcons should default to an empty array when NOT ALL steps have icons", function (assert) {
		this.oProgressNavigator.setStepCount(3);
		this.oProgressNavigator.setStepIcons(["sap-icon://warning"]);
		sap.ui.getCore().applyChanges();

		assert.deepEqual(this.oProgressNavigator.getStepIcons(), [], "should be and empty array");
	});

	QUnit.test("NextStep() should go to the next step", function (assert) {
		var iCurrentStep = this.oProgressNavigator.getCurrentStep();

		this.oProgressNavigator.nextStep();
		assert.strictEqual(iCurrentStep + 1, this.oProgressNavigator.getCurrentStep(),
			"Should be on step 2.");

		this.oProgressNavigator.nextStep();
		assert.strictEqual(iCurrentStep + 2, this.oProgressNavigator.getCurrentStep(),
			"Should be on step 3.");
	});

	QUnit.test("NextStep() should not overflow", function (assert) {
		this.oProgressNavigator._currentStep = 5;

		this.oProgressNavigator.nextStep();
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 5,
			"NextStep() should not change when the ProcessSteps are exceeded");
	});

	QUnit.test("PreviousStep() should go to the previous step", function (assert) {
		this.oProgressNavigator._currentStep = 2;

		this.oProgressNavigator.previousStep();
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 1,
			"PreviousStep() should go to the previous step");

		this.oProgressNavigator.previousStep();
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 1,
			"PreviousStep() should not change if currentStep is the first");
	});

	QUnit.test("GetCurrentStep() should return the current step", function (assert) {
		this.oProgressNavigator.nextStep(); // at step 2
		this.oProgressNavigator.nextStep(); // at step 3
		this.oProgressNavigator.nextStep(); // at step 4
		this.oProgressNavigator.previousStep(); // at step 3

		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 3, "Should be on step 3");
	});

	QUnit.test("GetProgress() should return the progress of the Navigator", function(assert) {
		this.oProgressNavigator.nextStep(); // at step 2
		this.oProgressNavigator.nextStep(); // at step 3

		assert.strictEqual(this.oProgressNavigator.getProgress(), 3, "Progress should be equal to 3");
	});

	QUnit.test("IncrementProgress() should change the progress", function(assert) {
		this.oProgressNavigator.incrementProgress();

		assert.strictEqual(this.oProgressNavigator.getProgress(), 2, "Progress should be equal to 2");
	});

	QUnit.test("DiscardProgress() should reset the steps after a given step index", function(assert) {
		this.oProgressNavigator.nextStep();
		this.oProgressNavigator.nextStep();
		this.oProgressNavigator.nextStep();

		assert.strictEqual(this.oProgressNavigator.getProgress(), 4, "Progress should be equal to 4");

		this.oProgressNavigator.discardProgress(2);

		assert.strictEqual(this.oProgressNavigator.getProgress(), 2, "Progress should be equal to 2");
	});

	QUnit.module("sap.m.WizardProgressNavigator Data binding", {
		setup: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator();
			this.oModel = new sap.ui.model.json.JSONModel({
				steps: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
			this.oModel = null;
		}
	});

	QUnit.test("Binding stepCount to a model with steps equal to 5", function (assert) {
		this.oProgressNavigator.setModel(this.oModel);
		this.oProgressNavigator.bindProperty("stepCount", "/steps");


		assert.strictEqual(this.oProgressNavigator.getStepCount(), this.oModel.getData().steps,
			"should set step count to " + this.oModel.getData().steps);
	});

	QUnit.module("sap.m.WizardProgressNavigator CSS Classes", {
		setup: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("Root element should have sapMWizardProgressNav class", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.hasClass("sapMWizardProgressNav"), true);
	});

	QUnit.test("Class sapMWizardProgressNavList should be present only once", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavList").length, 1);
	});

	QUnit.test("When stepCount = 5, list items should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStep").length, 5,
			"sapMWizardProgressNavStep class should be present 5 times");
	});

	QUnit.test("When stepCount = 5, anchors should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchor").length, 5,
			"sapMWizardProgressNavAnchor class should be present 5 times");
	});

	QUnit.test("When stepCount = 5 and varyingStepCount = false, separators should be 4", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavSeparator").length, 4,
			"sapMWizardProgressNavSeparator class should be present 4 times");
	});

	QUnit.test("When stepCount = 5 and varyingStepCount = true, separators should be 5", function (assert) {
		this.oProgressNavigator.setVaryingStepCount(true);
		sap.ui.getCore().applyChanges();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavSeparator").length, 5,
			"sapMWizardProgressNavSeparator class should be present 5 times");
	});

	QUnit.module("sap.m.WizardProgressNavigator Events", {
		setup: function () {
			var that = this;

			this.oSpies = {};
			this.oParams = {};

			this.oSpies.stepActivated = sinon.spy(function(event){
				that.oParams.activatedIndex = event.getParameter("index");
			});

			this.oSpies.stepChanged = sinon.spy(function(event) {
				that.oParams.prevIndex = event.getParameter("previous");
				that.oParams.currentIndex = event.getParameter("current");
			});

			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5,
				stepActivated: this.oSpies.stepActivated,
				stepChanged: this.oSpies.stepChanged
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("Activation of new steps", function(assert) {
		this.oProgressNavigator.nextStep();
		this.oProgressNavigator.previousStep();
		this.oProgressNavigator.nextStep();
		this.oProgressNavigator.nextStep();

		assert.strictEqual(this.oSpies.stepActivated.calledTwice, true, "2 news step should be activated");
	});

	QUnit.test("StepChanged() should fire on each step change", function(assert) {
		this.oProgressNavigator.nextStep();
		assert.strictEqual(this.oSpies.stepChanged.calledOnce, true, "Step changed should fire");
		assert.strictEqual(this.oSpies.stepActivated.calledOnce, true, "Step changed should fire");
	});

	QUnit.test("Parameters test after nextStep()", function(assert) {
		this.oProgressNavigator.nextStep();
		assert.strictEqual(this.oParams.activatedIndex, 2, "StepActivated() should be called with parameter=2");
		assert.strictEqual(this.oParams.prevIndex, 1, "StepChanged() should be called with parameter prev=1");
		assert.strictEqual(this.oParams.currentIndex, 2, "StepChanged() should be called with parameter current=2");
	});

	QUnit.module("sap.m.WizardProgressNavigator Interaction", {
		setup: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 7
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("Tapping on NON ACTIVE step", function(assert) {
		var stepChangedSpy = sinon.spy(),
			$anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		this.oProgressNavigator.attachStepChanged(stepChangedSpy);
		$anchors.eq(1).trigger("tap");

		assert.strictEqual(stepChangedSpy.callCount, 0, "stepChanged event should NOT be fired");
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 1, "currentStep should NOT change");
	});

	QUnit.test("Tapping on ACTIVE step", function(assert) {
		var stepChangedSpy = sinon.spy(),
			$anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		this.oProgressNavigator.nextStep().previousStep();
		this.oProgressNavigator.attachStepChanged(stepChangedSpy);
		$anchors.eq(1).trigger("tap");

		assert.strictEqual(stepChangedSpy.callCount, 1, "stepChanged event should be fired once");
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 2, "currentStep should change to 2");
	});

	QUnit.module("sap.m.WizardProgressNavigator ARIA Support", {
		setup: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("When rendered only the first anchor should NOT have aria-disabled=true", function(assert) {
		var stepCount = this.oProgressNavigator.getStepCount(),
			$anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(0).attr("aria-disabled"), undefined,
			"first anchor should NOT have aria-disabled=true attribute");

		for (var i = 1; i < stepCount; i++) {
			assert.strictEqual($anchors.eq(i).attr("aria-disabled"), "true",
				"anchor should have aria-disabled=true attribute");
		}
	});

	QUnit.test("After activating the second step aria-disabled should be removed", function(assert) {
		this.oProgressNavigator.nextStep();

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(1).attr("aria-disabled"), undefined,
			"aria-disabled=true attribute should be removed from the second anchor");
	});

	QUnit.test("Current step should have aria-label=Selected", function(assert) {
		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), "Selected",
			"aria-label=Selected should be present on first anchor");
	});

	QUnit.test("Open steps should have aria-label=Processed", function(assert) {
		this.oProgressNavigator.nextStep();

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), "Processed",
			"aria-label=Processed should be present on first anchor");
	});

	QUnit.test("Discarding progress should add aria-disabled=true", function(assert) {
		this.oProgressNavigator.nextStep().nextStep().nextStep();
		this.oProgressNavigator.discardProgress(1);

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(0).attr("aria-disabled"), undefined,
			"first anchor should NOT have aria-disabled=true attribute");

		assert.strictEqual($anchors.eq(1).attr("aria-disabled"), "true",
			"second anchor should have aria-disabled=true attribute");

		assert.strictEqual($anchors.eq(2).attr("aria-disabled"), "true",
			"third anchor should have aria-disabled=true attribute");
	});

	QUnit.test("Discarding progress should remove aria-label", function(assert) {
		this.oProgressNavigator.nextStep().nextStep().nextStep();
		this.oProgressNavigator.discardProgress(1);

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), "Selected",
			"first anchor should have aria-label=Selected");

		assert.strictEqual($anchors.eq(1).attr("aria-label"), undefined,
			"second anchor should NOT have aria-label attribute");

		assert.strictEqual($anchors.eq(2).attr("aria-label"), undefined,
			"third anchor should NOT have aria-label attribute");
	});
}());
