/* global QUnit */
sap.ui.define([
	"jquery.sap.mobile"
], function(jQuery){
	"use strict";

	QUnit.test("Test initMobile with custom settings", function (assert) {
		jQuery.sap.initMobile({
			viewport: false,
			statusBar: "black",
			homeIcon: "home.png",
			homeIconPrecomposed: true
		});

		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		// for ios platform: <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 0, "There should be no viewport meta tag");

		// touch icon  <link rel="apple-touch-icon...
		var $ti = jQuery("link").filter("[rel=apple-touch-icon-precomposed]");
		assert.equal($ti.length, 1, "There should be one apple-touch-icon-precomposed link tags");
		assert.equal($ti.attr("href"), "home.png", "The apple-touch-icon-precomposed link tag href should be correct");
	});
});