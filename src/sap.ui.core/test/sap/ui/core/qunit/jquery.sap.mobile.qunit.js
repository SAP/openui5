/* global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"jquery.sap.mobile"
],function(Device, jQuery) {
	"use strict";

	QUnit.module("Test initMobile");

	QUnit.test("Test initMobile with default settings", function (assert) {
		jQuery.sap.initMobile();

		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		// for ios platform: <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 1, "There should be a viewport meta tag");
		assert.ok($v.attr("content").length > 0, "viewport meta tag has content");

		// check <meta name="apple-mobile-web-app-status-bar-style" content="default">
		if (Device.os.ios) {
			var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
			var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
			assert.equal($amwac.length, 1, "There should be an apple-mobile-web-app-capable meta tag");
			assert.equal($amwac.attr("content"), "yes", "The apple-mobile-web-app-capable meta tag content should be correct");
			assert.equal($mwac.length, 0, "There shouldn't be any mobile-web-app-capable meta tag due to compatibility");
		}

		// check status bar style: <meta name="apple-mobile-web-app-status-bar-style" content="default">
		if (Device.os.ios) {
			var $sb = jQuery("meta").filter("[name=apple-mobile-web-app-status-bar-style]");
			assert.equal($sb.length, 1, "There should be an apple-mobile-web-app-status-bar-style meta tag");
			assert.equal($sb.attr("content"), "default", "The apple-mobile-web-app-status-bar-style meta tag content should be correct");
		}

		// no touch icon  <link rel="apple-touch-icon...
		var $ti = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($ti.length, 0, "There should be no apple-touch-icon tag");
	});


	QUnit.test("Test setWebAppCapable ", function(assert) {
		var oSystem = {
			tablet: true
		};

		this.stub(Device, "system").value(oSystem);

		jQuery.sap.setMobileWebAppCapable(true);
		var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// call it with the same parameter again
		jQuery.sap.setMobileWebAppCapable(true);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// Set the property to false
		jQuery.sap.setMobileWebAppCapable(false);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "no", "content is set to no");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "no", "content is set to no");
	});
});