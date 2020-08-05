/*global describe,it,element,by,takeScreenshot,browser,expect*/
describe("sap.m.PageWithResponsivePaddings", function () {
	"use strict";

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should load test page with size S", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "580px");
		});
		expect(takeScreenshot()).toLookAs("page-size-S");
	});

	it("Should load test page with size M", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1000px");
		});
		expect(takeScreenshot()).toLookAs("page-size-M");
	});

	it("Should load test page with size L", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1430px");
		});
		expect(takeScreenshot()).toLookAs("page-size-L");
	});

	it("Should load test page with size XL", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1500px");
		});
		expect(takeScreenshot()).toLookAs("page-size-XL");
	});

    //check page with floating footer
	it("Should show page with floating footer", function () {
		element(by.id("toggle-floating-footer")).click();
		expect(takeScreenshot()).toLookAs("page-with-floating-footer");
	});

	it("Should load test page with floating footer and size S", function () {
		browser.executeScript(function() {
            var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "580px");
		});
		expect(takeScreenshot()).toLookAs("page-floating-footer-size-S");
	});

	it("Should load test page with floating footer and size M", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1000px");
		});
		expect(takeScreenshot()).toLookAs("page-floating-footer-size-M");
	});

	it("Should load test page with floating footer and size L", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1430px");
		});
		expect(takeScreenshot()).toLookAs("page-floating-footer-size-L");
	});

	it("Should load test page with floating footer and size XL", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.getCore().byId("page").getDomRef();
			jQuery(oPageDomRef).css("width", "1500px");
		});
		expect(takeScreenshot()).toLookAs("page-floating-footer-size-XL");
	});
});