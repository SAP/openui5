describe('sap.m.StepInput', function() {
	it('value and buttons', function () {
		var oStepInput = element(by.id('visual_test_step_input')),
			oDecrementButton = element(by.id('visual_test_step_input-decrementButton'));

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_v2min0step3");

		//Decrement the value to 0 - which also disables the decrement button
		oDecrementButton.click();

		//Assert
		expect(takeScreenshot(oStepInput)).toLookAs("step_input_v0min0step3");
	});

	it('width inside 300px toolbar', function () {
		var oStepInput = element(by.id('visual_test_step_input')),
			oChangeWidthButton = element(by.id('change_step_input_width_btn'));

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