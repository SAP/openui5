/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ComboBoxShowItems", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ComboBox';

	// check initial
	it("Should load the showItems test page",function() {
		expect(takeScreenshot()).toLookAs("showItems-initial");
	});

	// ComboBox show items filter
	it("ComboBox with default filter", function() {
		var comboArrow = element(by.id("__xmlview0--combo1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox1Filter"));

		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cb-no-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("cb-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("cb-closed-arrow-no-highlight");

		element(by.css(".sapMPageHeader")).click();
	});

	it("ComboBox with default filter and selected item from recommendations", function() {
		var comboArrow = element(by.id("__xmlview0--combo1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox1Filter"));

		comboFilterButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(1).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cb-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	it("ComboBox with filter and selected non recommendation item", function() {
		var comboArrow = element(by.id("__xmlview0--combo1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox1Filter")),
			comboButton = element(by.id("__xmlview0--btnComboBox1"));

		comboButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(20).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cb-non-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	// ComboBox with grouping show items filter
	it("ComboBox (Grouping) with default filter", function() {
		var comboArrow = element(by.id("__xmlview0--combo3-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox3Filter"));

		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cbg-no-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("cbg-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("cbg-closed-arrow-no-highlight");

		element(by.css(".sapMPageHeader")).click();
	});

	it("ComboBox (Grouping) with default filter and selected item from recommendations", function() {
		var comboArrow = element(by.id("__xmlview0--combo3-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox3Filter"));

		comboFilterButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(1).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cbg-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	it("ComboBox (Grouping) with filter and selected non recommendation item", function() {
		var comboArrow = element(by.id("__xmlview0--combo3-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnComboBox3Filter")),
			comboButton = element(by.id("__xmlview0--btnComboBox3"));

		comboButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(20).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("cbg-non-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	// MultiComboBox showItems with filter
	it("MultiComboBox with default filter", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox1Filter"));

		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcb-no-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcb-no-filter-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcb-closed-arrow-no-highlight");

		element(by.css(".sapMPageHeader")).click();
	});

	it("MultiComboBox with default filter and selected item from recommendations", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox1Filter"));

		comboFilterButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(1).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcb-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	it("MultiComboBox with filter and selected non recommendation item", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox1-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox1Filter")),
			comboButton = element(by.id("__xmlview0--btnMultiComboBox1"));

		comboButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(20).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcb-non-recomendation-selected");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcb-non-recomendation-two-selected");

		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	// MultiComboBox showItems with filter
	it("MultiComboBox (grouping) with default filter", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox2-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox2Filter"));

		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcbg-no-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcbg-no-filter-arrow-highlight");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcbg-closed-arrow-no-highlight");

		element(by.css(".sapMPageHeader")).click();
	});

	it("MultiComboBox (grouping) with default filter and selected item from recommendations", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox2-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox2Filter"));

		comboFilterButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(1).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcbg-recomendation-selected");

		comboArrow.click();
		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

	it("MultiComboBox (grouping) with filter and selected non recommendation item", function() {
		var comboArrow = element(by.id("__xmlview0--multiComboBox2-arrow")),
			comboFilterButton = element(by.id("__xmlview0--btnMultiComboBox2Filter")),
			comboButton = element(by.id("__xmlview0--btnMultiComboBox2"));

		comboButton.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(20).click();
		comboFilterButton.click();
		expect(takeScreenshot()).toLookAs("mcbg-non-recomendation-selected");

		comboArrow.click();
		expect(takeScreenshot()).toLookAs("mcbg-non-recomendation-two-selected");

		comboArrow.click();

		element(by.css(".sapMPageHeader")).click();
	});

});
