/* global QUnit */
sap.ui.define([
	"jquery.sap.mobile"
], function(jQuery) {
	"use strict";

	QUnit.test("Test initMobile with resolution-specific home icons", function (assert) {
		jQuery.support.retina = true; // some more faking...

		jQuery.sap.initMobile({
			homeIcon: {
					'phone':'phone-icon.png',
					'phone@2':'phone-retina.png',
					'tablet':'tablet-icon.png',
					'tablet@2':'tablet-retina.png',
					'icon': 'desktop.ico'
			},
			homeIconPrecomposed: false
		});

		// touch icon  <link rel="apple-touch-icon...
		var $ti = jQuery("link").filter("[rel=apple-touch-icon-precomposed]");
		assert.equal($ti.length, 0, "There should be no apple-touch-icon-precomposed link tag");

		$ti = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($ti.length, 4, "There should be four apple-touch-icon link tags");
		assert.equal($ti.filter(":eq(0)").attr("href"), "phone-icon.png", "The apple-touch-icon link tag href should be correct");
		assert.equal($ti.filter(":eq(1)").attr("href"), "tablet-icon.png", "The apple-touch-icon link tag href should be correct");
		assert.equal($ti.filter(":eq(2)").attr("href"), "phone-retina.png", "The apple-touch-icon link tag href should be correct");
		assert.equal($ti.filter(":eq(3)").attr("href"), "tablet-retina.png", "The apple-touch-icon link tag href should be correct");

		var $si = jQuery("link").filter("[rel=icon]");
		assert.equal($si.length, 1, "There should be one icon tag");
		assert.equal($si.attr("href"), "desktop.ico", "The icon link tag href should be correct");
	});
});
