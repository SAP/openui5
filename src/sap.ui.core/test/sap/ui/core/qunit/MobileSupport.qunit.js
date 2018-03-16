/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(["sap/ui/MobileSupport"], function(MobileSupport) {
	"use strict";

	var fnRemoveViewort = function(){
		jQuery("meta").filter("[name=viewport]").remove();
	};

	// TESTS
	QUnit.module("sap/ui/MobileSupport", {
		beforeEach: fnRemoveViewort,
		afterEach: fnRemoveViewort
	});

	QUnit.test("Test initMobile with default settings", function (assert) {
		MobileSupport.initMobile();

		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 1, "There should be a viewport meta tag");
		assert.ok($v.attr("content").length > 0, "viewport meta tag has content")

		// check <meta name="apple-mobile-web-app-status-bar-style" content="default">
		if (sap.ui.Device.os.ios) {
			var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
			var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
			assert.equal($amwac.length, 1, "There should be an apple-mobile-web-app-capable meta tag");
			assert.equal($amwac.attr("content"), "yes", "The apple-mobile-web-app-capable meta tag content should be correct");
			assert.equal($mwac.length, 0, "There shouldn't be any mobile-web-app-capable meta tag due to compatibility");
		}

		// check status bar style: <meta name="apple-mobile-web-app-status-bar-style" content="default">
		if (sap.ui.Device.os.ios) {
			var $sb = jQuery("meta").filter("[name=apple-mobile-web-app-status-bar-style]");
			assert.equal($sb.length, 1, "There should be an apple-mobile-web-app-status-bar-style meta tag");
			assert.equal($sb.attr("content"), "default", "The apple-mobile-web-app-status-bar-style meta tag content should be correct");
		}

		// no touch icon  <link rel="apple-touch-icon...
		var $ti = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($ti.length, 0, "There should be no apple-touch-icon tag");
	});

	QUnit.test("Test initMobile with custom settings", function (assert) {
		MobileSupport.initMobile({
			viewport: false,
			statusBar: "black",
			homeIcon: "home.png",
			homeIconPrecomposed: true
		});

		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 0, "There should be no viewport meta tag");

		// touch icon  <link rel="apple-touch-icon...
		var $ti = jQuery("link").filter("[rel=apple-touch-icon-precomposed]");
		assert.equal($ti.length, 4, "There should be four apple-touch-icon-precomposed link tags");
		assert.equal($ti.attr("href"), "home.png", "The apple-touch-icon-precomposed link tag href should be correct")
	});

	QUnit.module("sap/ui/MobileSupport (tablet)", {
		beforeEach: function() {
			var oSystem = {
				tablet: true
			};

			(function(newValue){
				var _orig = sap.ui.Device.system;
				sap.ui.Device.system = newValue;
				sap.ui.Device.system.restore = function(){
					sap.ui.Device.system = _orig;
				};
			})(oSystem);

			fnRemoveViewort();
		},
		afterEach: function() {
			sap.ui.Device.system.restore();
			fnRemoveViewort();
		}
	});

	QUnit.test("Test setWebAppCapable", function(assert) {
		MobileSupport.setMobileWebAppCapable(true);
		var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// call it with the same parameter again
		MobileSupport.setMobileWebAppCapable(true);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "yes", "content is set to yes");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "yes", "content is set to yes");

		// Set the property to false
		MobileSupport.setMobileWebAppCapable(false);
		$amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
		$mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
		assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
		assert.equal($amwac.attr("content"), "no", "content is set to no");
		assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
		assert.equal($mwac.attr("content"), "no", "content is set to no");
	});



	QUnit.module("sap/ui/MobileSupport (retina)", {
		beforeEach: function() {
			this.retina = jQuery.support.retina;
			jQuery.support.retina = true; // some more faking...
			fnRemoveViewort();
		},
		afterEach: function() {
			jQuery.support.retina = this.retina;
			fnRemoveViewort();
		}
	});


	QUnit.test("Test initMobile with resolution-specific home icons", function (assert) {
		MobileSupport.initMobile({
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

		var $si = jQuery("link").filter("[rel^=shortcut]");
		assert.equal($si.length, 1, "There should be one shortcut icon tag");
		assert.equal($si.attr("href"), "desktop.ico", "The shortcut icon link tag href should be correct");
	});

});
