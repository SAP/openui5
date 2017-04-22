/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.MessageView', function() {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages.", function () {
			element(by.id("mMView2-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id("mMView2")))).toLookAs("mMView2-" + sMessageType);

			// turns compact mode on
			element(by.id("compactMode")).click();
			expect(takeScreenshot(element(by.id("mMView2")))).toLookAs("mMView2-" + sMessageType + "-compact");

			//turn compact mode off
			element(by.id("compactMode")).click();
		});
	});

	it("should open MessageView in Dialog", function () {
		element(by.id("mView-in-dialog-btn")).click();
		expect(takeScreenshot()).toLookAs("message-view-in-dialog");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType, nIndex) {
		it("should open " + sMessageType + " messages in Dialog.", function () {
			element(by.id("mMView1-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id("mMView1")))).toLookAs("mMView1-" + sMessageType);
			if (nIndex === 4) {
				element(by.id('dialogCloseButton')).click();
			}
		});
	});

	it("should open MessageView in compact mode in Dialog", function () {
		element(by.id("compactMode")).click();
		element(by.id("mView-in-dialog-btn")).click();
		expect(takeScreenshot(element(by.id("mMView1")))).toLookAs("mMView1-compact");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages in Dialog in compact mode.", function () {
			element(by.id("mMView1-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id("mMView1")))).toLookAs("mMView1-" + sMessageType + "-compact");
		});
	});

});