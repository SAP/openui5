/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Wizard", function() {
	"use strict";

	var bPhone = null;

	it("should load test page", function () {
		// disable CSS animations as they are messing with intrinsic waits
		// this is workaround, remove when data-sap-ui-animation=off is supported by sap.m.Wizard
		browser.executeScript(function(){
			jQuery(".sapMWizard .sapMWizardNextButton").css("transition","none !important");
		});
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs('initial');
	});

	it("should show the next page", function () {
		element(by.id("branch-wiz-sel")).click();
		expect(takeScreenshot()).toLookAs("branching-initial");
	});

	it("should load page 2 of branching wizard", function () {
		element(by.css(".sapMWizardLastActivatedStep .sapMWizardNextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page2");
	});

	it("validation of step should change visibility of button", function () {
		element(by.css(".sapMWizardLastActivatedStep .sapMWizardNextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page3-noNextButton");

		element(by.id("validate-step")).click();
		expect(takeScreenshot()).toLookAs("branching-page3-withNextButton");
	});

	it("should go to the end of the wizard", function () {
		element(by.css(".sapMWizardLastActivatedStep .sapMWizardNextButton")).click();
		element(by.id("Card_Contents-Title")).click(); // Remove the focus from the input field
		expect(takeScreenshot()).toLookAs("branching-page4");

		element(by.css(".sapMWizardLastActivatedStep .sapMWizardNextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page5");

		element(by.css(".sapMWizardLastActivatedStep .sapMWizardNextButton")).click();
		expect(takeScreenshot()).toLookAs("branching-page6");
	});

	it("should scroll up", function () {
		element(by.css("#branch-wiz .sapMWizardProgressNavStep:nth-child(5)")).click();
		expect(takeScreenshot()).toLookAs("branching-scroll-from6-to3");
	});

	it("should scroll to the step containing the initial focus element in a dialog", function () {
		var openBtn = element(by.id("open-dialog-btn")),
			closeBtn = element(by.id("close-dialog-btn")),
			navigateBtn = element(by.id("navigate-btn"));

		if (bPhone) {
			element(by.id("branch-wiz-page-navButton")).click();
		}
		// navigate to test app page and open dialog
		element(by.id("dialog-integration-wiz-sel")).click();
		openBtn.click();

		// navigate to the last step
		for (var i = 0; i < 3; i++) {
			navigateBtn.click();
		}

		// close and reopen the dialog
		closeBtn.click();
		openBtn.click();

		expect(takeScreenshot(element(by.id("wiz-dialog")))).toLookAs("wizard-in-dialog-initial-focus");
	});

	it("should change background design", function () {
		element(by.id("background-change-wiz-sel")).click();
		element(by.id("change-theme")).click();
		expect(takeScreenshot()).toLookAs("change-background-standard");

		element(by.id("change-background-solid")).click();
		expect(takeScreenshot()).toLookAs("change-background-solid");

		element(by.id("change-background-list")).click();
		expect(takeScreenshot()).toLookAs("change-background-list");

		element(by.id("change-background-transparent")).click();
		expect(takeScreenshot()).toLookAs("change-background-transparent");
    });
});
