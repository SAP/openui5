/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.LabelRTL", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.Label";

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should visualize the simple form", function(){

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			expect(takeScreenshot(simpleForm)).toLookAs('01_simple_form_compact');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('02_simple_form_compact_required_all');
		});

		element(by.id('requiredSwitch')).click();
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('03_simple_form_cozy');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('04_simple_form_cozy_required_all');
		});
		element(by.id('requiredSwitch')).click();
		element(by.id('cozySwitch')).click();
	});

	it("should visualize the second simple form with fixed width", function(){

		var simpleForm = element(by.id("simpleForm2"));
		browser.executeScript("document.getElementById('simpleForm2').scrollIntoView()").then(function() {
			expect(takeScreenshot(simpleForm)).toLookAs('05_simple_form2_compact');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('06_simple_form2_compact_required_all');
		});

		element(by.id('requiredSwitch')).click();
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('07_simple_form2_cozy');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(simpleForm)).toLookAs('08_simple_form2_cozy_required_all');
		});
		element(by.id('requiredSwitch')).click();
		element(by.id('cozySwitch')).click();
	});

	it("should visualize basic use", function(){

		var oVL = element(by.id("oVL"));
		browser.executeScript("document.getElementById('oVL').scrollIntoView()").then(function() {
			expect(takeScreenshot(oVL)).toLookAs('09_oVL_compact');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL)).toLookAs('10_oVL_compact_required_all');
		});

		element(by.id('requiredSwitch')).click();
		browser.executeScript("document.getElementById('oVL').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(oVL)).toLookAs('11_oVL_cozy');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL)).toLookAs('12_oVL_cozy_required_all');
		});
		element(by.id('requiredSwitch')).click();
		element(by.id('cozySwitch')).click();
	});

	it("should visualize the special right-to-left cases", function(){

		var oVL2 = element(by.id("oVL2"));
		browser.executeScript("document.getElementById('oVL2').scrollIntoView()").then(function() {
			expect(takeScreenshot(oVL2)).toLookAs('13_oVL2_compact');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL2)).toLookAs('14_oVL2_compact_required_all');
		});

		element(by.id('requiredSwitch')).click();
		browser.executeScript("document.getElementById('oVL2').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(oVL2)).toLookAs('15_oVL2_cozy');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL2)).toLookAs('16_oVL2_cozy_required_all');
		});
		element(by.id('requiredSwitch')).click();
		element(by.id('cozySwitch')).click();
	});

});