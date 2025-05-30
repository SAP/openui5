/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Popup",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/MessageToast",
	"sap/m/InstanceManager",
	"sap/ui/core/HTML",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(
	Element,
	Popup,
	createAndAppendDiv,
	App,
	Page,
	MessageToast,
	InstanceManager,
	HTML,
	Log,
	nextUIUpdate,
	jQuery
) {
	"use strict";

	createAndAppendDiv("content");


	var oApp = new App("myApp", {
		initialPage: "page1"
	});

	var oPage = new Page("page1", {
		title: "MessageToast Control"
	});

	oApp.addPage(oPage);
	oApp.placeAt("content");



	var getBoxSizing = function($DomRef) {
		return $DomRef.css("box-sizing") || $DomRef.css("-webkit-box-sizing") || $DomRef.css("-moz-box-sizing");
	};

	/* =========================================================== */
	/* HTML module                                                 */
	/* =========================================================== */

	QUnit.module("HTML");

	QUnit.test("rendering", function(assert) {

		// act
		MessageToast.show("message toast");

		// arrange
		var $MessageToast = jQuery(".sapMMessageToast").eq(0);

		// assert
		assert.ok($MessageToast.length, "The message toast HTML DIV element exist");
		assert.strictEqual($MessageToast[0].style.width, "15em", "Default MessageToast width is 15em");
		assert.strictEqual($MessageToast.css("visibility"), "visible", "After calling the sap.m.MessageToast.show(): the MessageToast is visible");
		assert.strictEqual($MessageToast.css("position"), "absolute", "Position absolute");
		assert.strictEqual($MessageToast.text(), "message toast", "The message toast displays the correct text");
		assert.strictEqual(getBoxSizing($MessageToast), "border-box", "Is using old box model");
		assert.strictEqual(typeof $MessageToast.css("box-shadow"), "string", "Is using box shadow");
		assert.strictEqual($MessageToast.css("text-align"), "center", "The text is centered");
		assert.strictEqual($MessageToast.css("text-overflow"), "ellipsis", "ellipsis");
		assert.strictEqual($MessageToast.attr("role"), "alert", "The role is set");
		assert.strictEqual($MessageToast.css("white-space"), "pre-line", "The message has the correct white-space style for supporting line break");
	});

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("Validate options");

	/* ------------------------------ */
	/* duration                       */
	/* ------------------------------ */

	var isFiniteInteger = function(sTestName, vValue) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._isFiniteInteger(vValue);

			// assert
			assert.ok(fnErrorSpy.calledOnce, '"duration" needs to be a finite positive nonzero integer, Log.error() method must be called exactly once');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isFiniteInteger("duration", "2000");
	isFiniteInteger("duration", 0);
	isFiniteInteger("duration", -3);
	isFiniteInteger("duration", NaN);
	isFiniteInteger("duration", Infinity);
	isFiniteInteger("duration", -3000);
	isFiniteInteger("duration", -0.3000);
	isFiniteInteger("duration", 0.00000000000009);

	/* ------------------------------ */
	/* width                          */
	/* ------------------------------ */

	QUnit.test("width", function(assert) {
		// arrange
		var fnErrorSpy = sinon.spy(Log, "error");

		// act
		MessageToast._validateWidth("16");

		// assert
		assert.ok(fnErrorSpy.calledOnce, '"width" should be type of "sap.ui.core/CSSSize"');

		// cleanup
		fnErrorSpy.restore();
	});

	/* ------------------------------------------ */
	/* test for valid docking positions my and at */
	/* ------------------------------------------ */

	var isDockPosition = function(sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateDockPosition(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"' + vValue + '"' + ' should be type of "sap.ui.core.Popup.Dock"');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isDockPosition("my", Popup.Dock.BeginTop, 0);
	isDockPosition("my", Popup.Dock.BeginCenter, 0);
	isDockPosition("my", Popup.Dock.BeginBottom, 0);
	isDockPosition("my", Popup.Dock.LeftTop, 0);
	isDockPosition("my", Popup.Dock.LeftCenter, 0);
	isDockPosition("my", Popup.Dock.LeftBottom, 0);
	isDockPosition("my", Popup.Dock.CenterTop, 0);
	isDockPosition("my", Popup.Dock.CenterBottom, 0);
	isDockPosition("my", Popup.Dock.RightTop, 0);
	isDockPosition("my", Popup.Dock.RightCenter, 0);
	isDockPosition("my", Popup.Dock.RightBottom, 0);
	isDockPosition("my", Popup.Dock.EndTop, 0);
	isDockPosition("my", Popup.Dock.EndCenter, 0);
	isDockPosition("my", Popup.Dock.EndBottom, 0);
	isDockPosition("my", "CenterCenter", 0);
	isDockPosition("my", "center other", 1);
	isDockPosition("at", "center center2", 1);

	/* ------------------------------ */
	/* of                             */
	/* ------------------------------ */

	var isValidOf = function(sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateOf(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"of" needs to be an instance of sap.ui.core.Control or an Element or a jQuery object or the window');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isValidOf("of", Element.getElementById("myApp"), 0);
	isValidOf("of", jQuery("html")[0], 0);
	isValidOf("of", jQuery("html"), 0);
	isValidOf("of", window, 0);

	isValidOf("of", undefined, 1);
	isValidOf("of", "undefined", 1);
	isValidOf("of", document, 1);

	/* ------------------------------ */
	/* offset                         */
	/* ------------------------------ */

	QUnit.test("offset", function(assert) {
		// arrange
		var fnErrorSpy = sinon.spy(Log, "error");

		// act
		MessageToast._validateOffset(50);

		// assert
		assert.ok(fnErrorSpy.calledOnce, '"offset" should be type of "string"');

		// cleanup
		fnErrorSpy.restore();
	});

	/* ------------------------------ */
	/* collision                      */
	/* ------------------------------ */

	var isValidCollision = function(sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateCollision(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"collision" needs to be a single value “fit”, “flip” or “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none"');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isValidCollision("collision", "fit", 0);
	isValidCollision("collision", "flip", 0);
	isValidCollision("collision", "none", 0);
	isValidCollision("collision", "flipfit", 0);
	isValidCollision("collision", "flipflip", 0);
	isValidCollision("collision", "flip flip", 0);
	isValidCollision("collision", "flip fit", 0);
	isValidCollision("collision", "fitflip", 0);
	isValidCollision("collision", "fitfit", 0);
	isValidCollision("collision", "fit fit", 0);
	isValidCollision("collision", "fit flip", 0);
	isValidCollision("collision", "fit fit fit", 1);
	isValidCollision("collision", "flip2", 1);
	isValidCollision("collision", "fit1 fit2", 1);

	/* ------------------------------ */
	/* onClose                        */
	/* ------------------------------ */

	var isValidOnCloseFn = function (sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateOnClose(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"onClose"' + ' should be a function or null');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isValidOnCloseFn("onClose", function() {}, 0);
	isValidOnCloseFn("onClose", null, 0);
	isValidOnCloseFn("onClose", {}, 1);

	/* ------------------------------ */
	/* autoClose                      */
	/* ------------------------------ */

	var isValidAutoCloseValue = function(sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateAutoClose(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"autoClose"' + ' should be a boolean');

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isValidAutoCloseValue("autoClose", true, 0);
	isValidAutoCloseValue("autoClose", false, 0);
	isValidAutoCloseValue("autoClose", {}, 1);

	/* ------------------------------ */
	/* animationTimingFunction        */
	/* ------------------------------ */

	var isValidAnimationTimingFunction = function(sTestName, vValue, iNumberOfErrors) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var fnErrorSpy = sinon.spy(Log, "error");

			// act
			MessageToast._validateAnimationTimingFunction(vValue);

			// assert
			assert.strictEqual(fnErrorSpy.callCount, iNumberOfErrors, '"animationTimingFunction"' + ' should be a string, expected values: ' + ["ease", "linear", "ease-in", "ease-out", "ease-in-out"].toString());

			// cleanup
			fnErrorSpy.restore();
		});
	};

	isValidAnimationTimingFunction("animationTimingFunction", "ease", 0);
	isValidAnimationTimingFunction("animationTimingFunction", "linear", 0);
	isValidAnimationTimingFunction("animationTimingFunction", "ease-in", 0);
	isValidAnimationTimingFunction("animationTimingFunction", "ease-out", 0);
	isValidAnimationTimingFunction("animationTimingFunction", "ease-in-out", 0);
	isValidAnimationTimingFunction("animationTimingFunction", "ease1", 1);
	isValidAnimationTimingFunction("animationTimingFunction", "ease ease", 1);

	/* ------------------------------ */
	/* animationDuration              */
	/* ------------------------------ */

	isFiniteInteger("animationDuration", "1");
	isFiniteInteger("animationDuration", -3);
	isFiniteInteger("animationDuration", NaN);
	isFiniteInteger("animationDuration", Infinity);
	isFiniteInteger("animationDuration", -3000);
	isFiniteInteger("animationDuration", -0.3000);
	isFiniteInteger("animationDuration", 0.00000000000009);

	/* ------------------------------ */
	/* closeOnBrowserNavigation       */
	/* ------------------------------ */

	var fnCloseOnBrowserNavigationTestCase = function(bCloseOnBrowserNavigation) {
		QUnit.test("closeOnBrowserNavigation", function(assert) {

			// arrange
			var fnAddPopoverInstanceSpy = sinon.spy(InstanceManager, "addPopoverInstance");

			// act
			MessageToast.show("message toast", {
				my: "EndTop",
				at: "EndTop",
				closeOnBrowserNavigation: bCloseOnBrowserNavigation
			});

			// assert
			assert.strictEqual(fnAddPopoverInstanceSpy.callCount, bCloseOnBrowserNavigation ? 1 : 0);

			// cleanup
			fnAddPopoverInstanceSpy.restore();
		});
	};

	fnCloseOnBrowserNavigationTestCase(true);
	fnCloseOnBrowserNavigationTestCase(false);

	/* =========================================================== */
	/* Events module                                               */
	/* =========================================================== */

	QUnit.module("Events");

	QUnit.test("Mousedown on SVG element should not throw exception", async function (assert) {
		var done = assert.async();
		var oSvgCircle = new HTML({
			content: '<svg id="svg-circle" height="100" width="100">' +
						'<circle cx="50" cy="50" r="40" fill="red"></circle>' +
					'</svg>'
		});

		oPage.addContent(oSvgCircle);
		await nextUIUpdate();

		MessageToast._handleMouseDownEvent(jQuery.Event("mousedown", {
			target: document.getElementById("svg-circle")
		}));

		MessageToast.show("test", {
			onClose: function () {
				oSvgCircle.destroy();
				assert.ok(true, "Message toast closed with no error thrown");
				done();
			}
		});
	});

	QUnit.test("Callback", function(assert) {
		var done = assert.async();
		setTimeout(function() {

			// arrange
			var fnCloseSpy = sinon.spy();

			// act
			MessageToast.show("message toast", {
				my: "CenterCenter",
				at: "CenterCenter",
				onClose: fnCloseSpy
			});

			setTimeout(function() {

				// assert
				assert.ok(fnCloseSpy.calledOn(MessageToast), 'onClose callback was called with the correct context');

				// start the test
			done();
			}, 7000);
		}, 0);
	});

	QUnit.test("Reference call of method", function(assert) {
		var done = assert.async();
		setTimeout(function() {

			// arrange
			var fnCloseSpy = sinon.spy();
			var fnShow = MessageToast.show;

			// act
			fnShow.call(fnShow, "message toast reference call", {
				my: "CenterCenter",
				at: "CenterCenter",
				onClose: fnCloseSpy
			});

			setTimeout(function() {

				// assert
				assert.ok(fnCloseSpy.calledOn(MessageToast), 'onClose callback was called with the correct context');

				// start the test
				done();
			}, 7000);
		}, 0);
	});
});