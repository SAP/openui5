/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.MessageView', function() {
	"use strict";

	var app, compactBtn, overflowBtn,
		bPhone = null;

	it('should load test page', function () {
		browser.executeScript(function () {
			app = sap.ui.getCore().byId("split-app");
			compactBtn = sap.ui.getCore().byId("compactMode");
			overflowBtn = sap.ui.getCore().byId("overflow-tb")._getOverflowButton();
		});
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs('initial');
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		if (bPhone) {
			element(by.id("mView-in-dialog-btn")).click();
		}
		it("should open " + sMessageType + " messages.", function () {
			element(by.id("mMView2-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id("mMView2")))).toLookAs("mMView2-" + sMessageType);

			// turn compact mode on
			if (!bPhone) {
				element(by.id("compactMode")).click();
				expect(takeScreenshot(element(by.id("mMView2")))).toLookAs("mMView2-" + sMessageType + "-compact");

			//turn compact mode off
			element(by.id("compactMode")).click();
			}
		});
	});
	if (!bPhone) {
		it("should open MessageView with one MessageViewItem in Popover", function () {
			// open overflow toolbar popover the buttons are overflowing
			browser.executeScript(function () {
				if (overflowBtn) {
					overflowBtn.firePress();
				}
			});

			element(by.id("mViewButton2")).click();
			expect(takeScreenshot()).toLookAs("message-view-with-one-item");
			element(by.id("closeBtn")).click();

			// switch to compact mode without losing focus from the overflow popover
			browser.executeScript(function () {
				compactBtn.fireSelect();
			});

			element(by.id("mViewButton2")).click();
			expect(takeScreenshot()).toLookAs("message-view-with-one-item-compact");
			element(by.id("closeBtn")).click();

			// turn compact mode off
			element(by.id("compactMode")).click();
		});

		it("should open MessageView in Dialog", function () {
			browser.executeScript(function () {
				app.showMaster();
			}).then(function () {
				element(by.id("mView-in-dialog-btn")).click();
				expect(takeScreenshot()).toLookAs("message-view-in-dialog");
			});
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
			browser.executeScript(function () {
				app.hideMaster();
				compactBtn.fireSelect();
				app.showMaster();
			}).then(function () {
				element(by.id("mView-in-dialog-btn")).click();
				expect(takeScreenshot(element(by.id("mMView1")))).toLookAs("mMView1-compact");
			});
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
			browser.executeScript(function () {
				app.hideMaster();
				if (overflowBtn) {
					overflowBtn.firePress();
				}
			});
			element(by.id("mViewButton3")).click();
			expect(takeScreenshot(element(by.id("pop3")))).toLookAs("message-view-with-one-type");
			element(by.id("mViewButton4")).click();
			element(by.id("mViewButton3")).click();
			expect(takeScreenshot(element(by.id("pop3")))).toLookAs("message-view-with-filtering-again");
			element(by.id("mViewButton5")).click();
			element(by.id("mViewButton6")).click();
			expect(takeScreenshot(element(by.id("pop4")))).toLookAs("message-view-without-button");
		});

		it("should open collapsed MessagePopover with filter buttons visible", function () {
			element(by.id("mViewButton7")).click();
			expect(takeScreenshot(element(by.id("mPop-messagePopover-popover")))).toLookAs("message-view-collapsed-filtering");
			element(by.id("mPop-messageView-error")).click();
			expect(takeScreenshot(element(by.id("mPop-messagePopover-popover")))).toLookAs("message-view-expanded-filtering");
			element(by.id("__button12")).click();
		});


		it("should open MessageView with long title", function () {
			element(by.id("mMView2-information")).click();
			element(by.jq("#mMView2listPage-cont > div > ul > li:nth-child(3) > div > span")).click();
			expect(takeScreenshot()).toLookAs("message-view-long-title");
			element(by.jq("#mMView2-detailsPage > header > div > button")).click();
		});
	}
});