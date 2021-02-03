/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.Label", function() {
	"use strict";

	function changeLanguage(sLang) {
		return browser.executeScript(function(sLang) {
			var oSelect = sap.ui.getCore().byId('localeSelect');
				oSelect.setSelectedKey(sLang);

			var oSelectedItem = oSelect.getSelectedItem();
				oSelect.fireChange({ selectedItem: oSelectedItem});
		}, sLang);
	}

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

	it("should visualize textDirection property", function(){

		var oVL3 = element(by.id("oVL3"));
		browser.executeScript("document.getElementById('oVL3').scrollIntoView()").then(function() {
			expect(takeScreenshot(oVL3)).toLookAs('17_oVL3_compact');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL3)).toLookAs('18_oVL3_compact_required_all');
		});

		element(by.id('requiredSwitch')).click();
		browser.executeScript("document.getElementById('oVL3').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(oVL3)).toLookAs('19_oVL3_cozy');
			element(by.id('requiredSwitch')).click();
			expect(takeScreenshot(oVL3)).toLookAs('20_oVL3_cozy_required_all');
		});
		element(by.id('requiredSwitch')).click();
	});

	it("should visualize the French language", function(){

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			changeLanguage("fr");
			expect(takeScreenshot(simpleForm)).toLookAs('21_simpleForm_compact_French');
		});

		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			changeLanguage("fr");
			expect(takeScreenshot(simpleForm)).toLookAs('22_simpleForm_cozy_French');
		});
		element(by.id('cozySwitch')).click();
	});

	it("should visualize the Chinese language (zh_CN)", function(){

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			changeLanguage("zh-CN");
			expect(takeScreenshot(simpleForm)).toLookAs('23_simpleForm_compact_zh_CN');
		});

		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			changeLanguage("zh-CN");
			expect(takeScreenshot(simpleForm)).toLookAs('24_simpleForm_cozy_zh_CN');
		});
		element(by.id('cozySwitch')).click();
	});

	it("should visualize the Chinese language (zh_TW)", function(){

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			changeLanguage("zh-TW");
			expect(takeScreenshot(simpleForm)).toLookAs('25_simpleForm_compact_zh_TW');
		});

		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function() {
			element(by.id('cozySwitch')).click();
			changeLanguage("zh-TW");
			expect(takeScreenshot(simpleForm)).toLookAs('26_simpleForm_cozy_zh_TW');
		});

		element(by.id('cozySwitch')).click();
	});

	it("required label in French language", function() {
		var oRequiredLabel = element(by.id("lbl2"));

		browser.executeScript("document.getElementById('lbl2').scrollIntoView()").then(function() {
			changeLanguage("fr");
			expect(takeScreenshot(oRequiredLabel)).toLookAs('27_required_label_French');

			// clean up - reset language
			changeLanguage("en");
		});
	});
});