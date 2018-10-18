/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.InputVisualTests", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	var aStartPosition = [4, 4, 4, 7, 7, 7 ,12, 12, 12, 12, 12, 14, 14]; // dependant to the number of RadioButtonGroups and their content in the test page

	 var takePictures = function(n, max) {
		var input = element(by.id("inp"));

		var runTests = function(radioButtonId, numberOfImage){
			it(numberOfImage, function () {
				var numberOfImageFocusedInput = numberOfImage + "-focus";

				element(by.id(radioButtonId)).click();
				expect(takeScreenshot(input)).toLookAs(numberOfImage);

				input.click();
				expect(takeScreenshot(input)).toLookAs(numberOfImageFocusedInput);
			});
		};

		it("(just for selection purpose)", function () {
			// select radio button outside the following for loop
			var id = "rb" + (n + 1);
			element(by.id(id)).click();
		});

		for (var index = aStartPosition[n]; index < (max + 1); index++) {
			var radioButtonId = "rb" + (index);
			var numberOfImage = n + 1  + "-" + index;
			runTests(radioButtonId, numberOfImage);
		}
	 };

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	var aRadioButtonsOnPage = 15; // dependant of the test page

	for (var index = 0; index < aRadioButtonsOnPage; index++) {
		takePictures(index, aRadioButtonsOnPage);
	}

	it("should visualize Input used in Simple Form", function () {
		var sf1 = element(by.id("sf"));
		browser.executeScript("document.getElementById('sf').scrollIntoView()").then(function() {
			expect(takeScreenshot(sf1)).toLookAs("15_Input_in_SimpleForm");
		});
	});
});