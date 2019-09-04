/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.InputVisualTests", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	var aStartPosition = [4, 4, 4, 9, 9, 9, 9, 9, 11, 11]; // dependant to the number of RadioButtonGroups and their content in the test page

	 var takePictures = function(n, max) {
		var inpHolder = element(by.id("inpHolder"));

		var runTests = function(radioButtonId, numberOfImage, index){
			it(numberOfImage, function () {
				var numberOfImageFocusedInput = numberOfImage + "-focus";

				element(by.id(radioButtonId)).click();
				expect(takeScreenshot(inpHolder)).toLookAs(numberOfImage);

				if ((index == 11 && n != 0) || (index == 12 && n != 0)) { // focus shouldn't be tested on disabled inputs and not for all combinations
					// Here class is added (instead of "click" action) to not see the cursor on some images
					browser.executeScript('document.getElementById("inpHolder").classList.add("sapMFocus")');
					expect(takeScreenshot(inpHolder)).toLookAs(numberOfImageFocusedInput);
					browser.executeScript('document.getElementById("inpHolder").classList.remove("sapMFocus")');
				}
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
			runTests(radioButtonId, numberOfImage, index);
		}
	};

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	var aRadioButtonsOnPage = 14; // dependant of the test page

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
