/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/DesignTime",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Wizard",
	"sap/m/WizardStep",
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/base/ObjectPool",
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function(Log, DesignTime, nextUIUpdate, Wizard, WizardStep, Button, Input, ObjectPool, library, Library, coreLibrary, qutils, KeyCodes, jQuery) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = library.PageBackgroundDesign;

	// shortcut for sap.m.WizardRenderMode
	var WizardRenderMode = library.WizardRenderMode;

	function runAllTimersAndRestore(clock){
		clock.runAll();
		clock.restore();
	}

	QUnit.module("Wizard Public API", {
		sWizardId: "wizard-id",
		oSpies: {},
		beforeEach: async function (assert) {
			var that = this;
			this.oParams = {};
			this.oSpies.onStepActivated = this.spy(function (oEvent) {
				that.oParams.index = oEvent.getParameter("index");
			});
			this.oSpies.onStepChanged = this.spy(function (oEvent) {
				that.oParams.previous = oEvent.getParameter("previous");
				that.oParams.current = oEvent.getParameter("current");
			});
			this.oSpies.onNavigationChanged = this.spy(function (oEvent) {
				that.oParams.step = oEvent.getParameter("step");
			});
			this.oSpies.onComplete = this.spy();
			this.oSpies.error = this.spy(Log, "error");

			this.oSpies.firstStep = {
				onActivate: this.spy(),
				onComplete: this.spy()
			};

			this.oSpies.secondStep = {
				onActivate: this.spy(),
				onComplete: this.spy()
			};

			this.oWizard = new Wizard(this.sWizardId, {
				stepActivate: this.oSpies.onStepActivated,
				complete: this.oSpies.onComplete,
				navigationChange: this.oSpies.onNavigationChanged,
				steps: [
					new WizardStep({
						title: "Step 1",
						validated: false,
						activate: this.oSpies.firstStep.onActivate,
						complete: this.oSpies.firstStep.onComplete
					}),
					new WizardStep({
						validated: true,
						title: "Step 2",
						activate: this.oSpies.secondStep.onActivate,
						complete: this.oSpies.secondStep.onComplete
					}),
					new WizardStep({
						title: "Step 3"
					})
				]
			});

			this.oWizardSecondStep = this.oWizard.getSteps()[1];
			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.stub(ObjectPool.prototype, "returnObject").callsFake(function () {
			});

			this.oResourceBundle = Library.getResourceBundleFor("sap.m");

		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizardSecondStep = null;
			this.oWizard = null;
		}
	});

	QUnit.test("stepTitleLevel property", async function (assert) {
		//assert
		assert.strictEqual(this.oWizard.getStepTitleLevel(), "H3", "default steps title level is correct");

		//act
		this.oWizard.setStepTitleLevel(TitleLevel.H5);
		await nextUIUpdate();

		//assert
		assert.strictEqual(this.oWizard.getStepTitleLevel(), "H5", "steps title level is updated");

		//arrange
		var sWizardFirstStepId = this.oWizard.getSteps()[0].getId(),
		oTitleDomRef = document.getElementById(sWizardFirstStepId + "-Title");

		//assert
		assert.strictEqual(oTitleDomRef.tagName, "H5", "HTML element is changed");
	});

	QUnit.test("Test F6 and Shift+F6 Focus Navigation Across Wizard Steps", async function(assert) {
		const oWizard = new Wizard("wizard-nav-id-f6", {
			steps: [
				new WizardStep({
					validated: true,
					title: "Step 1"
				}),
				new WizardStep({
					validated: true,
					title: "Step 2",
					content: [
						new Button({ text: "Button Step 2" }),
						new Input({ placeholder: "Input field" })
					]
				}),
				new WizardStep({
					title: "Step 3",
					content: [
						new Button({ text: "Button Step 3" })
					]
				})
			]
		});

		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.clock = sinon.useFakeTimers();

		let oNextButton = oWizard._getNextButton();
		const oButtonStep2 = oWizard.getSteps()[1].getContent()[0];
		const oInputStep2 = oWizard.getSteps()[1].getContent()[1];

		// act
		oNextButton.focus();
		oNextButton.$().tap();
		this.clock.tick(500);

		// assert
		oNextButton = oWizard._getNextButton();
		assert.strictEqual(oWizard.getProgressStep().getTitle(), "Step 2", "Wizard should navigate to Step 2 when the Next button is clicked.");
		assert.strictEqual(oWizard.getProgressStep().getId(), oWizard.getSteps()[1].getId(), "The active step ID should match the ID of Step 2.");
		assert.strictEqual(document.activeElement, oButtonStep2.getFocusDomRef(), "Focus should move to the first interactive element (Button) in Step 2.");

		// act
		qutils.triggerKeydown(oButtonStep2.getDomRef(), KeyCodes.F6, true, false, false);

		// assert
		assert.strictEqual(Number(document.activeElement.ariaPosInSet),oWizard.getProgress(), "When Shift+F6 is pressed, focus should move back to the Progress navigator, because there is no interactive element in Step 1.");

		// act
		qutils.triggerKeydown(oWizard.getDomRef(), KeyCodes.F6);

		// assert
		assert.notOk(document.activeElement === oInputStep2.getFocusDomRef(), "Focus should not move to the input field in Step 2 after pressing F6 from the Progress Navigator.");
		assert.strictEqual(document.activeElement, oButtonStep2.getFocusDomRef(), "Focus should move to the first button in Step 2 after pressing F6 from the Progress Navigator.");

		// act
		qutils.triggerKeydown(oButtonStep2.getDomRef(), KeyCodes.F6);

		// assert
		assert.strictEqual(document.activeElement, oWizard._getNextButton().getFocusDomRef(), "Focus should move to the Next Step button after pressing F6 from the current interactive element.");

		oWizard.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("getId() should return correct id", function (assert) {
		var sId = this.oWizard.getId();
		assert.strictEqual(sId, this.sWizardId, "#" + sId + " should be equal to #" + this.sWizardId);
	});

	QUnit.test("default text of finish button", function (assert) {
		this.oWizard.nextStep();
		this.oWizard.nextStep();
		var text = this.oWizard._getNextButtonText(),
			sText = this.oResourceBundle.getText("WIZARD_FINISH");
		assert.strictEqual(text, sText, "Default text of finish button should be equal to '" + sText + "'");
	});

	QUnit.test("Wizard setCurrentStep", function (assert) {
		this.oWizard.setCurrentStep(this.oWizard.getSteps()[1]);
		assert.ok(this.oSpies.firstStep.onComplete.calledOnce, " should call the complete event of step 1.");
		assert.ok(this.oSpies.secondStep.onActivate.calledOnce, " should call the activate event of step 2.");
	});

	QUnit.test("Wizard nextStep()", function (assert) {
		this.oWizard.nextStep().nextStep();
		assert.equal(this.oWizard.getCurrentStep(), this.oWizard.getSteps()[2].getId(), " should change the current step.");
	});

	QUnit.test("Wizard discardProgress()", function (assert) {
		this.oWizard.nextStep().nextStep();
		this.oWizard.discardProgress(this.oWizard.getSteps()[0]);
		assert.equal(this.oWizard.getCurrentStep(), this.oWizard.getSteps()[0].getId(), " should change the current step");
	});

	QUnit.test("Wizard setCurrentStep()", function (assert) {
		this.oWizard.nextStep().nextStep();
		this.oWizard.setCurrentStep(this.oWizard.getSteps()[0]);
		assert.equal(this.oWizard.getSteps()[0].getValidated(), true, " should not reset the validated state");
	});

	QUnit.test("Wizard setCurrentStep() and setValidated()", function (assert) {
		this.oWizard.nextStep().nextStep();
		this.oWizard.setCurrentStep(this.oWizard.getSteps()[0]);
		this.oWizard.getSteps()[0].setValidated(false);
		assert.equal(this.oWizard.getSteps()[0].getValidated(), false, " should invalidate the current step");
	});

	QUnit.test("Scroll handler", async function (assert) {
		var tempWiz = new Wizard({
			steps: [ new WizardStep(), new WizardStep(), new WizardStep() ]
		});

		tempWiz.placeAt("qunit-fixture");
		await nextUIUpdate();
		var stepContainer = tempWiz.getDomRef("step-container");
		tempWiz.nextStep();
		tempWiz.destroy();
		assert.equal(stepContainer.onscroll, null, " should be null when wizard is destroyed");
	});

	QUnit.test("ScrollHandler methods check", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oSpyPreviousStep,
			oSpyNextStep,
			aWizardSteps,
			oWizard = new Wizard({
				navigationChange: this.oSpies.onNavigationChanged,
				steps: [ new WizardStep(), new WizardStep(), new WizardStep() ]
			});

		// Arrange
		oSpyPreviousStep = this.spy(oWizard._getProgressNavigator(), "previousStep");
		oSpyNextStep = this.spy(oWizard._getProgressNavigator(), "nextStep");
		aWizardSteps = oWizard.getSteps();
		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		oWizard.goToStep(oWizard.getSteps()[2]);

		// Act
		oWizard._scrollHandler({target: {scrollTop: -100}});
		this.clock.tick(300);

		// Assert
		assert.equal(oSpyPreviousStep.callCount, aWizardSteps.length, "Previous step should be called once");
		assert.ok(this.oSpies.onNavigationChanged.called, "navigationChange should be fired");

		// Arrange
		this.clock.tick(300);
		this.stub(oWizard._getProgressNavigator(), '_isActiveStep').returns(true);
		oWizard._bScrollLocked = false;

		// Act
		oWizard._scrollHandler({target: {scrollTop: 900}});

		// Assert
		assert.ok(oSpyNextStep.calledOnce, "Next step should be called once");
		assert.ok(this.oSpies.onNavigationChanged.called, "navigationChange should be fired");


		// cleanup
		oWizard.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("goToStep should be applied on id, containing with special symbols (::)", async function (assert) {
		var oWizard = new Wizard({
			id: "wizard::complex::id",
			steps: [ new WizardStep(), new WizardStep(), new WizardStep() ]
		});
		var oSpy = this.spy(oWizard, "goToStep");

		oWizard._getNextStep();
		oWizard._getNextStep();
		oWizard.placeAt("qunit-fixture");

		await nextUIUpdate();
		oWizard.goToStep(oWizard.getSteps()[0]);

		assert.ok(oSpy.returned(oWizard), "goToStep is executed");

		oWizard.destroy();
	});

	QUnit.test("setFinishLabel() should change the finish button text", function (assert) {
		this.oWizard.setFinishButtonText("changed_finish");
		this.oWizard.nextStep();
		this.oWizard.nextStep();
		var text = this.oWizard._getNextButtonText();

		assert.strictEqual(text, "changed_finish", "Text of finish button should be equal to 'changed_finish'");
	});

	QUnit.test("addStep() should increment the default value", function (assert) {
		this.oWizard.addStep(new WizardStep());
		assert.strictEqual(this.oWizard._getProgressNavigator().getStepCount(), 4, " of the progress navigator steps");
		assert.strictEqual(this.oWizard.getSteps().length, 4, " of the step navigator");
	});

	QUnit.test("addStep() should log an error", function (assert) {
		// 3 steps are already added to the Wizard
		for (let i = 0; i < 6; i++) {
			this.oWizard.addStep(new WizardStep());
		}

		assert.ok(this.oSpies.error.calledOnce, "Wizard should log error when maximum allowed steps are exceeded.");
	});

	QUnit.test("Validate min step count inside onBeforeRendering", async function (assert) {
		var oWizard = new Wizard({
			id: "wizard::id",
			steps: [ new WizardStep(), new WizardStep()]
		});

		oWizard.placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.ok(this.oSpies.error.calledOnce, "Wizard should log error when minimum allowed step number is not met.");

		oWizard.addStep(new WizardStep());

		assert.ok(this.oSpies.error.calledOnce, "Wizard should not log an error again as the minimum allowed step number is reached");

		oWizard.destroy();
	});

	QUnit.test("Validate max step count inside onBeforeRendering", async function (assert) {
		var oWizard = new Wizard({
			id: "wizard::id",
			steps: [ new WizardStep(), new WizardStep(), new WizardStep(), new WizardStep(),
				new WizardStep(), new WizardStep(), new WizardStep(), new WizardStep()]
		});

		oWizard.placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.notOk(this.oSpies.error.calledOnce, "Wizard should not log error when max allowed step number is reached.");

		oWizard.addStep(new WizardStep());

		assert.ok(this.oSpies.error.calledOnce, "Wizard should log an error as the maximum allowed step number is exceeded");

		oWizard.destroy();
	});

	QUnit.test("DestroySteps() empties the steps aggregation", async function (assert) {
		//Arrange
		var oSpy = this.spy(Wizard.prototype, "_activateAllPreceedingSteps");

		//Act
		this.oWizard.destroySteps();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oWizard.getSteps().length === 0, "Aggregation should be empty");
		assert.notOk(oSpy.called, "_activateAllPreceedingSteps should not be called after deleting the steps");
	});

	QUnit.test("validateStep(step) should validate the given step", function (assert) {
		var step1 = this.oWizard._getStartingStep();
		this.oWizard.validateStep(step1);
		assert.ok(this.oWizard.getSteps()[0].getValidated(), "Step should be validated");
	});

	QUnit.test("validateStep(step) shoud log an error", function (assert) {
		this.oWizard.validateStep(new WizardStep({}));
		assert.strictEqual(this.oSpies.error.calledOnce, true, "Wizard should log an error if step does not exist in wizard");
	});

	QUnit.test("invalidateStep(step) should invalidate the given step", function (assert) {
		this.oWizard._getNextButton().firePress();
		this.oWizard.invalidateStep(this.oWizard._getStartingStep());
		assert.ok(!this.oWizard.getSteps()[0].getValidated(), "Step should not be validated");
		this.oWizard.invalidateStep(new WizardStep({}));

		assert.strictEqual(this.oSpies.error.calledOnce, true, "Wizard should log an error if step does not exist in wizard");
	});

	QUnit.test("validateStep(step) should change the enablement of the button", function (assert) {
		this.oWizard.validateStep(this.oWizard._getStartingStep());
		var oButton = this.oWizard._getNextButton();
		assert.ok(oButton.getEnabled(), "Button should be enabled");
	});

	QUnit.test("Click on next button should change the current step", function (assert) {
		var iCurrentStep = this.oWizard._getProgressNavigator().getCurrentStep();
		this.oWizard.validateStep(0);
		this.oWizard._getNextButton().firePress();
		assert.strictEqual(iCurrentStep + 1, this.oWizard._getProgressNavigator().getCurrentStep(), "Should change the current step with 1.");
	});

	QUnit.test("Click on next button should fire WizardStep events", function (assert) {
		this.oWizard._getNextButton().firePress();
		assert.strictEqual(this.oSpies.firstStep.onActivate.called, true, "Activation of first step should be called by default");
		assert.strictEqual(this.oSpies.firstStep.onComplete.calledOnce, true, "Complete of first step should be called");
		assert.strictEqual(this.oSpies.secondStep.onActivate.calledOnce, true, "Activation of second step should be called");
		assert.strictEqual(this.oSpies.firstStep.onComplete.calledBefore(this.oSpies.secondStep.onActivate), true, "Complete of first step should be called before activation of second");
	});

	QUnit.test("Click on next button should fire Wizard events", function (assert) {
		this.oWizard._getNextButton().firePress();
		assert.strictEqual(this.oSpies.onStepActivated.calledOnce, true, "StepActivate should be fired");
		assert.notOk(this.oSpies.onNavigationChanged.called, "NavigationChange should not be fired");
	});

	QUnit.test("Click on next button should fire _handleNextButtonPress before (not as) the attachEvent handler of the 'complete' event is executed", function (assert) {
		var oNextButtenPressHandlerSpy = this.spy(this.oWizard, "_handleNextButtonPress");
		var oAttachCompleteSpy = this.spy(this.oWizard, "attachComplete");

		this.oWizard._getNextButton().firePress();
		assert.strictEqual(oNextButtenPressHandlerSpy.calledBefore(oAttachCompleteSpy), true, "_handleNextButtonPress is fired not as attachEvent handler for the 'complete' event");
	});

	QUnit.test("Click on next button should change the enable state of the button", function (assert) {
		this.clock = sinon.useFakeTimers();
		this.oWizard.invalidateStep(this.oWizard._getStartingStep());
		this.clock.tick(500);

		var firstStepVisibility = !this.oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden");
		this.oWizard._getNextButton().firePress();
		this.clock.tick(500);

		assert.strictEqual(firstStepVisibility, false, "On the first step button should not be visible");
		assert.strictEqual(!this.oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden"), true, "On the second step button should be visible");

		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("Click on next on lastStep should call complete", function (assert) {
		this.oWizard._getNextButton().firePress();	//step2
		this.oWizard._getNextButton().firePress();	//step3
		this.oWizard._getNextButton().firePress(); //complete

		assert.strictEqual(this.oSpies.onComplete.calledOnce, true, "OnComplete should be called");
	});

	QUnit.test("Click on next button should change text going to last step", function (assert) {
		this.oWizard._getNextButton().firePress();	//step2
		this.oWizard._getNextButton().firePress();	//step3
		var sText = this.oResourceBundle.getText("WIZARD_FINISH");

		assert.strictEqual(this.oWizard._getNextButtonText(), sText, "Text should be changed to " + sText);
	});

	QUnit.test("Click on next button should change WizardStep visibility", function (assert) {
		var steps = this.oWizard.getSteps();

		assert.strictEqual(steps[0].$().css("display"), "block", "First step should be visible");
		assert.strictEqual(steps[1].$().css("display"), "none", "Second step should not be visible");
		this.oWizard._getNextButton().firePress();
		assert.strictEqual(steps[1].$().css("display"), "block", "Second step should be visible");

	});

	QUnit.test("Wizard events should be called with proper parameters", function (assert) {
		this.oWizard._getNextButton().firePress();
		assert.strictEqual(this.oParams.index, 2, "StepActivated() should be called with parameter=2");
	});

	QUnit.test("Next button should not be visible on non validated step", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oButton = this.oWizard._getNextButton();
		this.oWizard.getSteps()[0].setValidated(false);
		this.clock.tick(500);

		assert.ok(oButton.hasStyleClass("sapMWizardNextButtonHidden"), "Button should not be visible");
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("GetProgress() should return the progress of the wizard", function (assert) {
		var oButton = this.oWizard._getNextButton();
		oButton.firePress();
		oButton.firePress();
		assert.strictEqual(this.oWizard.getProgress(), 3, "Progress should be 3");
	});

	QUnit.test("DiscardProgress() should return the wizard instance", function (assert) {
		var oButton = this.oWizard._getNextButton(), vResult;
		oButton.firePress();
		oButton.firePress();
		oButton.firePress();

		vResult = this.oWizard.discardProgress(this.oWizardSecondStep);
		assert.strictEqual(vResult, this.oWizard, "The Wizard instance returned correctly");

		vResult = this.oWizard.discardProgress();
		assert.strictEqual(vResult, this.oWizard, "The Wizard instance returned correctly when no step provided");
	});

	QUnit.test("DiscardProgress() should reset the steps after a given step", function (assert) {
		var oButton = this.oWizard._getNextButton();
		oButton.firePress();
		oButton.firePress();
		oButton.firePress();
		this.oWizard.discardProgress(this.oWizardSecondStep);
		assert.strictEqual(this.oWizard.getProgress(), 2, "Progress should be 1");
	});

	QUnit.test("DiscardProgress() ", function (assert) {
		this.oWizard.nextStep().nextStep();
		this.oWizard.discardProgress(this.oWizard.getSteps()[0]);
		assert.strictEqual(this.oWizard.getSteps()[0].getValidated(), true, "should not reset the initial validated state");
	});

	QUnit.test("DiscardProgress() with setValidated()", function (assert) {
		this.oWizard.nextStep().nextStep();
		this.oWizard.discardProgress(this.oWizard.getSteps()[0]);
		this.oWizard.getSteps()[0].setValidated(false);
		assert.strictEqual(this.oWizard.getSteps()[0].getValidated(), false, "should validate the current step after discarding the progress");
	});

	QUnit.test("DiscardProgress() should hide the steps after the step", function (assert) {
		var oButton = this.oWizard._getNextButton();
		oButton.firePress();
		oButton.firePress();
		oButton.firePress();
		this.oWizard.discardProgress(this.oWizardSecondStep);
		assert.strictEqual(this.oWizard.getSteps()[2].$().css("display"), "none", "Step should be hidden");
	});

	QUnit.test("nextStep() should change the current step of the wizard", function (assert) {
		this.oWizard.nextStep();
		assert.strictEqual(this.oWizard.getProgress(), 2, "Should be at step 2");
	});

	QUnit.test("previousStep() should change the current step of the wizard", function (assert) {
		 this.oWizard.nextStep();
		 this.oWizard.nextStep();
		 this.oWizard.previousStep();
		 assert.strictEqual(this.oWizard.getProgress(), 2, "Should be at step 1");
	 });

	QUnit.test("setVisible() of WizardStep should not change the visibility of the steps", async function (assert) {
		var step0 = this.oWizard.getSteps()[0];
		var domRefInit = step0.$()[0];
		step0.setVisible(false);
		await nextUIUpdate();
		assert.equal(step0.$()[0], domRefInit, "setVisible(false) of the wizardStep should not hide the step");
	});

	QUnit.test("nextStep().nextStep() chaining nextStep method should be possible", function (assert) {
		assert.ok(this.oWizard.nextStep().nextStep(), "nextStep chaining should not throw an error");
	});

	QUnit.test("preivousStep().previousStep() chaining previousStep method should be possible", function (assert) {
		this.oWizard.nextStep().nextStep();
		assert.ok(this.oWizard.previousStep().previousStep(), "previousStep chaining should not throw an Error");
	});

	QUnit.test("currentStep is set correctly", async function (assert) {
		var oStep1 = new WizardStep({id: "firstStep", title: "First", optional: true}),
			oStep2 = new WizardStep({id: "secondStep", title: "Second", optional: false}),
			oStep3 = new WizardStep({id: "thirdStep", title: "Third"});

		var oWizard = new Wizard({
				currentStep: "thirdStep",
				steps: [oStep1, oStep2, oStep3]
			});

		// arrange
		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate();

		//assert
		assert.strictEqual(oWizard.getCurrentStep(), oWizard.getSteps()[2].getId(), "The currentStep is the correct one.");

		// clean up
		oWizard.destroy();
	});

	QUnit.test("Optional Step property", async function (assert) {
		var oNavigator,
			oFirstStepRef,
			oSecondStepRef,
			oWizard = new Wizard({
				steps: [
					new WizardStep({
						title: "First",
						optional: true
					}),
					new WizardStep({
						title: "Second",
						optional: false
					}),
					new WizardStep({
						title: "Third"
					})
				]
			});

		// arrange
		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate();

		oNavigator = oWizard._getProgressNavigator();
		oFirstStepRef = jQuery(oNavigator.$().find("li")[0]);
		oSecondStepRef = jQuery(oNavigator.$().find("li")[1]);

		// assert
		assert.strictEqual(oFirstStepRef.find(".sapMWizardProgressNavStepLabelOptional").length, 1, "An element with style class sapMWizardProgressNavStepLabelOptional should be added");
		assert.strictEqual(oSecondStepRef.find(".sapMWizardProgressNavStepLabelOptional").length, 0, "An element with style class sapMWizardProgressNavStepLabelOptional should not be added");

		// clean up
		oWizard.destroy();
	});

	QUnit.test("addStep - next button handler propagation", async function (assert) {
		var oStep1 = new WizardStep({
			title: "First"
		}), oWizard = new Wizard({
			steps: [oStep1]
		});

		await nextUIUpdate();

		// act
		oWizard.removeAllSteps();

		await nextUIUpdate();
		oWizard.addStep(oStep1);

		// assert
		assert.strictEqual(oStep1._oNextButton.mEventRegistry.press.length, 1,
			"Only one press handler is attached to the next button.");

		// clean up
		oWizard.destroy();
	});

	QUnit.test("default backgroundDesign should be 'Standard'", function (assert) {
		// Arrange
		var $oDomRef = this.oWizard.$();

		// Assert
		assert.ok(!$oDomRef.hasClass("sapMWizardBgSolid"), "HTML class for Solid is not set");
		assert.ok($oDomRef.hasClass("sapMWizardBgStandard"), "HTML class for Standard is set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgTransparent"), "HTML class for Transparent is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgList"), "HTML class for List is not set");
	});

	QUnit.test("backgroundDesign should be set to 'Solid'", function (assert) {
		// Arrange
		var $oDomRef = this.oWizard.$();

		// Act
		this.oWizard.setBackgroundDesign(PageBackgroundDesign.Solid);

		// Assert
		assert.ok($oDomRef.hasClass("sapMWizardBgSolid"), "HTML class for Solid is set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgStandard"), "HTML class for Standard is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgTransparent"), "HTML class for Transparent is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgList"), "HTML class for List is not set");
	});

	QUnit.test("backgroundDesign should be set to 'Transparent'", function (assert) {
		// Arrange
		var $oDomRef = this.oWizard.$();

		// Act
		this.oWizard.setBackgroundDesign(PageBackgroundDesign.Transparent);

		// Assert
		assert.ok(!$oDomRef.hasClass("sapMWizardBgSolid"), "HTML class for Solid is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgStandard"), "HTML class for Standard is not set");
		assert.ok($oDomRef.hasClass("sapMWizardBgTransparent"), "HTML class for Transparent is set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgList"), "HTML class for List is not set");
	});

	QUnit.test("backgroundDesign should be set to 'List'", function (assert) {
		// Arrange
		var $oDomRef = this.oWizard.$();

		// Act
		this.oWizard.setBackgroundDesign(PageBackgroundDesign.List);

		// Assert
		assert.ok(!$oDomRef.hasClass("sapMWizardBgSolid"), "HTML class for Solid is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgStandard"), "HTML class for Standard is not set");
		assert.ok(!$oDomRef.hasClass("sapMWizardBgTransparent"), "HTML class for Transparent is not set");
		assert.ok($oDomRef.hasClass("sapMWizardBgList"), "HTML class for List is set");
	});

	QUnit.test("insertStep should work when designMode is true", function (assert) {
		this.stub(DesignTime, "isDesignModeEnabled").returns(true);
		var oWizard = new Wizard();
		var oFirstStep = new WizardStep({ title: "First" });
		var oSecondStep = new WizardStep({ title: "Second" });

		oWizard.insertStep(oFirstStep);
		oWizard.insertStep(oSecondStep, 0);

		assert.strictEqual(oWizard.getSteps().length, 2, "two steps should be in the wizard");
		assert.strictEqual(oWizard.getSteps()[0], oSecondStep, "Second step should be inserted on 0 position");
	});

	QUnit.test("removeStep should work when designMode is true", function (assert) {
		this.stub(DesignTime, "isDesignModeEnabled").returns(true);
		var oStep = new WizardStep({ title: "First" });
		var oWizard = new Wizard({ steps: [oStep] });

		oWizard.removeStep(oStep);

		assert.strictEqual(oWizard.getSteps().length, 0, "No steps should be in the wizard");
	});

	QUnit.module("Methods");

	QUnit.test("_getStepScrollOffset", async function (assert) {
		var oStep1 = new WizardStep({
			title: "First"
		}), oWizard = new Wizard({
			steps: [oStep1]
		});

		await nextUIUpdate();

		// act
		oWizard.removeAllSteps();
		oWizard._getStepScrollOffset(oStep1);

		// assert
		assert.ok(true, "No exceptions thrown from _getStepScrollOffset()");

		// Act
		oWizard.goToStep(oStep1);

		// assert
		assert.ok(true, "No exceptions thrown from goToStep()");

		// clean up
		oWizard.destroy();
	});

	QUnit.module("Wizard Branching", {
		sWizardId: "wizard-branching-id",
		beforeEach: async function () {
			this.externalStep = new WizardStep();
			this.step6 = new WizardStep({
				content : []
			});
			this.stepDummy = new WizardStep("Dummy_Step", {
				nextStep: this.step6,
				content: []
			});
			this.step5 = new WizardStep("Card_Contents",{
				nextStep: this.stepDummy,
				content : []
			});
			this.step4 = new WizardStep("CreditCard_Information",{
				nextStep: this.step6,
				content : []
			});
			this.step3 = new WizardStep("Payment_Details",{
				subsequentSteps: [this.step4, this.step5],
				content: []
			});
			this.step2 = new WizardStep("Personal_Information",{
				nextStep: this.step3,
				content: []
			});
			this.step1 = new WizardStep("Step1",{
				title: "Step1",
				subsequentSteps: [this.step2, this.step3],
				optional: true,
				content: []
			});

			this.oWizard = new Wizard({
				enableBranching: true,
				steps: [this.step1, this.step2, this.step3, this.step4, this.step5, this.stepDummy, this.step6]
			});

			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.stub(ObjectPool.prototype, "returnObject").callsFake(function () {
			});
		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizard = null;
		}
	});

	QUnit.test("currentStep is set correctly in branching wizard", function (assert) {
		this.oWizard.setCurrentStep(this.step4);
		assert.strictEqual(this.oWizard.getCurrentStep(), this.oWizard.getSteps()[0].getId(), "the given currentStep is not part of the subsequentSteps, so it should not be set.");
		this.step1.setNextStep(this.step2);
		this.oWizard.setCurrentStep(this.step3);
		assert.strictEqual(this.oWizard.getCurrentStep(), this.oWizard.getSteps()[2].getId(), "the given currentStep is part of the subsequentSteps, so it should be set.");
	});

	QUnit.test("Optional label in branching wizard", function (assert) {
		var oNavigator = this.oWizard._getProgressNavigator(),
			oFirstStepRef = jQuery(oNavigator.$().find("li")[0]);

		assert.strictEqual(oFirstStepRef.find(".sapMWizardProgressNavStepLabelOptional").length, 1,
				"An optional label is added to the correct step.");
	});

	QUnit.test("Progress navigator steps count", function (assert) {
		var progressNavigator = this.oWizard._getProgressNavigator();
		var stepsAtStart = progressNavigator.getStepCount();
		this.step1.setNextStep(this.step2);
		this.oWizard.nextStep();
		var stepsAfterStep1 = progressNavigator.getStepCount();
		assert.strictEqual(stepsAtStart, 1, "should be equal to 1 at start.");
		assert.strictEqual(stepsAfterStep1, 3 , "should be equal to 3 after step1.");
		this.oWizard.setCurrentStep(this.step3);
		assert.strictEqual(progressNavigator.getStepCount(), 3 , "should be equal to 3.");
		this.oWizard.setCurrentStep(this.step5);
		assert.strictEqual(progressNavigator.getStepCount(), 3 , "should be equal to 3.");
	});

	QUnit.test("Discard after branching should reset progress navigator steps count", function (assert) {
		var progressNavigator = this.oWizard._getProgressNavigator();
		this.step1.setNextStep(this.step2);
		this.oWizard.nextStep();
		var stepsAfterStep1 = progressNavigator.getStepCount();
		this.oWizard.discardProgress(this.step1);
		var stepsAfterDiscard = progressNavigator.getStepCount();
		assert.strictEqual(stepsAfterStep1, 3, "should be equal to 3");
		assert.strictEqual(stepsAfterDiscard, 1, "should be equal to 1");
	});

	QUnit.test("First step's initial nextStep shouldn't be overwritten during onafterrendering", async function (assert) {
		var step3 = new WizardStep({
			content: []
		}), step2 = new WizardStep({
			subsequentSteps: [step3],
			nextStep: this.step3,
			content: []
		}), step1 = new WizardStep({
			subsequentSteps: [step2, step3],
			nextStep: step2,
			content: []
		}), wizard = new Wizard({
			enableBranching: true,
			steps: [step1, step2, step3]
		});

		wizard.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.strictEqual(step1.getNextStep(), step2.getId(), "Step1's nextStep is not overwritten");

		// clean up
		wizard.destroy();
	});

	QUnit.test("Branching should change progress navigator varyingStepCount property", function (assert) {
		var progressNavigator = this.oWizard._getProgressNavigator();
		var varyingStepCountAtStart = progressNavigator.getVaryingStepCount();
		this.step1.setNextStep(this.step3);
		this.oWizard.nextStep();
		var varyingStepCountAtStep3 = progressNavigator.getVaryingStepCount();
		this.step3.setNextStep(this.step4);
		this.oWizard.nextStep();
		var varyingStepCountAtStep4 = progressNavigator.getVaryingStepCount();
		this.oWizard.discardProgress(this.step1);
		var varyingStepCountAfterDiscard = progressNavigator.getVaryingStepCount();
		assert.strictEqual(varyingStepCountAtStart, true, "Should be equal to true at start");
		assert.strictEqual(varyingStepCountAtStep3, true, "Should be equal to true at step3");
		assert.strictEqual(varyingStepCountAtStep4, false, "Should be equal to true at step4");
		assert.strictEqual(varyingStepCountAfterDiscard, true, "Should be reset after discard");
	});

	QUnit.test("Wizard should log error if next step is already in the step path", function (assert) {
		var that = this;
		assert.throws(function () {
			that.step1.setNextStep(that.step1);
			that.oWizard.nextStep();
		}, "Should raise an error.");
	});

	QUnit.test("Wizard should log an error if no next step is set", function (assert) {
		var that = this;
		assert.throws(function () {
			that.oWizard.nextStep();
		}, "Should raise an error.");
	});

	QUnit.test("Wizard should log an error if next step in not present in previous step's subsequent aggregation",
		function (assert) {
			var that = this;
			assert.throws(function () {
				that.step1.setNextStep(that.step4);
				that.oWizard.nextStep();
			}, "Should raise an error.");
	});

	QUnit.test("Wizard should render the steps in correct order", async function (assert) {
		var s4 = new WizardStep({id: "wizStep4"}),
			s2 = new WizardStep({id: "wizStep2", nextStep: s4}),
			s3 = new WizardStep({id: "wizStep3", subsequentSteps: [s2, s4]}),
			s1 = new WizardStep({id: "wizStep1", subsequentSteps: [s2, s3]});

		var oWiz = new Wizard({
			enableBranching: true,
			steps: [s1, s4, s2, s3]
		});

		oWiz.placeAt("qunit-fixture");
		await nextUIUpdate();

		var sectionWrapper = oWiz.$().find(".sapMWizardStepContainer")[0],
			aChildren = Array.prototype.slice.call(sectionWrapper.children),
			s2DomRefIndex = aChildren.indexOf(s2.getDomRef()),
			s3DomRefIndex = aChildren.indexOf(s3.getDomRef()),
			s4DomRefIndex = aChildren.indexOf(s4.getDomRef());

		assert.ok(s3DomRefIndex < s2DomRefIndex, "Step3 should be rendered before Step2");
		assert.ok(s2DomRefIndex < s4DomRefIndex, "Step2 should be rendered before Step4");
		assert.ok(s3DomRefIndex < s4DomRefIndex, "Step3 should be rendered before Step4");

		oWiz.destroy();
	});

	QUnit.test("Wizard shouldn't throw an error, when currentStep is set.", async function (assert) {
		var s3 = new WizardStep({id: "wizStep3"}),
			s2 = new WizardStep({id: "wizStep2", nextStep: "wizStep3"}),
			s1 = new WizardStep({id: "wizStep1", nextStep: "wizStep2", subsequentSteps: [s2, s3]});

		var oWiz = new Wizard({
			currentStep: "wizStep3",
			steps: [s1, s2, s3],
			enableBranching: true
		});

		oWiz.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(s3.getDomRef(), "Step3 is rendered.");
		assert.ok(s2.getDomRef(), "Step2 is rendered.");

		oWiz.destroy();
	});

	QUnit.test("Wizard should log an error if next step is outside the wizard", function (assert) {
		var that = this;
		assert.throws(function () {
			that.step1.setNextStep(that.externalStep);
			that.oWizard.nextStep();
		}, "Should raise an error.");
	});

	QUnit.test("_getNextStep()", function (assert) {
		var oProgressStep = this.oWizard._getNextStep(this.step1, -1);

		// assert
		assert.ok(oProgressStep === this.step1, "Reference to the starting step is returned.");
	});

	QUnit.module("Wizard ACC", {
		sWizardId: "wizard-acc-id",
		beforeEach: async function () {
			this.oWizard = new Wizard(this.sWizardId, {
				steps: [
					new WizardStep({
						validated: true,
						title: "Step 1"
					}),
					new WizardStep({
						validated: true,
						title: "Step 2"
					}),
					new WizardStep({
						title: "Step 3"
					})
				]
			});

			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oResourceBundle = Library.getResourceBundleFor("sap.m");

		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizard = null;
			this.oResourceBundle = null;
		}
	});

	QUnit.test("Wizard aria attributes are set correctly.", function (assert) {
		var sRole = jQuery(this.oWizard.getDomRef()).attr("role");
		var sAriaLabel = jQuery(this.oWizard.getDomRef()).attr("aria-label");
		var sWizardLabel = this.oResourceBundle.getText("WIZARD_LABEL");
		assert.strictEqual(sRole, "region", "role attribute of the wizard should be set to 'region'");
		assert.strictEqual(sAriaLabel, sWizardLabel, "Aria-label attribute of the wizard should be set to '" + sWizardLabel + "'");
	});

	QUnit.test("Wizard Step invisible text is correctly set in Page Mode", async function (assert) {
		this.oWizard._activateStep(this.oWizard.getSteps()[1]);
		await nextUIUpdate();

		this.oWizard.goToStep(this.oWizard.getSteps()[1], true);

		assert.strictEqual(this.oWizard.getSteps()[1]._oNumberInvisibleText.getText(), "Step2 Step 2", "The invisible text of the second step should be set correctly.");
		this.oWizard._activateStep(this.oWizard.getSteps()[2]);
		await nextUIUpdate();

		this.oWizard.goToStep(this.oWizard.getSteps()[2], true);

		assert.strictEqual(this.oWizard.getSteps()[2]._oNumberInvisibleText.getText(), "Step3 Step 3", "The invisible text of the third step should be set correctly.");
		this.oWizard.destroy();
	});

	QUnit.test("WizardStep labelled-by reference number step and title", async function (assert) {
		var oSpy = this.spy(WizardStep.prototype, "_setNumberInvisibleText"),
			oWizard = new Wizard({
			steps: [
				new WizardStep({
					validated: true,
					title: "Step 1"
				}),
				new WizardStep({
					validated: true,
					title: "Step 2"
				})
			]
		});

		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.ok(oSpy.calledWith(1), "The correct step position is forwarded to the wizard step.");

		// set-up
		oWizard.nextStep();
		await nextUIUpdate();

		// assert
		assert.ok(oSpy.calledWith(2), "The correct step position is forwarded to the wizard step.");

		oWizard.destroy();
	});

	QUnit.module("Wizard Navigation", {
		sWizardId: "wizard-nav-id",
		beforeEach: async function () {
			this.oWizard = new Wizard(this.sWizardId, {
				steps: [
					new WizardStep({
						validated: true,
						title: "Step 1"
					}),
					new WizardStep({
						validated: true,
						title: "Step 2"
					}),
					new WizardStep({
						title: "Step 3"
					})
				]
			});

			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oResourceBundle = Library.getResourceBundleFor("sap.m");

		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizard = null;
			this.oResourceBundle = null;
		}
	});

	QUnit.test("Basic interaction", async function (assert) {
		var oNextButton = this.oWizard._getNextButton();

		// assert
		assert.strictEqual(this.oWizard._getNextButtonText(), this.oResourceBundle.getText("WIZARD_STEP") + " " + 2, "The next button's text is correct.");

		// act
		oNextButton.$().tap();
		await nextUIUpdate();
		// assert
		oNextButton = this.oWizard._getNextButton();
		assert.strictEqual(this.oWizard.getProgressStep().getId(), this.oWizard.getSteps()[1].getId(), "The wizard has navigated to the next step on next button click.");
		assert.strictEqual(this.oWizard._getNextButtonText(), this.oResourceBundle.getText("WIZARD_STEP") + " " + 3, "The next button's text is correct.");
	});

	QUnit.test("Step rerendering on navigation", async function (assert) {
		var oNextButton = this.oWizard._getNextButton();

		var oRenderingSpy =  this.spy(WizardStep.prototype, "onBeforeRendering");
		// act
		oNextButton.$().tap();
		await nextUIUpdate();
		// assert
		assert.notOk(oRenderingSpy.called, "The wizard step should not be rerendered on navigation.");
	});

	QUnit.test("setShowNextButton(false)", function (assert) {
		this.clock = sinon.useFakeTimers();
		this.oWizard.setShowNextButton(false);
		this.clock.tick(500);

		var oNextButton = this.oWizard._getNextButton();

		assert.ok(oNextButton.hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 1 should be hidden.");
		// act
		this.oWizard.nextStep();
		this.clock.tick(500);

		// assert
		oNextButton = this.oWizard._getNextButton();
		assert.ok(oNextButton.hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 2 should be hidden.");
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("setShowNextButton()", function (assert) {
		this.clock = sinon.useFakeTimers();
		assert.notOk(this.oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 1 should be visible.");

		// act
		this.oWizard.setShowNextButton(false);
		this.clock.tick(500);

		// assert
		assert.ok(this.oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 1 should be hidden.");

		// act
		this.oWizard.nextStep();
		this.clock.tick(500);
		// assert
		assert.ok(this.oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 2 should be hidden.");
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("showNextButton set to false initially", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oWizard = new Wizard({
			steps: [new WizardStep({validated: true})],
			showNextButton: false
		});

		// act
		oWizard.placeAt("qunit-fixture");
		this.clock.tick(500);

		// assert
		assert.ok(oWizard._getNextButton().hasStyleClass("sapMWizardNextButtonHidden"), "The next button for step 1 should be hidden.");

		// clean up
		oWizard.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("nextButton visibility on discardProgress", function (assert) {
		this.clock = sinon.useFakeTimers();
		// act
		this.oWizard.nextStep().nextStep();
		this.oWizard.discardProgress(this.oWizard.getSteps()[0]);
		this.clock.tick(100);

		// assert
		this.oWizard.getSteps().forEach(function(oStep, iIndex){
			if (iIndex === 0) {
				assert.ok(oStep.getAggregation("_nextButton").getVisible(), "The current step next button is visible.");
			} else {
				assert.notOk(oStep.$().hasClass("sapMWizardStepActivated"), "The discarded steps are hidden.");
			}
		}, this);

		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("step's height after discardProgress", function (assert) {
		this.clock = sinon.useFakeTimers();
		var aWizardSteps = this.oWizard.getSteps(),
			oFirstStep = aWizardSteps[0],
			iInitialHeight = oFirstStep.getDomRef().offsetHeight,
			iHeightAfterDiscard;

		// act
		this.oWizard.nextStep().nextStep();
		this.oWizard.discardProgress(this.oWizard.getSteps()[0]);
		this.clock.tick(100);

		iHeightAfterDiscard = oFirstStep.getDomRef().offsetHeight;

		// assert
		aWizardSteps.forEach(function(oStep, iIndex){
			if (iIndex === 0) {
				assert.ok(oStep.getAggregation("_nextButton").getVisible(), "The current step next button is visible.");
			} else {
				assert.notOk(oStep.$().hasClass("sapMWizardStepActivated"), "The discarded steps are hidden.");
			}
		}, this);

		assert.strictEqual(iInitialHeight, iHeightAfterDiscard, "Discarding progress doesn't change the height of the steps.");
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("isStepFinal", function (assert) {

		assert.strictEqual(this.oWizard.isStepFinal(), false, "The first step is not the final one");
		this.oWizard.nextStep();
		assert.strictEqual(this.oWizard.isStepFinal(), false, "The second step is not the final one");
		this.oWizard.nextStep();
		assert.strictEqual(this.oWizard.isStepFinal(), true, "The third step is the final one");
	});

	QUnit.test("Move steps trough Wizards", function (assert) {
		// Setup
		var oNewWizard, oNewWizardCompleteSpy,
			oStep = new WizardStep({
				validated: true,
				title: "Step 1"
			}),
			oWizard = new Wizard({steps: [oStep]}).placeAt("qunit-fixture"),
			oWizardCompleteSpy = this.spy(oWizard, "fireComplete");

		// Act
		oStep._complete();
		// Assert
		assert.strictEqual(oWizardCompleteSpy.callCount, 1, "The Next button press logic is fired properly");

		// Act
		oWizard.removeAllSteps();
		oNewWizard = new Wizard({steps: [oStep]}).placeAt("qunit-fixture");
		oNewWizardCompleteSpy = this.spy(oNewWizard, "fireComplete");
		oStep._complete();


		// Assert
		assert.strictEqual(oWizardCompleteSpy.callCount, 1, "The Next button press logic is not called again with the old context");
		assert.strictEqual(oNewWizardCompleteSpy.callCount, 1, "The Next button press logic is fired properly");

		// Cleanup
		oStep = null;
		oWizard.destroy();
		oNewWizard.destroy();
	});

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oSpy = this.spy(Wizard.prototype, "_initResponsivePaddingsEnablement"),
			oTestPage = new Wizard({}).placeAt("qunit-fixture");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement called on init of control");
		assert.ok(oSpy.calledOn(oTestPage), "The spy is called on the tested control instance");

		oTestPage.destroy();
	});

	QUnit.test("Correct style classes are applied", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oStep1 = new WizardStep({id: "firstStep", title: "First"}),
			oStep2 = new WizardStep({id: "secondStep", title: "Second"}),
			oStep3 = new WizardStep({id: "thirdStep", title: "Third"});

		var oWizard = new Wizard("testWizard", {
				currentStep: "firstStep",
				steps: [oStep1, oStep2, oStep3]
			});

		oWizard.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Act
		oWizard.addStyleClass("sapUiResponsivePadding--header");
		oWizard.addStyleClass("sapUiResponsivePadding--content");

		await nextUIUpdate(this.clock);

		oWizard.setWidth("300px");
		await nextUIUpdate(this.clock);


		var $wizardProgressNavigator = oWizard.$().find("#testWizard-progressNavigator"),
			$wizardStepContent = oWizard.$().find("#testWizard-step-container");
			this.clock.tick(100);

		var bIsProgressNavigatorResponsive = $wizardProgressNavigator.hasClass("sapUi-Std-PaddingS"),
			bIsContentResponsive = $wizardStepContent.hasClass("sapUi-Std-PaddingS");


		//Assert
		assert.ok(bIsProgressNavigatorResponsive, "The sapUi-Std-PaddingS class is applied to the progress navigator");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingS class is applied to the content");

		//Act
		oWizard.setWidth("700px");
		await nextUIUpdate(this.clock);

		$wizardProgressNavigator = oWizard.$().find("#testWizard-progressNavigator");
		$wizardStepContent = oWizard.$().find("#testWizard-step-container");
		this.clock.tick(100);

		bIsProgressNavigatorResponsive = $wizardProgressNavigator.hasClass("sapUi-Std-PaddingM");
		bIsContentResponsive = $wizardStepContent.hasClass("sapUi-Std-PaddingM");

		//Assert
		assert.ok(bIsProgressNavigatorResponsive, "The sapUi-Std-PaddingM class is applied to the progress navigator");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingM class is applied to the content");

		//Act
		oWizard.setWidth("1300px");
		await nextUIUpdate(this.clock);

		$wizardProgressNavigator = oWizard.$().find("#testWizard-progressNavigator");
		$wizardStepContent = oWizard.$().find("#testWizard-step-container");
		this.clock.tick(100);

		bIsProgressNavigatorResponsive = $wizardProgressNavigator.hasClass("sapUi-Std-PaddingL");
		bIsContentResponsive = $wizardStepContent.hasClass("sapUi-Std-PaddingL");

		//Assert
		assert.ok(bIsProgressNavigatorResponsive, "The sapUi-Std-PaddingL class is applied to the progress navigator");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingL class is applied to the content");

		//Act
		oWizard.setWidth("1700px");
		await nextUIUpdate(this.clock);

		$wizardProgressNavigator = oWizard.$().find("#testWizard-progressNavigator");
		$wizardStepContent = oWizard.$().find("#testWizard-step-container");
		this.clock.tick(100);


		bIsProgressNavigatorResponsive = $wizardProgressNavigator.hasClass("sapUi-Std-PaddingXL");
		bIsContentResponsive = $wizardStepContent.hasClass("sapUi-Std-PaddingXL");

		//Assert
		assert.ok(bIsProgressNavigatorResponsive, "The sapUi-Std-PaddingXL class is applied to the progress navigator");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingXL class is applied to the content");

		oWizard.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.module("Wizard sticky content interface", {
		sWizardId: "wizard-sticky-id",
		beforeEach: async function () {
			this.oWizard = new Wizard(this.sWizardId, {
				steps: [
					new WizardStep({
						validated: true,
						title: "Step 1"
					}),
					new WizardStep({
						validated: true,
						title: "Step 2"
					}),
					new WizardStep({
						title: "Step 3"
					})
				]
			});

			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizard = null;
		}
	});

	QUnit.test("_setStickySubheaderSticked / _getStickySubheaderSticked", function (assert) {
		var undef,
			bSticked = true;

		// Assert
		assert.strictEqual(this.oWizard._bStickyContentSticked, undef, "_bStickyContentSticked is undefined");

		// Act
		this.oWizard._setStickySubheaderSticked(bSticked);

		// Assert
		assert.strictEqual(this.oWizard._bStickyContentSticked, bSticked, "_bStickyContentSticked is set to true");
		assert.strictEqual(this.oWizard._getStickySubheaderSticked(), bSticked, "_getStickySubheaderSticked returned true");
	});

	QUnit.test("_getStickyContent returns the progress navigator", function (assert) {
		// Assert
		assert.deepEqual(this.oWizard._getStickyContent(), this.oWizard._getProgressNavigator(), "_getStickyContent returns the progress navigator");
	});

	QUnit.test("_returnStickyContent inserts the progress navigator back into the wizard's DOM", function (assert) {
		var $WizardElement = this.oWizard.$()[0],
			oPrependSpy = new this.spy(),
			oStub = {
				$: {
					prependTo: oPrependSpy
				}
			},
			oProgressNavigator = this.oWizard._getProgressNavigator(),
			oProgressDomStub = this.stub(oProgressNavigator, "$").returns(oStub.$);

		// Act
		this.oWizard._returnStickyContent();

		// Assert
		assert.ok(oProgressDomStub.calledOnce, "The progress navigator's $ was  called once.");
		assert.ok(oPrependSpy.calledOnce, "prependTo was called once.");
		assert.strictEqual(oPrependSpy.firstCall.args[0][0], $WizardElement, "The sticky content was returned to the correct DOM element.");
	});

	QUnit.test("goToStep should consider bFocusFirstStepElement in Page Mode", async function (assert) {
		var oBtn = new Button();
		var oSecondStep = new WizardStep({
			validated: true,
			title:"Step 2",
			content:[
				oBtn
			]
		});
		var oWizard = new Wizard({
			renderMode: WizardRenderMode.Page,
			steps: [
				new WizardStep({
					title:"Step 1"
				}),
				oSecondStep
			]
		}).placeAt("qunit-fixture");

		await nextUIUpdate();

		oWizard._activateStep(oSecondStep);
		await nextUIUpdate();

		oWizard.goToStep(oSecondStep, true);

		assert.strictEqual(document.activeElement, oBtn.getFocusDomRef(), "Button should be focused");

		oBtn.destroy();
		oWizard.destroy();
	});

	QUnit.module("Progress Navigator", {
		sWizardId: "wizard-nav-id",
		beforeEach: async function () {
			this.oWizardStep0 = new WizardStep({
				id: "Step1",
				title: "Step 1"
			});
			this.oWizard = new Wizard(this.sWizardId, {
				steps: [
					this.oWizardStep0,
					new WizardStep({
						id: "Step2",
						validated: true,
						title: "Step 2"
					}),
					new WizardStep({
						title: "Step 3"
					})
				]
			});

			this.oWizard.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oResourceBundle = Library.getResourceBundleFor("sap.m");
		},
		afterEach: function () {
			this.oWizard.destroy();
			this.oWizard = null;
			this.oResourceBundle = null;
		}
	});

	QUnit.test("Progress navigator steps have properly formated ids", function(assert){
		const oProgressNavigator = this.oWizard._getProgressNavigator();
		const $aNavigatorSteps = oProgressNavigator.$().find("li");
		const aWizardSteps = this.oWizard.getSteps();

		assert.ok(jQuery($aNavigatorSteps[0]).attr("id").endsWith(aWizardSteps[0].getId()), "First navigator step id corresponds to the first wizard step id");
		assert.ok(jQuery($aNavigatorSteps[1]).attr("id").endsWith(aWizardSteps[1].getId()), "Second navigator step id corresponds to the second wizard step id");
		assert.ok(jQuery($aNavigatorSteps[2]).attr("id").endsWith(aWizardSteps[2].getId()), "Third navigator step id corresponds to the third wizard step id");

		const sFirstId = oProgressNavigator.getId() + "-step-" + aWizardSteps[0].getId();
		assert.strictEqual(jQuery($aNavigatorSteps[0]).attr("id"), sFirstId, "First navigator step id is as expected");

		const sSecondId = oProgressNavigator.getId() + "-step-" + aWizardSteps[1].getId();
		assert.strictEqual(jQuery($aNavigatorSteps[1]).attr("id"), sSecondId, "Second navigator step id is as expected");

		const sThirdId = oProgressNavigator.getId() + "-step-" + aWizardSteps[2].getId();
		assert.strictEqual(jQuery($aNavigatorSteps[2]).attr("id"), sThirdId, "Third navigator step id is as expected");
	});

	QUnit.test("New added wizard step without predefined id generates proper id for the progress navigator li item", async function(assert){
		assert.strictEqual(this.oWizard.getSteps().length, 3, "Wizard has 3 steps");

		this.oWizard.addStep(new WizardStep());
		await nextUIUpdate();

		assert.strictEqual(this.oWizard.getSteps().length, 4, "Wizard has 4 steps");
		const oProgressNavigator = this.oWizard._getProgressNavigator();
		const $aNavigatorSteps = oProgressNavigator.$().find("li");

		const oLastWizardStep = this.oWizard.getSteps()[3];
		const sLastStepId = oProgressNavigator.getId() + "-step-" + oLastWizardStep.getId();

		assert.strictEqual(jQuery($aNavigatorSteps[3]).attr("id"), sLastStepId, "Newly added wizard step results in element in the navigator with proper id");
	});

	QUnit.test("New added wizard step with predefined id generates proper id for the progress navigator li item", async function(assert){
		assert.strictEqual(this.oWizard.getSteps().length, 3, "Wizard has 3 steps");

		this.oWizard.addStep(new WizardStep("test"));
		await nextUIUpdate();

		assert.strictEqual(this.oWizard.getSteps().length, 4, "Wizard has 4 steps");
		const oProgressNavigator = this.oWizard._getProgressNavigator();
		const $aNavigatorSteps = oProgressNavigator.$().find("li");

		const sLastStepId = oProgressNavigator.getId() + "-step-test";

		assert.strictEqual(jQuery($aNavigatorSteps[3]).attr("id"), sLastStepId, "Newly added wizard step results in element in the navigator with proper id");
	});

	QUnit.test("Removing wizard step does not break progress navigator IDs", async function(assert){
		this.stub(DesignTime, "isDesignModeEnabled").returns(true);

		this.oWizard.removeStep(this.oWizardStep0);
		await nextUIUpdate();

		const oProgressNavigator = this.oWizard._getProgressNavigator();
		const $aNavigatorSteps = oProgressNavigator.$().find("li");
		const sFirstStepId = oProgressNavigator.getId() + "-step-Step2";

		assert.strictEqual(jQuery($aNavigatorSteps[0]).attr("id"), sFirstStepId, "First step in the navigator has proper id");
	});
});