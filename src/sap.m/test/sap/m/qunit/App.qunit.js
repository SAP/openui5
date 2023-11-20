/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function(Element, createAndAppendDiv, App, Page, jQuery, Device, Core) {
	"use strict";

	createAndAppendDiv("content");

	function getBgDomElement(oApp) {
		return oApp.getDomRef("BG");
	}

	var sBackroungImageSrc  = "test-resources/sap/m/images/SAPLogo.jpg",


	app = new App("myFirstApp", {
		initialPage: "page1",
		homeIcon: "test.png",
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
		assert.ok(document.getElementById("myFirstApp"), "App should be rendered");
		assert.ok(document.getElementById("page1"), "Initially the first page should be rendered");
	});

	QUnit.test("Home Icon Tag", function(assert) {
		var $hi = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($hi.length, 1, "There should be 1 link tags with the home icons");
		assert.equal($hi.attr("href"), "test.png", "link tag should point to the home icon");
	});

	QUnit.test("Viewport Meta Tag", function(assert) {
		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		var $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 1, "There should be a viewport meta tag");
		if (Device.os.ios) {
			assert.equal($v.attr("content"), "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no", "The viewport meta tag content should be correct");
		} else {
			assert.equal($v.attr("content"), "width=device-width, initial-scale=1.0", "The viewport meta tag content should be correct");
		}
	});

	/**
	 * @deprecated Since version 1.20.0
	 */
	QUnit.test("orientationChange event", function(assert) {
		var landscape;

		function onOrientationChange(evt) {
			landscape = evt.getParameter("landscape");
		}

		app.attachOrientationChange(onOrientationChange);

		assert.equal(landscape, undefined, "handler for orientationChange should not have been called yet");
		app._handleOrientationChange();
		assert.ok(landscape !== undefined, "handler for orientationChange should have been called");

		var isLandscape = jQuery(window).width() > jQuery(window).height();
		assert.equal(landscape, isLandscape, "'landscape' parameter should contain the current orientation");

		app.detachOrientationChange(onOrientationChange);
	});

	QUnit.test("Dimensions", function(assert) {
		var appDom = document.getElementById("myFirstApp");
		var ww = document.body.getBoundingClientRect().width;
		var wh = document.documentElement.getBoundingClientRect().height;
		assert.equal(appDom.getBoundingClientRect().width, ww, "width should be the complete window width");
		assert.equal(Math.round(appDom.getBoundingClientRect().height), Math.round(wh), "height should be the complete window height"); // rounding needed for IE11
		});

	QUnit.test("destroy", function(assert) {
		app.destroy();
		assert.equal(document.getElementById("page1"), undefined, "Page 1 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page1") === undefined, "Page 1 should not exist anymore as control");
		assert.equal(document.getElementById("page2"), undefined, "Page 2 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page2") === undefined, "Page 2 should not exist anymore as control");
		assert.equal(document.getElementById("page3"), undefined, "Page 3 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page3") === undefined, "Page 3 should not exist anymore as control");
	});


	QUnit.module("backgroundColor", {
		beforeEach: function () {
			this.oApp = new App();
			this.oApp.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("only valid color is set to DOM element", function(assert) {
		var oApp = this.oApp;

		oApp.setBackgroundColor("blue;5px solid red;");

		// Act
		oApp.invalidate();
		Core.applyChanges();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundColor, '', "correct property value");
	});


	QUnit.module("backgroundImage", {
		beforeEach: function () {
			this.oApp = new App();
			this.oApp.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("style is set to DOM element", function(assert) {
		// Arrange
		var oApp = this.oApp,
			sExpectedOutputImagePath = 'url("' + (sBackroungImageSrc) + '")',
			$oAppImageHolder;

		// Act
		oApp.setBackgroundImage(sBackroungImageSrc);
		Core.applyChanges();

		// Arrange
		$oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});


	QUnit.test("url value with special characters", function(assert) {
		// Arrange
		var oApp = this.oApp,
			sPath = "test-resources/sap/m/images/",
			sUnreservedChars = "img100-._~",
			sReservedChars1 = encodeURIComponent("#[]@"), // skipped  :/?  because of OS restriction
			sReservedChars2 = encodeURIComponent("!$&'()+,;="),
			sOtherChars = encodeURIComponent(" çéд"),
			sReservedCharsUnencoded = "$",
			sFileExtension = ".png",
			sQuery = "?q1=1&q2=2",
			sImgSrc = sPath + sUnreservedChars + sReservedChars1 + sReservedChars2 + sOtherChars + sReservedCharsUnencoded + sFileExtension + sQuery,
			$oAppImageHolder,
			sExpectedOutputImagePath = 'url("' + (sImgSrc) + '")';

		// Act
		oApp.setBackgroundImage(sImgSrc);
		Core.applyChanges();

		// Arrange
		$oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});

	QUnit.test("url value with base64 encoding", function(assert) {
		// Arrange
		var oApp = this.oApp,
			sImgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
			$oAppImageHolder,
			sExpectedOutputImagePath = 'url("' + sImgSrc + '")';

		// Act
		oApp.setBackgroundImage(sImgSrc);
		Core.applyChanges();

		// Arrange
		$oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});


	QUnit.test("encodes css-specific chars in backgroundImage value", function(assert) {
		// Arrange
		var sImageSrc = sBackroungImageSrc + ");border:5px solid red;",
			oApp = this.oApp,
			oAppDom = getBgDomElement(oApp),
			sBorderBeforeTest = oAppDom.style.border;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		Core.applyChanges();

		// Check
		oAppDom = getBgDomElement(oApp);
		assert.strictEqual(oAppDom.style.border, sBorderBeforeTest, "preserved border style value");
	});


	QUnit.test("encodes html-specific chars in backgroundImage style", function(assert) {
		// Arrange
		var sImageSrc = sBackroungImageSrc + ')"; onmouseover="console.log"',
			oApp = this.oApp,
			oAppDom = getBgDomElement(oApp),
			oHandlerBeforeTest = oAppDom.onmouseover;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		Core.applyChanges();

		// Check
		oAppDom = getBgDomElement(oApp);
		assert.strictEqual(oAppDom.onmouseover, oHandlerBeforeTest, "preserved handler value");
	});

	QUnit.module("Parent traversing", {
		beforeEach: function () {
			this.oApp = new App();
			this.oSpy = this.spy(this.oApp, "_adjustParentsHeight");
			this.oApp.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("isTopLevel property", function(assert) {
		assert.strictEqual(this.oSpy.called, true, "Parents are traversed when isTopLevel value is true");

		this.oSpy.resetHistory();

		this.oApp.setIsTopLevel(false);
		Core.applyChanges();

		assert.strictEqual(this.oSpy.notCalled, true, "Parents are not traversed when isTopLevel value is false");
	});

	QUnit.module("Invisible App", {
		beforeEach: function () {
			this.oApp = new App({ visible: false });
			this.oApp.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("Error not thrown when App is invisible and has no parent", function(assert) {
		assert.ok(true, "Error is not thrown when there is no parent of the App and it's initially invisible");
	});
});