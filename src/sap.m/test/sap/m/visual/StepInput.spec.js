/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.StepInput', function() {
	"use strict";

	var sSutId = "visual_test_step_input",
		//sSutIncrementButtonId = sSutId + "-incrementBtn",
		sSutDecrementButtonId = sSutId + "-decrementBtn",
		sChangeWidthButtonId = 'change_step_input_width_btn';

	it("Prepare environment", function () {
		return browser.executeScript(function () {
			/*
			 * Note: This code is executed in separate browser environment so test environment variables are not available!
			 */
			if (sap.ui.Device.system.phone) {
				/*
				 * The step input under test is positioned out of the viewport for the majority of mobile devices
				 * with low screens (height less than 1200px). This makes impossible a screen shot of it to be made
				 * so that's why we need to focus it in order to provoke the page to scroll to it.
				 */
				sap.ui.getCore().byId("visual_test_step_input").focus();
			} else {
				//Execute browser environment prepare code for desktop
			}
		});
	});

	it('value and buttons', function () {
		var oStepInput = element(by.id(sSutId)),
			oDecrementButton = element(by.id(sSutDecrementButtonId));

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_v2min0step3");

		//Decrement the value to 0 - which also disables the decrement button
		oDecrementButton.click();

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_v0min0step3");
	});

	it('width inside 300px toolbar', function () {
		var oStepInput = element(by.id(sSutId)),
			oChangeWidthButton = element(by.id(sChangeWidthButtonId));

		//Change width to 12rem
		oChangeWidthButton.click();

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_width_12rem");

		//Change width to 100%
		oChangeWidthButton.click();

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_width_100percent");

		//Change width to 100px
		oChangeWidthButton.click();

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_width_100px");
	});
});