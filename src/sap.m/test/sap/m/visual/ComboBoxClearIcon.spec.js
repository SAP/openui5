/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.ComboBoxClearIcon", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ComboBox';

	it("Should load the ClearButton test page",function() {
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("clearIcon-initial");
	});

	it("ComboBox - entering value should show the clear icon", function() {
		var comboBox = element(by.id("__box3"));
		comboBox.click();
		browser.actions().sendKeys("B").perform();
		expect(takeScreenshot()).toLookAs("clearIcon-shown");
	});

	it("ComboBox - deleting the value should hide the clear icon", function() {
		var comboBoxClearIcon = element(by.css("#__box3-content > div > span:nth-child(1)"));
		comboBoxClearIcon.click();
		expect(takeScreenshot()).toLookAs("clearIcon-hidden");
	});

	it("MultiComboBox - entering value should show the clear icon", function() {
		var comboBox = element(by.id("__box9"));
		comboBox.click();
		browser.actions().sendKeys("D").perform();
		expect(takeScreenshot()).toLookAs("clearIcon-shown-mcbox");
	});

	it("MultiComboBox - focus out should hide the clear icon", function() {
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot()).toLookAs("mcbClearIcon-hidden-focusout");
	});

	it("MultiComboBox - Selecting value should hide the clear icon", function() {
		var multiComboBox = element(by.id("__box9"));
		multiComboBox.click();
		browser.actions().sendKeys("D").perform();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(0).click();
		expect(takeScreenshot()).toLookAs("mcbClearIcon-hidden-selection");
	});

});
