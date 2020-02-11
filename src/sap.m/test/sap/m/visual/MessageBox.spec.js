/*global describe,it,element,by,takeScreenshot,browser,expect */
/*eslint max-nested-callbacks: [2,4]*/

describe("sap.m.MessageBox", function () {
	"use strict";

	var jsCode = "";

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	["INFORMATION", "WARNING", "ERROR", "SUCCESS", "QUESTION"].forEach(function (type) {
		it("Should open MessageBox of type " + type, function () {
			element(by.id("selectType")).click();
			element(by.id("type" + type)).click();
			["OK", "CANCEL"].forEach(function (value) {
				jsCode = "sap.ui.getCore().byId('mBox" + value + "').close();";
				element(by.id("button" + value)).click();
				expect(takeScreenshot(element(by.id("mBox" + value)))).toLookAs(type + "-mbox-" + value);
				browser.executeScript(jsCode);
			});
		});
	});

	it("Should open confirm MessageBox", function () {
		element(by.id("buttonConfirm")).click();
		expect(takeScreenshot(element(by.id("mBoxConfirm")))).toLookAs("mbox-confirm");
		browser.executeScript("sap.ui.getCore().byId('mBoxConfirm').close();");
	});

	it("Should open MessageBox with a very long text", function () {
		element(by.id("buttonLongText")).click();
		expect(takeScreenshot(element(by.id("messageBoxId")))).toLookAs("mbox-longtext");
		browser.executeScript("sap.ui.getCore().byId('messageBoxId').close();");
	});

	it("Should open MessageBox with show details options", function () {
		element(by.id("buttonDetails")).click();
		expect(takeScreenshot(element(by.id("messageBoxId1")))).toLookAs("mbox-details1");
		browser.executeScript("sap.ui.getCore().byId('messageBoxId1').getContent()[0].getAggregation('items')[1].firePress();");
		expect(takeScreenshot(element(by.id("messageBoxId1")))).toLookAs("mbox-details2");
		browser.executeScript("sap.ui.getCore().byId('messageBoxId1').close();");
	});

	it("Should open MessageBox with custom actions and emphasizedAction", function () {
		element(by.id("btnEmphasizedAction")).click();
		expect(takeScreenshot(element(by.id("mboxEmphasizedAction")))).toLookAs("mbox-emphasizedAction");
		browser.executeScript("sap.ui.getCore().byId('mboxEmphasizedAction').close();");
	});

	it("Should open MessageBox with custom actions and emphasizedAction", function () {
		element(by.id("btnNoEmphasizedAction")).click();
		expect(takeScreenshot(element(by.id("mboxNoEmphasizedAction")))).toLookAs("mbox-no-emphasizedAction");
		browser.executeScript("sap.ui.getCore().byId('mboxNoEmphasizedAction').close();");
	});

});