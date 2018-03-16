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

			// turn compact mode on
			element(by.id("compactMode")).click();
			expect(takeScreenshot(element(by.id("mMView2")))).toLookAs("mMView2-" + sMessageType + "-compact");

			//turn compact mode off
			element(by.id("compactMode")).click();
		});
	});

	it("should open MessageView with one MessageViewItem in Popover", function () {
		// open popover
		element(by.id("mViewButton2")).click();
		expect(takeScreenshot()).toLookAs("message-view-with-one-item");
		element(by.id("closeBtn")).click();

		// turn compact mode on
		element(by.id("compactMode")).click();
		element(by.id("mViewButton2")).click();
		expect(takeScreenshot()).toLookAs("message-view-with-one-item-compact");
		element(by.id("closeBtn")).click();

		//turn compact mode off
		element(by.id("compactMode")).click();
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

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType, nIndex) {
		it("should open " + sMessageType + " messages in Dialog in compact mode.", function () {
			element(by.id("mMView1-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id("mMView1")))).toLookAs("mMView1-" + sMessageType + "-compact");
			if (nIndex === 4) {
				element(by.id('dialogCloseButton')).click();
			}
		});
	});

	it("should open MessageView in Dialog with hidden details header - details page", function () {
		element(by.id("mView-in-dialog-btn-2")).click();
		expect(takeScreenshot()).toLookAs("mv-in-dialog-w-no-details-hdr-detpage");
	});

	it("should open MessageView in Dialog with hidden details", function () {
		element(by.id("mMView5-back")).click();
		expect(takeScreenshot()).toLookAs("mv-in-dialog-w-no-details-hdr-initpage");
		element(by.id("dialogWOneHeader-close-btn")).click();
	});

	it("should open MessageView with one type of message", function () {
		element(by.id("mViewButton3")).click();
		expect(takeScreenshot(element(by.id("pop3")))).toLookAs("message-view-with-one-type");
		element(by.id("mViewButton4")).click();
		element(by.id("mViewButton3")).click();
		expect(takeScreenshot(element(by.id("pop3")))).toLookAs("message-view-with-filtering-again");
		element(by.id("mViewButton5")).click();
		element(by.id("mViewButton6")).click();
		expect(takeScreenshot(element(by.id("pop4")))).toLookAs("message-view-without-button");
		element(by.id("page1-intHeader-BarMiddle")).click();
	});

	it("should open collapsed MessagePopover with filter buttons visible", function () {
		element(by.id("mViewButton7")).click();
		expect(takeScreenshot(element(by.id("mPop-messagePopover-popover")))).toLookAs("message-view-collapsed-filtering");
		element(by.id("mPop-messageView-error")).click();
		expect(takeScreenshot(element(by.id("mPop-messagePopover-popover")))).toLookAs("message-view-expanded-filtering");
		element(by.id("__button12")).click();
	});

});