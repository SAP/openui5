/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DOMUtil",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	DOMUtil,
	jQuery,
	Device
) {
	"use strict";

	var SCROLLBAR_WIDTH = DOMUtil.getScrollbarWidth();
	var RELATIVE_POS_LEFT = -35;

	QUnit.module("Given that a container is rendered with a bigger content element (for scrollbars)", {
		beforeEach: function() {
			this.oContent = document.createElement("div");
			this.oContent.style.background = "red";
			this.oContent.style.width = "200px";
			this.oContent.style.height = "200px";
			this.oContent.style.position = "relative";
			this.oContent.style.left = "-35px";
			this.oContent.style.top = "40px";
			this.oContainer = document.createElement("div");
			this.oContainer.style.background = "blue";
			this.oContainer.style.width = "100px";
			this.oContainer.style.height = "100px";
			this.oContainer.style.overflow = "auto";
			this.oContainer.append(this.oContent);
			document.getElementById("qunit-fixture").append(this.oContainer);
		},
		afterEach: function() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getOffsetFromParent is called for the content without scrolling", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent);
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer);
			// TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.safari && !Device.browser.mobile) ? RELATIVE_POS_LEFT - SCROLLBAR_WIDTH : RELATIVE_POS_LEFT;
			// in some cases (special physical devices) the offset is returend as decimal value
			// actually we need to round the offset for chrome browser on mac
			assert.strictEqual(Math.ceil(mOffset.left), iExpectedOffsetLeft, `the left offset is correct - result: ${
				Math.ceil(mOffset.left)} / expected value: ${iExpectedOffsetLeft}`);
			assert.strictEqual(mOffset.top, 40, "the top offset is correct");
		});

		QUnit.test("when getOffsetFromParent is called for the content after scrolling on the container", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent);
			var iScrollValue = -50;
			var iRelativePosLeft = iScrollValue + RELATIVE_POS_LEFT;
			// TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.safari && !Device.browser.mobile) ? iRelativePosLeft - SCROLLBAR_WIDTH : iRelativePosLeft;
			var iMaxScrollWidth = this.oContainer.scrollWidth - this.oContainer.clientWidth;
			iScrollValue = iMaxScrollWidth + iScrollValue;
			// scrollLeftRTL is a function from UI5 Core JQuery
			jQuery(this.oContainer).scrollLeftRTL(iScrollValue);
			this.oContainer.scrollTop = 60;
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer);
			// round for offset value is actually nedded for chrome browser on mac
			assert.strictEqual(Math.ceil(mOffset.left), iExpectedOffsetLeft,
				`the left offset is correct - result: ${Math.ceil(mOffset.left)} / expected value: ${iExpectedOffsetLeft}`);
			assert.strictEqual(mOffset.top, 100, "the top offset is correct");
		});
	});

	QUnit.module("getScrollLeft()", {
		beforeEach: function() {
			var oInnerPanel = document.createElement("div");
			oInnerPanel.style.width = "200px";
			oInnerPanel.style.height = "200px";
			this.oPanel = document.createElement("div");
			this.oPanel.style.width = "100px";
			this.oPanel.style.height = "100px";
			this.oPanel.style.overflow = "auto";
			this.oPanel.append(oInnerPanel);
			document.getElementById("qunit-fixture").append(this.oPanel);
		},
		afterEach: function() {
			this.oPanel.remove();
		}
	}, function() {
		QUnit.test("initial position", function(assert) {
			var iScrollLeftResult = DOMUtil.getScrollLeft(this.oPanel);
			assert.strictEqual(Math.round(iScrollLeftResult), 0);
		});
		QUnit.test("scrolled to the most left position", function(assert) {
			var iMaxScrollLeftValue = this.oPanel.scrollWidth - this.oPanel.clientWidth;
			// scrollLeftRTL is a function from UI5 Core JQuery
			jQuery(this.oPanel).scrollLeftRTL(0);
			var iScrollLeftResult = DOMUtil.getScrollLeft(this.oPanel);
			assert.strictEqual(Math.round(iScrollLeftResult), -iMaxScrollLeftValue);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});