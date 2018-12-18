/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'sap/ui/test/actions/Press'
], function(Opa5, OpaTest, Press) {

	var оАctions = new Opa5({
		iPressOnTheButton : function (sButtonId) {
			return this.waitFor({
				id : sButtonId,
				actions : new Press(),
				errorMessage : "Did not find the Button"
			});
		},
		iSkipTheStep: function () {
			return this.waitFor({
				id: "skip_details",
				actions: new Press(),
				success: function () {
					Opa5.assert.ok(true, 'The step is completed.');
				},
				errorMessage : "The step is not completed."
			});
		}
	});

	var oAssertions = new Opa5({
		theWizProgressShouldBeUpdatedCorrectly: function (sWizardId, iExpectedValue) {
			return this.waitFor({
				id : sWizardId,
				success : function (oWiz) {
					Opa5.assert.strictEqual(oWiz.getProgress(), iExpectedValue, "The progress is updated to: " + iExpectedValue);
				},
				errorMessage : "The progress in not updated correctly."
			});
		},
		theNextButtonShouldBeVisible: function (sId) {
			return this.waitFor({
				id : sId,
				matchers : new sap.ui.test.matchers.PropertyStrictEquals({
					name : "visible",
					value : true
				}),
				success : function () {
					Opa5.assert.ok(true, "The next button step is visible.");
				},
				errorMessage : "The next button step is hidden."
			});
		},
		theNextButtonShouldBeHidden: function (sStepId) {
			return this.waitFor({
				id : sStepId,
				success : function (oStep) {
					Opa5.assert.notOk(oStep._oNextButton.getVisible(), "The next button step is hidden.");
				},
				errorMessage : "The next button step is visible."
			});
		},
		theStepShouldBeValidated: function (sId) {
			return this.waitFor({
				id : sId,
				matchers : new sap.ui.test.matchers.PropertyStrictEquals({
					name : "validated",
					value : true
				}),
				success : function () {
					Opa5.assert.ok(true, "The step is validated.");
				},
				errorMessage : "The step is not validated."
			});
		},
		theCurrentStepShouldBeUpdated: function (sWizardId, sStepId) {
			return this.waitFor({
				id : sWizardId,
				success : function (oWiz) {
					Opa5.assert.strictEqual(oWiz.getCurrentStep(), sStepId, "The step is updated correctly.");
				},
				errorMessage : "The step is not updated."
			});
		}

	});

	Opa5.extendConfig({
		actions : оАctions,
		assertions : oAssertions,
		autoWait: true
	});

	// Test wizard in linear mode

	QUnit.module('Linear Wizard');

	OpaTest('Should validate and complete first step.', function (Given, When, Then) {
		Given.iStartMyAppInAFrame("./test-resources/sap/m/Wizard.html");

		When.iSkipTheStep();
		Then.theStepShouldBeValidated("linear-wiz-step1");
	});

	OpaTest('Should go to next step.', function (Given, When, Then) {
		When.iPressOnTheButton("linear-wiz-step1-nextButton");
		Then.theWizProgressShouldBeUpdatedCorrectly("linear-wiz",2);
	});

	OpaTest('Should go to next step.', function (Given, When, Then) {
		When.iPressOnTheButton("navigate-nextstep-btn");
		Then.theWizProgressShouldBeUpdatedCorrectly("linear-wiz", 3);
		Then.theNextButtonShouldBeHidden("linear-wiz-step3");
	});

	OpaTest('Should discard progress.', function (Given, When, Then) {
		When.iSkipTheStep();
		Then.theWizProgressShouldBeUpdatedCorrectly("linear-wiz", 1);
	});

	// Test wizard in branching mode

	QUnit.module('Branching Wizard');

	OpaTest('Should open a branching wizard.', function (Given, When, Then) {
		When.iPressOnTheButton("branch-wiz-sel");

		Then.waitFor({
			id: "branch-wiz",
			success: function () {
				Opa5.assert.ok(true, "Should load a branching wizard.");
			}
		});
	});

	OpaTest('Should change the next step and navigate to it.', function (Given, When, Then) {
		When.iPressOnTheButton("payment_details_radio");
		When.iPressOnTheButton("branch-wiz-step1-nextButton");
		Then.theWizProgressShouldBeUpdatedCorrectly("branch-wiz", 2);
		Then.theCurrentStepShouldBeUpdated("branch-wiz", "Payment_Details");
	});

	OpaTest('Should validate the step and navigate the next one.', function (Given, When, Then) {
		When.iPressOnTheButton("validate-step");
		When.iPressOnTheButton("Payment_Details-nextButton");
		When.iPressOnTheButton("Card_Contents-nextButton");
		Then.theWizProgressShouldBeUpdatedCorrectly("branch-wiz", 4);
		Then.theCurrentStepShouldBeUpdated("branch-wiz", "Dummy_Step");
	});

	OpaTest('Should discard progress.', function (Given, When, Then) {
		When.iPressOnTheButton("credit-card-radio");
		Then.theWizProgressShouldBeUpdatedCorrectly("branch-wiz", 2);
		Then.theCurrentStepShouldBeUpdated("branch-wiz", "Payment_Details");
		Then.theNextButtonShouldBeVisible("Payment_Details-nextButton");

		Then.iTeardownMyApp();
	});
});