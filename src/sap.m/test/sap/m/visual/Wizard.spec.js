/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Wizard", function() {
	"use strict";

	it("should load test page", function () {
		// disable CSS animations as they are messing with intrinsic waits
		// this is workaround, remove when data-sap-ui-animation=off is supported by sap.m.Wizard
		browser.executeScript(function(){
			jQuery(".sapMWizard .sapMWizardNextButton").css("transition","none !important");
		});

		expect(takeScreenshot()).toLookAs('initial');
	});

	it("should show the next page", function () {
		element(by.id("branch-wiz-sel")).click();
		expect(takeScreenshot()).toLookAs("branching-initial");
	});

	it("should load page 2 of branching wizard", function () {
		element(by.id("branch-wiz-nextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page2");
	});

	it("validation of step should change visibility of button", function () {
		element(by.id("branch-wiz-nextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page3-noNextButton");

		element(by.id("validate-step")).click();
		expect(takeScreenshot()).toLookAs("branching-page3-withNextButton");
	});

	it("should go to the end of the wizard", function () {
		element(by.id("branch-wiz-nextButton")).click();
		element(by.id("Card_Contents-Title")).click(); // Remove the focus from the input field
		expect(takeScreenshot()).toLookAs("branching-page4");

		element(by.id("branch-wiz-nextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page5");

		element(by.id("branch-wiz-nextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page6");
	});

	it("should scroll up", function () {
		element(by.css("#branch-wiz .sapMWizardProgressNavStep:nth-child(5)")).click();
		expect(takeScreenshot()).toLookAs("branching-scroll-from6-to3");
	});
});
