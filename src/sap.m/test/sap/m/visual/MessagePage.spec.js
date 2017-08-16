/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.MessagePage", function() {
	"use strict";

	var _showMenu = function() {
			browser.executeScript(function() {
				var bPhone = sap.ui.Device.system.phone;
				if (bPhone) { // on desktop the menu is always visible
					sap.ui.getCore().byId("splitApp").toMaster("master"); // the menu is the master part
				}
			}).then(function() {
				element(by.id("master-title-inner")).click();
			});
	};

	it("Should test default MessagePage",function(){
		element(by.id("SLItem1")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should test compact mode", function () {
		_showMenu();
		element(by.id("SLItem5")).click();
		expect(takeScreenshot()).toLookAs("compact-mode");
		_showMenu();
		element(by.id("SLItem5")).click(); //toggle back
	});

	it("Should test Page with MessagePage", function () {
		_showMenu();
		element(by.id("SLItem2")).click();
		expect(takeScreenshot()).toLookAs("page-with-message-page");
	});

	it("Should test NavContainer with MessagePage", function () {
		_showMenu();
		element(by.id("SLItem4")).click();
		expect(takeScreenshot()).toLookAs("nav-container-with-message-page");
	});
});
