/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MessagePopover", function () {
	"use strict";

	var bPhone = null;
	var _resolvePopover = function () {
		return bPhone ? "mPopover-messagePopover-dialog" : "mPopover-messagePopover-popover";
	};
	var _resolveCloseButton = function () {
		return bPhone ? "__button4" : "__button2";
	};

	it("should load test page", function () {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});

		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should open MessagePopover", function () {
		element(by.id("mPopoverButton")).click();
		expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages.", function () {
			element(by.id("mPopover-messageView-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-" + sMessageType);
		});
	});

	it("should open MessagePopover in compact mode", function () {
		element(by.id(_resolveCloseButton())).click(); //Close the Popover/Dialog
		element(by.id("compactMode")).click();
		element(by.id("mPopoverButton")).click();
		expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-compact");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages in MessagePopover in compact mode.", function () {
			element(by.id("mPopover-messageView-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-compact-" + sMessageType);
		});
	});

});