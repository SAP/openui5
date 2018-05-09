/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/DOMUtil",
	'sap/ui/Device'
],
function(
	DOMUtil,
	Device
) {
	"use strict";

	QUnit.module("Given that a container is rendered with a bigger content element (for scrollbars)", {
		beforeEach : function() {
			this.oContent = jQuery("<div style='background: red; width: 200px; height: 200px; position: relative; left: -35px; top: 40px;'></div>");
			this.oContainer = jQuery("<div style='background: blue; width: 100px; height: 100px; overflow: auto;'></div>");
			this.oContainer.append(this.oContent).appendTo("#qunit-fixture");
		},
		afterEach : function() {
			this.oContainer.remove();
		}
	}, function(){
		QUnit.test("when getOffsetFromParent is called for the content without scrolling", function(assert) {
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, this.oContainer.get(0));
			//TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.webkit || Device.browser.blink) ? -47 : -35;
			if (!Device.browser.phantomJS){
				assert.strictEqual(
					mOffset.left,
					iExpectedOffsetLeft,
					"the left offset is correct");
			}
			assert.strictEqual(
				mOffset.top,
				40,
				"the top offset is correct");
		});

		QUnit.test("when getOffsetFromParent is called for the content after scrolling on the container", function(assert) {
			var oContainerDomRef = this.oContainer.get(0);
			var oContentGeometry = DOMUtil.getGeometry(this.oContent.get(0));
			var iScrollValue = -50;
			//TODO: Remove when bug in Chrome and Safari is fixed
			var iExpectedOffsetLeft = (Device.browser.webkit || Device.browser.blink) ? -97 : -85;
			// IE and Edge use positive leftScroll
			if (Device.browser.msie || Device.browser.edge) {
				iScrollValue = -iScrollValue;
			}
			// Blink (Chrome) uses positive leftScroll but starts on the extreme left
			if (Device.browser.blink){
				var iMaxScrollWidth = oContainerDomRef.scrollWidth - oContainerDomRef.clientWidth;
				iScrollValue = iMaxScrollWidth + iScrollValue;
			}
			this.oContainer.scrollLeft(iScrollValue);
			this.oContainer.scrollTop(60);
			var mOffset = DOMUtil.getOffsetFromParent(oContentGeometry, oContainerDomRef);
			if (!Device.browser.phantomJS){
				assert.strictEqual(
					mOffset.left,
					iExpectedOffsetLeft,
					"the left offset is correct");
			}
			assert.strictEqual(
				mOffset.top,
				100,
				"the top offset is correct");
		});
	});

	QUnit.module("getScrollLeft()", {
		beforeEach: function() {
			this.$Panel = jQuery('<div/>').css({
				'width': '100px',
				'height': '100px',
				'overflow': 'auto'
			}).appendTo("#qunit-fixture");

			jQuery('<div/>').css({
				'width': '200px',
				'height': '200px'
			}).appendTo(this.$Panel);
		},
		afterEach: function() {
			this.$Panel.remove();
		}
	}, function(){
		QUnit.test("initial position", function (assert) {
			if (!Device.browser.phantomJS){
				assert.strictEqual(DOMUtil.getScrollLeft(this.$Panel.get(0)), 0);
			} else {
				assert.ok(true, "PhantomJS ignored on this test");
			}
		});
		QUnit.test("scrolled to the most left position", function (assert) {
			var iMaxScrollLeftValue = this.$Panel.get(0).scrollWidth - this.$Panel.get(0).clientWidth;
			var iScrollValue;

			if (Device.browser.blink || Device.browser.phantomJS) {
				iScrollValue = 0;
			} else if (Device.browser.msie || Device.browser.edge) {
				iScrollValue = iMaxScrollLeftValue;
			} else {
				iScrollValue = -iMaxScrollLeftValue;
			}

			this.$Panel.scrollLeft(iScrollValue);
			if (!Device.browser.phantomJS){
				assert.strictEqual(DOMUtil.getScrollLeft(this.$Panel.get(0)), -iMaxScrollLeftValue);
			} else {
				assert.ok(true, "PhantomJS ignored on this test");
			}
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});

	QUnit.start();
});