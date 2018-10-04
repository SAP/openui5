/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"jquery.sap.global",
	"sap/ui/Device"
], function(QUnitUtils, createAndAppendDiv, App, Page, jQuery, Device) {
	createAndAppendDiv("content");



	var landscape;
	function oc(evt) {
		landscape = evt.getParameter("landscape");
	}


	var app = new App("myFirstApp", {
		initialPage: "page1",
		homeIcon: "test.png",
		orientationChange: oc,
		pages: [
			new Page("page1", {
				title: "Page 1"
			}),
			new Page("page2", {
				title: "Page 2"
			}),
			new Page("page3", {
				title: "Page 3"
			})
		]
	});
	app.placeAt("content");



	QUnit.test("App rendered", function(assert) {
		assert.ok(jQuery.sap.domById("myFirstApp"), "App should be rendered");
		assert.ok(jQuery.sap.domById("page1"), "Initially the first page should be rendered");
	});

	QUnit.test("Home Icon Tag", function(assert) {
		var $hi = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($hi.length, 4, "There should be 4 link tags with the home icons");
		assert.equal($hi.attr("href"), "test.png", "link tag should point to the home icon");
	});

	QUnit.test("Viewport Meta Tag", function(assert) {
		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 1, "There should be a viewport meta tag");
		assert.equal($v.attr("content"), "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no", "The viewport meta tag content should be correct");
	});

	// this is deprecated now in favor of sap.ui.Device.orientation... behavior in IE is inconsistent anyway (might fire on startup or not)
	if (!Device.browser.internet_explorer) {
		QUnit.test("orientationChange event", function(assert) {
			assert.equal(landscape, undefined, "handler for orientationChange should not have been called yet");
			app._handleOrientationChange();
			assert.ok(landscape !== undefined, "handler for orientationChange should have been called");

			var isLandscape = jQuery(window).width() > jQuery(window).height();
			assert.equal(landscape, isLandscape, "'landscape' parameter should contain the current orientation");
		});
	}

	QUnit.test("Dimensions", function(assert) {
		var appDom = jQuery.sap.domById("myFirstApp");
		var ww = document.body.getBoundingClientRect().width;
		var wh = document.documentElement.getBoundingClientRect().height;
		assert.equal(appDom.getBoundingClientRect().width, ww, "width should be the complete window width");
		assert.equal(Math.round(appDom.getBoundingClientRect().height), Math.round(wh), "height should be the complete window height"); // rounding needed for IE11
		});

	QUnit.test("destroy", function(assert) {
		app.destroy();
		assert.equal(jQuery.sap.domById("page1"), undefined, "Page 1 should not exist anymore in the DOM");
		assert.ok(sap.ui.getCore().byId("page1") === undefined, "Page 1 should not exist anymore as control");
		assert.equal(jQuery.sap.domById("page2"), undefined, "Page 2 should not exist anymore in the DOM");
		assert.ok(sap.ui.getCore().byId("page2") === undefined, "Page 2 should not exist anymore as control");
		assert.equal(jQuery.sap.domById("page3"), undefined, "Page 3 should not exist anymore in the DOM");
		assert.ok(sap.ui.getCore().byId("page3") === undefined, "Page 3 should not exist anymore as control");
	});
});