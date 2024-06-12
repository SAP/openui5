/*global QUnit */

sap.ui.define([
	"sap/m/WizardProgressNavigator",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function(WizardProgressNavigator, Library, JSONModel, Device, InvisibleText, nextUIUpdate, QUnitUtils, KeyCodes) {
	"use strict";

	QUnit.module("sap.m.WizardProgressNavigator API", {
		oSpies: {},
		beforeEach: async function () {
			this.oSpies.stepChanged = this.spy();
			this.oProgressNavigator = new WizardProgressNavigator({
				stepChanged: this.oSpies.stepChanged,
				stepCount: 5
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
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

	QUnit.test("stepTitles should default to an empty array when NOT ALL steps have titles", async function (assert) {
		this.oProgressNavigator.setStepCount(3);
		this.oProgressNavigator.setStepIcons(["one", "two"]);
		await nextUIUpdate();

		assert.deepEqual(this.oProgressNavigator.getStepTitles(), [], "should be and empty array");
	});

	QUnit.test("Default value for stepIcons", function (assert) {
		assert.deepEqual(this.oProgressNavigator.getStepIcons(), [], "should be and empty array");
	});

	QUnit.test("stepIcons should default to an empty array when NOT ALL steps have icons", async function (assert) {
		this.oProgressNavigator.setStepCount(3);
		this.oProgressNavigator.setStepIcons(["sap-icon://warning"]);
		await nextUIUpdate();

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
		var oModifiers = this.oProgressNavigator._oStepNavigation.getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "forward item navigation is not handled when altKey is pressed");
		assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "forward item navigation on MacOS is not handled when metaKey is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "backward item navigation is not handled when altKey is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "backward item navigation on MacOS is not handled when metaKey is pressed");
	});

	QUnit.test("NextStep() should not overflow", function (assert) {
		this.oProgressNavigator._iCurrentStep = 5;

		this.oProgressNavigator.nextStep();
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 5,
			"NextStep() should not change when the ProcessSteps are exceeded");
	});

	QUnit.test("PreviousStep() should go to the previous step", function (assert) {
		this.oProgressNavigator._iCurrentStep = 2;

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
		beforeEach: async function () {
			this.oProgressNavigator = new WizardProgressNavigator();
			this.oModel = new JSONModel({
				steps: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();
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
		beforeEach: async function () {
			this.oProgressNavigator = new WizardProgressNavigator({
				stepCount: 5
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();
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

	QUnit.test("Class sapMWizardProgressNavListVarying should be present once when steps ARE varying", async function (assert) {
		this.oProgressNavigator.setVaryingStepCount(true);
		await nextUIUpdate();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListVarying").length, 1);
	});

	QUnit.test("Class sapMWizardProgressNavListNoTitles should be present once when there are NO titles", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListNoTitles").length, 1);
	});

	QUnit.test("Class sapMWizardProgressNavListNoTitles should NOT be present once when there ARE titles", async function (assert) {
		this.oProgressNavigator.setStepTitles(["1", "2", "3", "4", "5"]);
		await nextUIUpdate();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavListNoTitles").length, 0);
	});

	QUnit.test("When stepCount = 5, list items should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStep").length, 5,
			"sapMWizardProgressNavStep class should be present 5 times");
	});

	QUnit.test("When stepCount = 5, items should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStep").length, 5,
			"sapMWizardProgressNavStep class should be present 5 times");
	});

	QUnit.test("When stepCount = 5, circles should be 5", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStepCircle").length, 5,
			"sapMWizardProgressNavStepCircle class should be present 5 times");
	});

	QUnit.test("When stepCount = 5 and no titles are provided, titles should NOT be present", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStepTitle").length, 0,
			"sapMWizardProgressNavStepTitle class should be present 0 times");
	});

	QUnit.test("When stepCount = 5 and all have titles, titles should be 5", async function (assert) {
		this.oProgressNavigator.setStepTitles(["1", "2", "3", "4", "5"]);
		await nextUIUpdate();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStepTitle").length, 5,
			"sapMWizardProgressNavStepTitle class should be present 5 times");
	});

	QUnit.test("When stepCount = 5 and no icons are provided, icons should be 0", function (assert) {
		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStepIcon").length, 0,
			"sapMWizardProgressNavStepIcon class should be present 0 times");
	});

	QUnit.test("When stepCount = 5 and all have icons, icons should be 5", async function (assert) {
		this.oProgressNavigator.setStepIcons(["sap-icon://permission", "sap-icon://permission", "sap-icon://permission", "sap-icon://permission", "sap-icon://permission"]);
		await nextUIUpdate();

		var $progNav = this.oProgressNavigator.$();

		assert.strictEqual($progNav.find(".sapMWizardProgressNavStepIcon").length, 5,
			"sapMWizardProgressNavStepIcon class should be present 5 times");
	});

	QUnit.module("sap.m.WizardProgressNavigator Events", {
		beforeEach: async function () {
			var that = this;

			this.oSpies = {};
			this.oParams = {};

			this.oSpies.stepChanged = this.spy(function(event) {
				that.oParams.prevIndex = event.getParameter("previous");
				that.oParams.currentIndex = event.getParameter("current");
			});

			this.oProgressNavigator = new WizardProgressNavigator({
				stepCount: 5,
				stepChanged: this.oSpies.stepChanged
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.module("sap.m.WizardProgressNavigator Interaction", {
		beforeEach: async function () {
			this.oProgressNavigator = new WizardProgressNavigator({
				stepCount: 7
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("Tapping on action sheet on mobile should fire stepChanged", function(assert) {

		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oStepChangedSpy = this.spy(),
			$steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");
		this.oProgressNavigator.attachStepChanged(oStepChangedSpy);

		// navigate to next wizard steps
		this.oProgressNavigator.nextStep().nextStep().nextStep();
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 4, "currentStep should change");

		// open action sheet
		this.oProgressNavigator._showActionSheet($steps[0]);

		this.oProgressNavigator._oActionSheet.getButtons()[0].firePress();

		assert.strictEqual(oStepChangedSpy.callCount, 1, "stepChanged event should be fired");
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 1, "currentStep should change after interaction with the progress navigator");
	});

	QUnit.test("Tapping on NON ACTIVE step", function(assert) {
		var oStepChangedSpy = this.spy(),
			$steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		this.oProgressNavigator.attachStepChanged(oStepChangedSpy);
		$steps.eq(1).trigger("tap");

		assert.strictEqual(oStepChangedSpy.callCount, 0, "stepChanged event should NOT be fired");
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 1, "currentStep should NOT change");
	});

	QUnit.test("Tapping on ACTIVE step", function(assert) {
		var oStepChangedSpy = this.spy(),
			$steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		this.oProgressNavigator.nextStep().previousStep();
		this.oProgressNavigator.attachStepChanged(oStepChangedSpy);
		$steps.eq(1).trigger("tap");

		assert.strictEqual(oStepChangedSpy.callCount, 1, "stepChanged event should be fired once");
		assert.strictEqual(this.oProgressNavigator.getCurrentStep(), 2, "currentStep should change to 2");
	});

	QUnit.test("onsapspace", function(assert) {
		var oSpaceSpy = this.spy(this.oProgressNavigator, "onsapspace"),
			oStep = this.oProgressNavigator.getDomRef().querySelectorAll(".sapMWizardProgressNavStep")[1];

		oStep.focus();

		QUnitUtils.triggerKeydown(oStep, KeyCodes.SPACE);

		assert.ok(oSpaceSpy.called, "onsapspace should be called");
		assert.ok(oSpaceSpy.args[0][0].isDefaultPrevented(), "Default handling of space should be prevented.");
	});

	QUnit.module("sap.m.WizardProgressNavigator ARIA Support", {
		beforeEach: async function () {
			this.oProgressNavigator = new WizardProgressNavigator({
				stepCount: 5
			});

			this.oBranchingProgressNavigator = new WizardProgressNavigator({
				varyingStepCount: true
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			this.oBranchingProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oResourceBundle = Library.getResourceBundleFor("sap.m");
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oBranchingProgressNavigator.destroy();

			this.oProgressNavigator = null;
			this.oBranchingProgressNavigator = null;
		}
	});

	QUnit.test("Current step should have aria-current=true", function(assert) {
		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		assert.strictEqual($steps.eq(0).attr("aria-current"), "true",
			"aria-current=step should be present on first step");
	});

	QUnit.test("aria-current should not be presented", function(assert) {
		this.oProgressNavigator.nextStep();

		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		assert.strictEqual($steps.eq(0).attr("aria-current"), undefined,
			"aria-current should not be present on first step");
	});

	QUnit.test("Discarding progress should remove aria-current", function(assert) {
		this.oProgressNavigator.nextStep().nextStep().nextStep();
		this.oProgressNavigator.discardProgress(1);

		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		assert.strictEqual($steps.eq(0).attr("aria-current"), "true",
			"first step should have aria-current=true");

		assert.strictEqual($steps.eq(1).attr("aria-current"), undefined,
			"second step should NOT have aria-current attribute");

		assert.strictEqual($steps.eq(2).attr("aria-current"), undefined,
			"third step should NOT have aria-current attribute");
	});

	QUnit.test("WizardProgressNavigator aria-label attributes", function (assert) {
		var sAriaLabel = this.oProgressNavigator.getDomRef().getAttribute("aria-label");
		var sWizardAriaLabelText = this.oResourceBundle.getText("WIZARD_PROGRESS_NAVIGATOR_ARIA_LABEL");

		assert.strictEqual(sAriaLabel, sWizardAriaLabelText, "'aria-label' attribute should be set to '" + sWizardAriaLabelText + "'");
	});

	QUnit.test("WizardProgressNavigator aria attributes are set correctly", function (assert) {
		var sRole = this.oProgressNavigator.$().find(".sapMWizardProgressNavList").attr("role");
		var sAriaLabel = this.oProgressNavigator.$().find(".sapMWizardProgressNavList").attr("aria-label");
		var sWizardAriaLabelText = this.oResourceBundle.getText("WIZARD_PROGRESS_NAVIGATOR_LIST_ARIA_LABEL");
		var sAriaControls = this.oProgressNavigator.$().find(".sapMWizardProgressNavList").attr("aria-controls");
		var sWizardAriaControlsText = this.oProgressNavigator.getParent().sId + "-step-container";
		var sDescribedById = InvisibleText.getStaticId("sap.m", "WIZARD_PROGRESS_NAVIGATOR_LIST_ARIA_DESCRIBEDBY");
		var sDescribedByAttr = this.oProgressNavigator.$().find(".sapMWizardProgressNavList").attr("aria-describedby");

		assert.strictEqual(sAriaLabel, sWizardAriaLabelText, "'aria-label' attribute should be set to '" + sWizardAriaLabelText + "'");
		assert.strictEqual(sAriaControls, sWizardAriaControlsText, "'aria-controls' attribute should be set to '" + sWizardAriaControlsText + "'");
		assert.strictEqual(sRole, "list", "'role' attribute of the unordered list should be set to 'list'");
		assert.strictEqual(sDescribedById, sDescribedByAttr, "'aria-describedby' attribute was set with the correct invisible text.");
	});

	QUnit.test("WizardProgressNavigator li element aria attributes are set correctly", function (assert) {
		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");
		var sOptionalText, sActiveStep;
		var sWizardAriaLabelText;

		for (let i = 0; i < $steps.length; i++) {
			sOptionalText = this.oProgressNavigator._aStepOptionalIndication[i] ? "Optional " : "";
			sActiveStep = this.oProgressNavigator._isActiveStep(i + 1) ? "ACTIVE" : "INACTIVE";
			sWizardAriaLabelText = this.oResourceBundle.getText("WIZARD_STEP_" + sActiveStep + "_LABEL", [i + 1, this.oProgressNavigator.getStepTitles()[i], sOptionalText]);

			assert.strictEqual($steps.eq(i).attr("aria-label"), sWizardAriaLabelText, "'aria-label' attribute of the list item No" + (i + 1) + " should be set to '" + sWizardAriaLabelText + "'");
			assert.strictEqual($steps.eq(i).attr("role"), "listitem", "'role' attribute of the list item No" + (i + 1) + " should be set to 'listitem'");
		}
	});

	QUnit.test("WizardProgressNavigator li element aria-label attribute is updated correctly", function (assert) {
		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep");

		// assert
		assert.strictEqual($steps.eq(1).attr("aria-label").indexOf(" Inactive") !== -1, true, "'aria-label' attribute of the list item states the step is inactive");

		// act
		this.oProgressNavigator._moveToStep(2);

		// assert
		assert.strictEqual($steps.eq(1).attr("aria-label").indexOf(" Active") !== -1, true, "'aria-label' attribute of the list item states the step is active");
	});

	QUnit.test("WizardProgressNavigator aria-posinset and aria-setsize attribute should be set correctly.", async function (assert) {
		//Arrange
		var $steps = this.oProgressNavigator.$().find(".sapMWizardProgressNavStep"),
			$branchingSteps = this.oBranchingProgressNavigator.$().find(".sapMWizardProgressNavStep");

		//Assert
		for (let i = 0; i < $steps.length; i++){
			assert.strictEqual($steps.eq(i).attr("aria-posinset"), "" + (i + 1) + "", "'aria-posinset' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + i + "'");
			assert.strictEqual($steps.eq(i).attr("aria-setsize"), "5", "'aria-setsize' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + 5 + "'");
		}

		for (let i = 0; i < $branchingSteps.length; i++){
			assert.strictEqual($branchingSteps.eq(i).attr("aria-posinset"), "" + (i + 1) + "", "'aria-posinset' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + i + "'");
			assert.strictEqual($branchingSteps.eq(i).attr("aria-setsize"), "-1", "'aria-setsize' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + -1 + "'");
		}

		//Act
		this.oBranchingProgressNavigator.setVaryingStepCount(false);
		await nextUIUpdate();

		//Assert
		for (let i = 0; i < $branchingSteps.length; i++){
			assert.strictEqual($branchingSteps.eq(i).attr("aria-posinset"), "" + (i + 1) + "", "'aria-posinset' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + i + "'");
			assert.strictEqual($branchingSteps.eq(i).attr("aria-setsize"), "3", "'aria-setsize' attribute of the WizardProgressNavigator's list item No" + (i + 1) + " should be set to '" + 3 + "'");
		}
	});

	QUnit.module("Error robustness", {
		beforeEach: async function () {
			this.oProgressNavigator = new WizardProgressNavigator({
				stepCount: 3
			});

			this.oProgressNavigator.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oProgressNavigator.destroy();
			this.oProgressNavigator = null;
		}
	});

	QUnit.test("_updateOpenSteps should not throw when this._aCachedSteps is undefined.", function (assert) {
		var oThrowSpy = this.spy(this.oProgressNavigator, "_updateOpenSteps");

		// arrange
		this.oProgressNavigator._aCachedSteps = undefined;

		// act
		try {
			oThrowSpy.apply(this.oProgressNavigator);
		} catch (e) {
			// continue
		}

		// assert
		assert.ok(!oThrowSpy.threw(), "The method didn't threw.");
	});
});