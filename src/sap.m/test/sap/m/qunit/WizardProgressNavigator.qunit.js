/*global QUnit,sinon*/

(function () {
	"use strict";

	jQuery.sap.require("sap.m.WizardProgressNavigator");

	QUnit.module("sap.m.WizardProgressNavigator API", {
		oSpies: {},
		beforeEach: function () {
			this.oSpies.stepChanged = sinon.spy();
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepChanged: this.oSpies.stepChanged,
				stepCount: 5
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
		}
	});

	QUnit.test("Default value for varyingStepCount", function (assert) {
		assert.strictEqual(this.oProgressNavigator.getVaryingStepCount(), false, "should be false");
	});

	QUnit.test("Default value for stepTitles", function (assert) {
		assert.deepEqual(this.oProgressNavigator.getStepTitles(), [], "should be and empty array");
	});

	QUnit.test("stepTitles should default to an empty array when NOT ALL steps have titles", function (assert) {
		this.oProgressNavigator.setStepCount(3);
		this.oProgressNavigator.setStepIcons(["one", "two"]);
		sap.ui.getCore().applyChanges();

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

	QUnit.test("NextStep() should not fire stepChanged event", function (assert) {
		this.oProgressNavigator.nextStep();
		assert.strictEqual(!this.oSpies.stepChanged.calledOnce, true, "Event should not be fired");
	});

	QUnit.test("PreviousStep() should not fire stepChanged event", function (assert) {
		this.oProgressNavigator.nextStep(true);
		this.oProgressNavigator.previousStep();
		assert.strictEqual(!this.oSpies.stepChanged.calledOnce, true, "Event should not be fired");
	});

	QUnit.test("DiscardProgress() should not fire stepChanged event", function (assert) {
		this.oProgressNavigator.nextStep(true);
		this.oProgressNavigator.nextStep(true);
		this.oProgressNavigator.discardProgress(1);
		assert.strictEqual(!this.oSpies.stepChanged.calledOnce, true, "Event should not be fired");
	});

	QUnit.test("alt + right/left is not handled", function(assert) {
		var oModifiers = this.oProgressNavigator._anchorNavigation.getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.equal(oModifiers["sapnext"][0], "alt", "alt is not handled when right is pressed");
		assert.equal(oModifiers["sapprevious"][0], "alt", "alt is not handled when left is pressed");
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
		beforeEach: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator();
			this.oModel = new sap.ui.model.json.JSONModel({
				steps: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
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
		beforeEach: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("Root element should have sapMWizardProgressNav class", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.hasClass("sapMWizardProgressNav"), true);
	});

	QUnit.test("Class sapMWizardProgressNavList should be present once when steps ARE NOT varying", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavList").length, 1);
	});

	QUnit.test("Class sapMWizardProgressNavListVarying should be present once when steps ARE varying", function (assert) {
		this.oProgressNavigator.setVaryingStepCount(true);
		sap.ui.getCore().applyChanges();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListVarying").length, 1);
	});

	QUnit.test("Class sapMWizardProgressNavListNoTitles should be present once when there are NO titles", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListNoTitles").length, 1);
	});

	QUnit.test("Class sapMWizardProgressNavListNoTitles should NOT be present once when there ARE titles", function (assert) {
		this.oProgressNavigator.setStepTitles(["1", "2", "3", "4", "5"]);
		sap.ui.getCore().applyChanges();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListNoTitles").length, 0);
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

	QUnit.test("When stepCount = 5, circles should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchorCircle").length, 5,
			"sapMWizardProgressNavAnchorCircle class should be present 5 times");
	});

	QUnit.test("When stepCount = 5 and no titles are provided, titles should NOT be present", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchorTitle").length, 0,
			"sapMWizardProgressNavAnchorTitle class should be present 0 times");
	});

	QUnit.test("When stepCount = 5 and all have titles, titles should be 5", function (assert) {
		this.oProgressNavigator.setStepTitles(["1", "2", "3", "4", "5"]);
		sap.ui.getCore().applyChanges();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchorTitle").length, 5,
			"sapMWizardProgressNavAnchorTitle class should be present 5 times");
	});

	QUnit.test("When stepCount = 5 and no icons are provided, icons should be 0", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchorIcon").length, 0,
			"sapMWizardProgressNavAnchorIcon class should be present 0 times");
	});

	QUnit.test("When stepCount = 5 and all have icons, icons should be 5", function (assert) {
		this.oProgressNavigator.setStepIcons(["sap-icon://permission", "sap-icon://permission", "sap-icon://permission", "sap-icon://permission", "sap-icon://permission"]);
		sap.ui.getCore().applyChanges();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavAnchorIcon").length, 5,
			"sapMWizardProgressNavAnchorIcon class should be present 5 times");
	});

	QUnit.module("sap.m.WizardProgressNavigator Events", {
		beforeEach: function () {
			var that = this;

			this.oSpies = {};
			this.oParams = {};

			this.oSpies.stepChanged = sinon.spy(function(event) {
				that.oParams.prevIndex = event.getParameter("previous");
				that.oParams.currentIndex = event.getParameter("current");
			});

			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5,
				stepChanged: this.oSpies.stepChanged
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.module("sap.m.WizardProgressNavigator Interaction", {
		beforeEach: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 7
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
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
		beforeEach: function () {
			this.oProgressNavigator = new sap.m.WizardProgressNavigator({
				stepCount: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		},
		afterEach: function () {
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

	QUnit.test("After a step had already been active it should not have aria-disabled=true", function (assert) {
		this.oProgressNavigator.nextStep();
		this.oProgressNavigator.nextStep();
		// we need to force rerendering as in normal case when moving from step to step the ProgressNavigator is rerendered
		this.oProgressNavigator.rerender();

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor");
		assert.strictEqual($anchors.eq(0).attr("aria-disabled"), undefined,
			"aria-disabled=true attribute should be removed from previous active anchor");
		assert.strictEqual($anchors.eq(1).attr("aria-disabled"), undefined,
			"aria-disabled=true attribute should be removed from previous active anchor");
	});

	QUnit.test("Current step should have aria-label=Selected", function(assert) {
		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor"),
			sSelectedText = this.oResourceBundle.getText("WIZARD_PROG_NAV_SELECTED");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), sSelectedText,
			"aria-label=Selected should be present on first anchor");
	});

	QUnit.test("Open steps should have aria-label=Processed", function(assert) {
		this.oProgressNavigator.nextStep();

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor"),
			sProcessedText = this.oResourceBundle.getText("WIZARD_PROG_NAV_PROCESSED");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), sProcessedText,
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

		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor"),
			sSelectedText = this.oResourceBundle.getText("WIZARD_PROG_NAV_SELECTED");

		assert.strictEqual($anchors.eq(0).attr("aria-label"), sSelectedText,
			"first anchor should have aria-label=Selected");

		assert.strictEqual($anchors.eq(1).attr("aria-label"), undefined,
			"second anchor should NOT have aria-label attribute");

		assert.strictEqual($anchors.eq(2).attr("aria-label"), undefined,
			"third anchor should NOT have aria-label attribute");
	});

	QUnit.test("WizardProgressNavigator aria-label attribute", function (assert) {
		var sAriaLabel = this.oProgressNavigator.$().attr("aria-label");
		var sWizardProgressNavLabel = this.oResourceBundle.getText("WIZARD_LABEL");
		assert.strictEqual(sAriaLabel, sWizardProgressNavLabel, "'aria-label' attribute should be set to '" + sWizardProgressNavLabel + "'");
	});

	QUnit.test("WizardProgressNavigator role attribute", function (assert) {
		var sRole = this.oProgressNavigator.$().attr("role");
		assert.strictEqual(sRole, "navigation", "'role' attribute should be set to 'navigation'");
	});

	QUnit.test("WizardProgressNavigator ul element role attribute", function (assert) {
		var sRole = this.oProgressNavigator.$().find(".sapMWizardProgressNavList").attr("role");
		assert.strictEqual(sRole, "list", "'role' attribute of the unordered list should be set to 'list'");
	});

	QUnit.test("WizardProgressNavigator li element role attribute", function (assert) {
		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");
		for (var i = 0; i < $steps.length; i++){
			assert.strictEqual($steps.eq(i).attr("role"), "listitem", "'role' attribute of the list item No" + (i + 1) + " should be set to 'listitem'");
		}
	});

	QUnit.test("WizardProgressNavigator anchor element title attribute", function (assert) {
		var $anchors = this.oProgressNavigator.$().find(".sapMWizardProgressNavAnchor"),
			sStepText = this.oResourceBundle.getText("WIZARD_PROG_NAV_STEP_TITLE");
		for (var i = 0; i < $anchors.length; i++){
			var sStepTitle = sStepText + " " + (i + 1);
			assert.strictEqual($anchors.eq(i).attr("title"), sStepTitle, "'title' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + sStepTitle + "'");
		}
	});
}());
