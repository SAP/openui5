/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.MessagePage", function() {
	"use strict";

	it("Should test default MessagePage",function(){
		//show message page
		element(by.id("SLItem1")).click(); // menu item that invokes message page
		element(by.id("messagePage-page-title-inner")).click(); // wait for message page to show

		//compare
		expect(takeScreenshot()).toLookAs("initial");

		//back to menu
		element(by.id("messagePage-page-navButton-iconBtn")).click(); // nav-back button
		element(by.id("master-title-inner")).click(); // wait for menu page to show
	});

	it("Should test compact mode", function () {
		//show message page in compact mode
		element(by.id("SLItem5")).click();
		element(by.id("messagePage-page-title-inner")).click(); // wait for message page to show

		//compare
		expect(takeScreenshot()).toLookAs("compact-mode");

		//back to menu
		element(by.id("messagePage-page-navButton-iconBtn")).click(); // back to menu
		element(by.id("master-title-inner")).click(); // wait for menu page to show

		//toggle back
		element(by.id("SLItem5")).click(); //toggle compact mode
	});

	it("Should test Page with MessagePage", function () {
		//show message page in page
		element(by.id("SLItem2")).click();
		element(by.id("__page0-page-title-inner")).click(); // wait for message page to show

		//compare
		expect(takeScreenshot()).toLookAs("page-with-message-page");

		//back to menu
		element(by.id("__page0-page-navButton-iconBtn")).click(); // back to menu
		element(by.id("master-title-inner")).click(); // wait for menu page to show
	});

	it("Should test NavContainer with MessagePage", function () {
		//show message page in navContainer
		element(by.id("SLItem4")).click();
		element(by.id("__page1-page-title-inner")).click(); // wait for message page to show

		//compare
		expect(takeScreenshot()).toLookAs("nav-container-with-message-page");
	});
});
