/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.Label", function() {
	"use strict";

	function changeLanguage(sLang) {
		element(by.control({
			id: "localeSelect",
			interaction: {
				idSuffix: "arrow"
			}
		})).click();

		element(by.control({
			controlType: "sap.ui.core.Item",
			properties: {
				key: sLang
			},
			searchOpenDialogs: true
		})).click();
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

	it("should visualize truncation + colon", function(){
		var oVL4 = element(by.id("oVL4"));
		browser.executeScript("document.getElementById('oVL4').scrollIntoView()").then(function() {
			// form factors
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_compact');
			element(by.id('cozySwitch')).click();
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_cozy');
			element(by.id('cozySwitch')).click();

			// resize
			element(by.id('resizeBtn')).click();
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_resized');

			// languages
			changeLanguage("fr");
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_fr');
			changeLanguage("zh-CN");
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_zh-CN');
			changeLanguage("zh-TW");
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_zh-TW');
			changeLanguage("zh-Hans");
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_zh-Hans');
			changeLanguage("zh-Hant");
			expect(takeScreenshot(oVL4)).toLookAs('truncation_colon_zh-Hant');
			changeLanguage("en");
		});
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

	it("should visualize the Chinese language (Simplified Chinese zh-Hans)", function () {

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function () {
			changeLanguage("zh-Hans");
			expect(takeScreenshot(simpleForm)).toLookAs('28_simpleForm_compact_zh_Hans');
		});

		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function () {
			element(by.id('cozySwitch')).click();
			changeLanguage("zh-Hans");
			expect(takeScreenshot(simpleForm)).toLookAs('29_simpleForm_cozy_zh_Hans');
		});

		element(by.id('cozySwitch')).click();

		// clean up - reset language
		changeLanguage("en");
	});

	it("should visualize the Chinese language (Traditional Chinese zh-Hant)", function () {

		var simpleForm = element(by.id("simpleForm"));
		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function () {
			changeLanguage("zh-Hant");
			expect(takeScreenshot(simpleForm)).toLookAs('30_simpleForm_compact_zh_Hant');
		});

		browser.executeScript("document.getElementById('simpleForm').scrollIntoView()").then(function () {
			element(by.id('cozySwitch')).click();
			changeLanguage("zh-Hant");
			expect(takeScreenshot(simpleForm)).toLookAs('31_simpleForm_cozy_zh_Hant');
		});

		element(by.id('cozySwitch')).click();

		// clean up - reset language
		changeLanguage("en");
	});

	it("should visualize label with fixed width, asterisk and colon", function () {
		var lbl = element(by.id('lblcolonrequired'));

		browser.executeScript("document.getElementById('lblcolonrequired').scrollIntoView()").then(function () {
			expect(takeScreenshot(lbl)).toLookAs("32_label_required_colon");
		});
	});

	it("should visualize label with asterisk  with truncated text", function () {
		var lbl = element(by.id('reqLabelParentWidth'));

		browser.executeScript("document.getElementById('reqLabelParentWidth').scrollIntoView()").then(function () {
			expect(takeScreenshot(lbl)).toLookAs("33_label_required_parent_width");
		});
	});

	it("should visualize label with asterisk and colon with truncated text", function () {
		var lbl = element(by.id('reqColonLabelParentWidth'));

		browser.executeScript("document.getElementById('reqColonLabelParentWidth').scrollIntoView()").then(function () {
			expect(takeScreenshot(lbl)).toLookAs("34_label_required_colon_parent_width");
		});
	});
});