describe("sap.m.TimePicker", function() {
	it("correct margins", function () {
		var oTPValueHelp = element(by.css('#__picker0 .sapMInputValHelpInner')),
			oPicker,
			oSecondsSlider;

		//Open picker
		oTPValueHelp.click();

		oPicker = element(by.id("__picker0-RP-popover"));
		oSecondsSlider = element(by.id("__picker0-sliders-listSecs"));

		//Assert
		expect(takeScreenshot(oPicker)).toLookAs("minutes_slider");

		//Expand seconds slider
		oSecondsSlider.click();

		//Assert
		expect(takeScreenshot(oPicker)).toLookAs("seconds_slider");
	});
});
