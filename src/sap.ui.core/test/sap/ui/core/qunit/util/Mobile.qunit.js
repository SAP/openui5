/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	"sap/ui/util/Mobile",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(Mobile, Device, jQuery) {
	"use strict";

	var fnRemoveViewport = function(){
		jQuery("meta").filter("[name=viewport]").remove();
	};

	QUnit.config.reorder = false;

	// TESTS
	QUnit.module("sap/ui/util/Mobile", {
		beforeEach: fnRemoveViewport,
		afterEach: fnRemoveViewport
	});

	QUnit.test("Test init with default settings", function (assert) {
		Mobile.init();

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

		// Check whether size changes through new viewport were detected and the Device.resize values were adapted.
		assert.equal(window.innerHeight, Device.resize.height, "Device.resize.height is set correctly.");
		assert.equal(window.innerWidth, Device.resize.width, "Device.resize.width is set correctly.");

		// Check that additional init without parameters does not crash ==> See BCP 2270099497
		Mobile.init();
		assert.ok(true, "Mobile.init() was re-executed without exception.");
	});

	QUnit.test("Test init with custom settings", function (assert) {
		Mobile.init({
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

	QUnit.module("sap/ui/util/Mobile (tablet)", {
		beforeEach: function() {
			var oSystem = {
				tablet: true
			};

			(function(newValue){
				var _orig = Device.system;
				Device.system = newValue;
				Device.system.restore = function(){
					Device.system = _orig;
				};
			})(oSystem);

			fnRemoveViewport();
		},
		afterEach: function() {
			Device.system.restore();
			fnRemoveViewport();
		}
	});

	QUnit.test("Test setWebAppCapable", function(assert) {
		Mobile.setWebAppCapable(true);
		var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// call it with the same parameter again
		Mobile.setWebAppCapable(true);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// Set the property to false
		Mobile.setWebAppCapable(false);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "no", "content is set to no");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "no", "content is set to no");
	});



	QUnit.module("sap/ui/util/Mobile (retina)", {
		beforeEach: function() {
			fnRemoveViewport();
		},
		afterEach: function() {
			fnRemoveViewport();
		}
	});


	QUnit.test("Test init with resolution-specific home icons", function (assert) {
		Mobile.init({
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
