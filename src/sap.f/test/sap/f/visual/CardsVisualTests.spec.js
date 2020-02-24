/* global describe, it, element, by, takeScreenshot, browser, expect */

describe("sap.f.CardsVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	function getListItem(sTitle) {
		return element(by.control({
			controlType: "sap.m.CustomListItem",
			viewName: "Main",
			viewNamespace: "sap.f.cardsVisualTests.view.",
			descendant: {
				controlType: "sap.m.Title",
				properties: {text: sTitle}
			}
		}));
	}

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs("0_Initial");
	});

	it('List Card', function() {
		getListItem("List Card").click();

		var oCard = element(by.id("container-cardsVisualTests---listContent--listCount"));
		expect(takeScreenshot(oCard)).toLookAs("1_ListCard");
	});

	it('Default Headers', function() {
		browser.executeScript("window.history.back()");

		getListItem("No layout").click();

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

		getListItem("Numeric Header").click();

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

		getListItem("Grid Container").click();

		var oCard = element(by.css("#container-cardsVisualTests---GridContainer--cContainer"));
		expect(takeScreenshot(oCard)).toLookAs("4_GridContainer");
	});

	it('Object Card', function() {
		browser.executeScript("window.history.back()");

		getListItem("Object Card").click();

		var oCard = element(by.css("#container-cardsVisualTests---objectContent--objectId"));
		expect(takeScreenshot(oCard)).toLookAs("5_Object_Card_1");
	});

	it("Table Card", function () {
		browser.executeScript("window.history.back()");

		getListItem("Table Card").click();

		var oCard = element(by.css("#container-cardsVisualTests---tableContent--tablecard1"));
		expect(takeScreenshot(oCard)).toLookAs("6_Table_Card_1");

		var oCard2 = element(by.css("#container-cardsVisualTests---tableContent--tablecard2"));
		expect(takeScreenshot(oCard2)).toLookAs("6_Table_Card_2");
	});

	it("Adaptive Card", function () {
		browser.executeScript("window.history.back()");

		getListItem("Adaptive Card").click();

		var oCard = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard1"));
		expect(takeScreenshot(oCard)).toLookAs("8_Adaptive_Card_1");

		var oCard2 = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard2"));
		expect(takeScreenshot(oCard2)).toLookAs("8_Adaptive_Card_2");

		var oCard3 = element(by.css("#container-cardsVisualTests---adaptiveContent--adaptivecard3"));
		expect(takeScreenshot(oCard3)).toLookAs("8_Adaptive_Card_3");
	});

	it("Min Height", function () {
		browser.executeScript("window.history.back()");

		getListItem("Min Height").click();

		// Takes screenshot of each card on the page. The first 10 are in cozy mode, the second 10 are in compact mode.
		var aCards = element.all(by.control({
			controlType: "sap.ui.integration.widgets.Card",
			viewName: "MinHeight",
			viewNamespace: "sap.f.cardsVisualTests.view."
		}));

		aCards.each(function (oCard, iIndex) {
			browser.executeScript('arguments[0].scrollIntoView()', oCard).then(function() {
				expect(takeScreenshot(oCard)).toLookAs("7_Min_Height_Card_" + iIndex);
			});
		});
	});
});