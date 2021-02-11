/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/DOMUtil",
	"sap/ui/Device"
],
function(
	DOMUtil,
	Device
) {
	"use strict";

	var SCROLLBAR_WIDTH = 11;
	var RELATIVE_POS_LEFT = -35;

	QUnit.module("Given that a container is rendered with a bigger content element (for scrollbars)", {
		beforeEach: function() {
			this.oContent = jQuery("<div style='background: red; width: 200px; height: 200px; position: relative; left: -35px; top: 40px;'></div>");
			this.oContainer = jQuery("<div style='background: blue; width: 100px; height: 100px; overflow: auto;'></div>");
			this.oContainer.append(this.oContent).appendTo("#qunit-fixture");
		},
		afterEach: function() {
			this.oContainer.remove();
		}
	}, function() {
		QUnit.test("when getOffsetFromParent is called for the content without scrolling", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0));
			//TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.safari && !Device.browser.mobile) ? RELATIVE_POS_LEFT - SCROLLBAR_WIDTH : RELATIVE_POS_LEFT;
			// in some cases (special physical devices) the offset is returend as decimal value
			// actually we need to round the offset for chrome browser on mac
			assert.strictEqual(Math.ceil(mOffset.left), iExpectedOffsetLeft, "the left offset is correct - result: " +
				Math.ceil(mOffset.left) + " / expected value: " + iExpectedOffsetLeft);
			assert.strictEqual(mOffset.top, 40, "the top offset is correct");
		});

		QUnit.test("when getOffsetFromParent is called for the content after scrolling on the container", function(assert) {
			var oContainerDomRef = this.oContainer.get(0);
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			var iScrollValue = -50;
			var iRelativePosLeft = iScrollValue + RELATIVE_POS_LEFT;
			//TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.safari && !Device.browser.mobile) ? iRelativePosLeft - SCROLLBAR_WIDTH : iRelativePosLeft;
			var iMaxScrollWidth = oContainerDomRef.scrollWidth - oContainerDomRef.clientWidth;
			iScrollValue = iMaxScrollWidth + iScrollValue;
			jQuery(this.oContainer).scrollLeftRTL(iScrollValue);
			this.oContainer.scrollTop(60);
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, oContainerDomRef);
			// round for offset value is actually nedded for chrome browser on mac
			assert.strictEqual(Math.ceil(mOffset.left), iExpectedOffsetLeft,
				"the left offset is correct - result: " + Math.ceil(mOffset.left) + " / expected value: " + iExpectedOffsetLeft);
			assert.strictEqual(mOffset.top, 100, "the top offset is correct");
		});
	});

	QUnit.module("getScrollLeft()", {
		beforeEach: function() {
			this.$Panel = jQuery('<div></div>').css({
				width: '100px',
				height: '100px',
				overflow: 'auto'
			}).appendTo("#qunit-fixture");

			jQuery('<div></div>').css({
				width: '200px',
				height: '200px'
			}).appendTo(this.$Panel);
		},
		afterEach: function() {
			this.$Panel.remove();
		}
	}, function () {
		QUnit.test("initial position", function (assert) {
			var iScrollLeftResult = DOMUtil.getScrollLeft(this.$Panel.get(0));
			assert.strictEqual(Math.round(iScrollLeftResult), 0);
		});
		QUnit.test("scrolled to the most left position", function (assert) {
			var iMaxScrollLeftValue = this.$Panel.get(0).scrollWidth - this.$Panel.get(0).clientWidth;
			jQuery(this.$Panel).scrollLeftRTL(0);
			var iScrollLeftResult = DOMUtil.getScrollLeft(this.$Panel.get(0));
			assert.strictEqual(Math.round(iScrollLeftResult), -iMaxScrollLeftValue);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});