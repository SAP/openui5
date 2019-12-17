/* global describe, it, element, by, takeScreenshot, browser, expect */

describe("sap.f.CardsVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs("0_Initial");
	});

	it('List Card', function() {
		element(by.id("__item0-container-cardsVisualTests---main--useCases-0")).click(); // also can be selected with element(by.css(".visualTestsGridList li:nth-of-type(2)"))
		var oCard = element(by.id("container-cardsVisualTests---listContent--listCount"));
		expect(takeScreenshot(oCard)).toLookAs("1_ListCard");
	});

	it('Default Headers', function() {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-3").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-3")).click();


		var Header1 = element(by.css("#container-cardsVisualTests---nolayout--somedfault > div"));
		expect(takeScreenshot(Header1)).toLookAs("2_Default_Header_1");


		var Header2 = element(by.css("#container-cardsVisualTests---nolayout--default1x1 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default1x1").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header2)).toLookAs("2_Default_Header_1x1");
		});

		var Header3 = element(by.css("#container-cardsVisualTests---nolayout--default2x1 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default2x1").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header3)).toLookAs("2_Default_Header_2x1");
		});

		var Header4 = element(by.css("#container-cardsVisualTests---nolayout--default4x1 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default4x1").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header4)).toLookAs("2_Default_Header_4x1");
		});

		var Header5 = element(by.css("#container-cardsVisualTests---nolayout--default2x2 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default2x2").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header5)).toLookAs("2_Default_Header_2x2");
		});

		var Header6 = element(by.css("#container-cardsVisualTests---nolayout--default4x2 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default4x2").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header6)).toLookAs("2_Default_Header_4x2");
		});

		var Header7 = element(by.css("#container-cardsVisualTests---nolayout--default4x4 > div"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---nolayout--default4x4").scrollIntoView()').then(function() {
			expect(takeScreenshot(Header7)).toLookAs("2_Default_Header_4x4");
		});
	});

	it('Numeric Header', function() {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-4").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-4")).click();

		var oCard1 = element(by.css("#container-cardsVisualTests---numericHeader--header1 .sapFCardHeader"));
		expect(takeScreenshot(oCard1)).toLookAs("3_NumericHeader_1");

		var oCard2 = element(by.css("#container-cardsVisualTests---numericHeader--header2 .sapFCardHeader"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---numericHeader--header2").scrollIntoView()').then(function() {
			expect(takeScreenshot(oCard2)).toLookAs("3_NumericHeader_2");
		});

		var oCard3 = element(by.css("#container-cardsVisualTests---numericHeader--header3 .sapFCardHeader"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---numericHeader--header3").scrollIntoView()').then(function() {
			expect(takeScreenshot(oCard3)).toLookAs("3_NumericHeader_3");
		});

		var oCard4 = element(by.css("#container-cardsVisualTests---numericHeader--header4 .sapFCardHeader"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---numericHeader--header4").scrollIntoView()').then(function() {
			expect(takeScreenshot(oCard4)).toLookAs("3_NumericHeader_4");
		});

		var oCard5 = element(by.css("#container-cardsVisualTests---numericHeader--header5 .sapFCardHeader"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---numericHeader--header5").scrollIntoView()').then(function() {
			expect(takeScreenshot(oCard5)).toLookAs("3_NumericHeader_5");
		});

		var oCard6 = element(by.css("#container-cardsVisualTests---numericHeader--header6 .sapFCardHeader"));
		browser.executeScript('document.getElementById("container-cardsVisualTests---numericHeader--header6").scrollIntoView()').then(function() {
			expect(takeScreenshot(oCard6)).toLookAs("3_NumericHeader_6");
		});
	});

	it('Grid Container', function() {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-5").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-5")).click();

		var oCard = element(by.css("#container-cardsVisualTests---GridContainer--cContainer"));
		expect(takeScreenshot(oCard)).toLookAs("4_GridContainer");
	});

	it('Object Card', function() {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-2").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-2")).click();

		var oCard = element(by.css("#container-cardsVisualTests---objectContent--objectId"));
		expect(takeScreenshot(oCard)).toLookAs("5_Object_Card_1");
	});

	it("Table Card", function () {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-1").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-1")).click();

		var oCard = element(by.css("#container-cardsVisualTests---tableContent--tablecard1"));
		expect(takeScreenshot(oCard)).toLookAs("6_Table_Card_1");

		var oCard2 = element(by.css("#container-cardsVisualTests---tableContent--tablecard2"));
		expect(takeScreenshot(oCard2)).toLookAs("6_Table_Card_2");
	});

	it("Adaptive Card", function () {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-3").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-3")).click();

		var oCard = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard1"));
		expect(takeScreenshot(oCard)).toLookAs("8_Adaptive_Card_1");

		var oCard2 = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard2"));
		expect(takeScreenshot(oCard2)).toLookAs("8_Adaptive_Card_2");

		var oCard3 = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard3"));
		expect(takeScreenshot(oCard3)).toLookAs("8_Adaptive_Card_3");
	});

	it("Min Height", function () {
		browser.executeScript("window.history.back()");
		browser.executeScript('document.getElementById("__item0-container-cardsVisualTests---main--useCases-6").scrollIntoView()');
		element(by.id("__item0-container-cardsVisualTests---main--useCases-6")).click();

		expect(takeScreenshot()).toLookAs("7_Min_Height");
	});
});