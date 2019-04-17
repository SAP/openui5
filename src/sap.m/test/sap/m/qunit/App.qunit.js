/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function(QUnitUtils, createAndAppendDiv, App, Page, jQuery, Device, Core) {
	createAndAppendDiv("content");



	var landscape;
	function oc(evt) {
		landscape = evt.getParameter("landscape");
	}

	function getBgDomElement(oApp) {
		return document.getElementById(oApp.getId() + "-BG");
	}

	function getAbsoluteURL(sRelPath) {
		return document.baseURI + sRelPath;
	}

	var sBackroungImageSrc  = "test-resources/sap/m/images/SAPLogo.jpg",


	app = new App("myFirstApp", {
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
		assert.ok(document.getElementById("myFirstApp"), "App should be rendered");
		assert.ok(document.getElementById("page1"), "Initially the first page should be rendered");
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
		var appDom = document.getElementById("myFirstApp");
		var ww = document.body.getBoundingClientRect().width;
		var wh = document.documentElement.getBoundingClientRect().height;
		assert.equal(appDom.getBoundingClientRect().width, ww, "width should be the complete window width");
		assert.equal(Math.round(appDom.getBoundingClientRect().height), Math.round(wh), "height should be the complete window height"); // rounding needed for IE11
		});

	QUnit.test("destroy", function(assert) {
		app.destroy();
		assert.equal(document.getElementById("page1"), undefined, "Page 1 should not exist anymore in the DOM");
		assert.ok(Core.byId("page1") === undefined, "Page 1 should not exist anymore as control");
		assert.equal(document.getElementById("page2"), undefined, "Page 2 should not exist anymore in the DOM");
		assert.ok(Core.byId("page2") === undefined, "Page 2 should not exist anymore as control");
		assert.equal(document.getElementById("page3"), undefined, "Page 3 should not exist anymore in the DOM");
		assert.ok(Core.byId("page3") === undefined, "Page 3 should not exist anymore as control");
	});


	QUnit.module("backgroundColor", {
		beforeEach: function () {
			this.oApp = new sap.m.App();
			this.oApp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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
		oApp.rerender();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundColor, '', "correct property value");
	});


	QUnit.module("backgroundImage", {
		beforeEach: function () {
			this.oApp = new sap.m.App();
			this.oApp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("style is set to DOM element", function(assert) {
		// Arrange
		var oApp = this.oApp,
			sExpectedOutputImagePath = 'url("' + (Device.browser.safari ? getAbsoluteURL(sBackroungImageSrc) : sBackroungImageSrc) + '")',
			$oAppImageHolder;

		// Act
		oApp.setBackgroundImage(sBackroungImageSrc);
		sap.ui.getCore().applyChanges();

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
			sExpectedOutputImagePath = 'url("' + (Device.browser.safari ? getAbsoluteURL(sImgSrc) : sImgSrc) + '")';

		// Act
		oApp.setBackgroundImage(sImgSrc);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Check
		oAppDom = getBgDomElement(oApp);
		assert.strictEqual(oAppDom.onmouseover, oHandlerBeforeTest, "preserved handler value");
	});
});