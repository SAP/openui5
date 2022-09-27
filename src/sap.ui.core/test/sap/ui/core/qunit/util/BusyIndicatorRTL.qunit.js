/* global QUnit */

sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/ui/thirdparty/jquery"
], function (BusyIndicator, jQuery) {
	"use strict";

	QUnit.module("RTL-mode", {
		beforeEach: function () {
		},

		afterEach: function () {
			BusyIndicator.hide(0);
		}
	});

	QUnit.test("Check If Animation is Centered in RTL-mode", function (assert) {
		var done = assert.async();
		BusyIndicator.show(100);

		setTimeout(function () {
			var $Popup = jQuery("#sapUiBusyIndicator");
			assert.equal($Popup.length, 1, "BusyIndicator should be visible");

			var $Animation = $Popup.find(".sapUiLocalBusyIndicatorAnimation");
			assert.equal($Animation.length, 1, "BusyIndicator animation should be visible");

			var oClientRects = $Animation.get(0).getClientRects()[0];

			// this is the position where the animation is
			var iAnimationRight = parseInt(oClientRects.right) - (oClientRects.width / 2);

			var iDocWidth = document.body.offsetWidth;
			// this is the position where the animation should be
			var iDocLeftPosition = parseInt(iDocWidth / 2);

			// calculating the mid of the animation with a buffer of 10 pixels
			var bCentered = iDocLeftPosition - 10 < iAnimationRight &&
				iDocLeftPosition + 10 > iAnimationRight;

			assert.ok(bCentered, "Animation should be centered at +/- 10 of " + iDocLeftPosition + " and is at left-position " + iAnimationRight);

			done();
		}, 500);
	});
});
