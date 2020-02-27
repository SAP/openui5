/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/m/Image",
	"sap/ui/thirdparty/jquery",
	"sap/m/library",
	"sap/m/LightBox",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(Image, jQuery, mobileLibrary, LightBox, Text, KeyCodes, QUtils, Core, Device) {
	// shortcut for sap.m.ImageMode
	var ImageMode = mobileLibrary.ImageMode;



	var IMAGE_PATH = "test-resources/sap/m/images/",
		sSrc = IMAGE_PATH + "SAPLogo.jpg",
		sSrc2 = IMAGE_PATH + "SAPLogo@2.jpg",
		sSrc3 = IMAGE_PATH + "SAPUI5.png",
		sSrcAction = IMAGE_PATH + "action.png",
		sSrcActionPressed = IMAGE_PATH + "action_pressed.png",
		sTooltip = "tooltip",
		sAlt = "alternative text";

	var sControlId = "ImId";

	// Creates a Image with generic properties
	// Config object can be passed as argument. If some property already exist it will be overridden
	function createImage(oProps) {
		var oImageProps = {
			src: sSrc,
			width: "150px",
			height: "74px"
		};
		oProps && jQuery.extend(oImageProps, oProps);

		return new Image(sControlId, oImageProps);
	}

	/* tests */
	QUnit.module("Basic rendering");

	QUnit.test("Image is rendered when it's visible", function(assert) {
		// Arrange
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $oImage = oImage.$();
		assert.ok($oImage.hasClass("sapMImg"), "Image is rendered.");
		assert.ok(($oImage !== undefined) && ($oImage != null), "oImage should not be null");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is not rendered when it's not visible", function(assert) {
		// Arrange
		var oImage = createImage({
			visible: false
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $oImage = oImage.$();
		assert.ok(!$oImage.hasClass("sapMImg"), "sapMImage class is not found.");
		assert.ok(!document.getElementById(sControlId) , "oImage is not rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundPosition value", function(assert) {
		// Arrange
		var oImage = createImage({
			mode: "Background"
		}),
		// BCP: 1970042795 - "initial" value for IE is "0% 0%"
		sInitial = Device.browser.msie ? "0% 0%" : "initial",
		aTestInputValues = ["left top", "right bottom", "right top", "50% 50%", "10px 20px", sInitial, " left  top ", "50px;5px solid red", '50px" onerror='],
		aExpOutputValues = ["left top", "right bottom", "right top", "50% 50%", "10px 20px", sInitial, "left top", "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		aTestInputValues.forEach(function(sTestValue, iIndex) {
			oImage.setBackgroundPosition(sTestValue);
			oImage.rerender();

			// Assert
			var oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundPosition, aExpOutputValues[iIndex], "correct property value");
		});

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundSize value", function(assert) {
		// Arrange
		var oImage = createImage({
				mode: "Background"
			}),
			// BCP: 1970042795 - "initial" value for IE is "auto", but since it will break FireFox, we set it to "0% 0%"
			sInitial = Device.browser.msie ? "0% 0%" : "initial",
			// BCP: 1970042795 - There is no "auto" value for FireFox
			sAuto = Device.browser.firefox ? "initial" : "auto",
			aTestInputValues = ["50% 50%", "10px 20px", sInitial, sAuto, "cover", "contain", "50px;5px solid red", '50px" onerror='],
			aExpOutputValues = ["50% 50%", "10px 20px", sInitial, sAuto, "cover", "contain", "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		aTestInputValues.forEach(function(sTestValue, iIndex) {
			oImage.setBackgroundSize(sTestValue);
			oImage.rerender();

			// Assert
			var oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundSize, aExpOutputValues[iIndex], "correct property value");
		});

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundRepeat value", function(assert) {
		// Arrange
		var oImage = createImage({
				mode: "Background"
			}),
			// BCP: 1970042795 - "initial" value for IE is "repeat"
			sInitial = Device.browser.msie ? "repeat" : "initial",
			aTestInputValues = ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round", sInitial, "initial;5px solid red", 'initial" onerror='],
			aExpOutputValues = ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round", sInitial, "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		aTestInputValues.forEach(function(sTestValue, iIndex) {
			oImage.setBackgroundRepeat(sTestValue);
			oImage.rerender();

			// Assert
			var oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundRepeat, aExpOutputValues[iIndex], "correct property value");
		});

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with detailBox", function(assert) {
		// Arrange
		var oImage = createImage();

		oImage.setDetailBox(new LightBox());

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var oInnerImg = oImage.$("inner")[0];
		assert.ok(oInnerImg.id, "Internal image has an id.");
		assert.equal(oImage.getFocusDomRef(), oInnerImg, "FocusDomRef is correct");

		// Clean up
		oImage.destroy();
	});

	QUnit.module("Rendering decorative image");

	QUnit.test("Alt text and tooltip", function(assert) {
		// Arrange
		var oImage = createImage({
			tooltip: sTooltip,
			alt: sAlt
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// read alt attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("alt"), "", "alt text of oImage should be an empty string because the image is decorative");

		// read title attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("title"), sTooltip, "tooltip text should be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Alt text and tooltip when empty", function(assert) {
		// Arrange
		var oImage = createImage({
			decorative: true
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.equal(document.getElementById(sControlId).getAttribute("alt"), "", "alt attribute of oImage should be an empty string because the image is decorative");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Decorative Image ARIA", function(assert) {
		var oImage = createImage({
			alt: "abcd"
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $oImage = oImage.$();
		assert.equal($oImage.attr("role"), "presentation", "role is set to presentation");
		assert.equal($oImage.attr("aria-hidden"), "true", "aria-hidden is set to true");
		assert.ok(!$oImage.attr("alt"), "alt is kept empty");
		assert.ok(!$oImage.attr("title"), "title isn't set when no tooltip is provided");

		oImage.setTooltip(sTooltip);
		Core.applyChanges();
		assert.equal(oImage.$().attr("title"),sTooltip, "title is updated with tooltip after it's set");

		// Clean up
		oImage.destroy();
	});


	QUnit.module("Rendering non decorative image");

	QUnit.test("Alt text and tooltip", function(assert) {
		// Arrange
		var oImage = createImage({
			decorative: false,
			tooltip: sTooltip,
			alt: sAlt
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// read alt attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("alt"), sAlt, "alt text of oImage should be rendered");

		// read title attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("title"), sTooltip, "tooltip text should be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Alt text and tooltip when both are empty", function(assert) {
		// Arrange
		var oImage = createImage({
			decorative: false
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.equal(document.getElementById(sControlId).getAttribute("alt"), null, "alt attribute of oImage should NOT be rendered");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Alt text and tooltip when one of them is empty", function(assert) {
		// Arrange
		var oImage = createImage({
			decorative: false,
			tooltip: sTooltip
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.equal(jQuery("#" + sControlId).attr("alt"), sTooltip, "alt text of oImage should have the tooltip when alt is not set, but tooltip is");

		oImage.setAlt(sAlt);
		oImage.setTooltip("");
		Core.applyChanges();

		assert.equal(jQuery("#" + sControlId).attr("alt"), sAlt, "alt text of oImage should be rendered");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Non decorative Image ARIA", function(assert) {
		var oImage = createImage({
			decorative: false,
			tooltip: sTooltip,
			alt: sAlt
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $oImage = oImage.$();
		assert.equal($oImage.attr("alt"), sAlt, "alt is rendered");
		assert.equal($oImage.attr("aria-label"), sAlt, "aria-label is rendered");
		assert.equal($oImage.attr("title"), sTooltip, "title is rendered");
		assert.ok(!$oImage.attr("role"), "no role is output");
		assert.ok(!$oImage.attr("aria-hidden"), "no aria-hidden is output");

		// Clean up
		oImage.destroy();
	});


	QUnit.module("Mode property");

	QUnit.test("Default mode property", function(assert) {
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.equal(oImage.getMode(), ImageMode.Image, "The default mode is set to sap.m.ImageMode.Image");

		// Clean up
		oImage.destroy();
	});

	// BCP: 1880373683 - on zoom 150% img URL is appended with @2 for high density image
	QUnit.test("Image with mode sap.m.ImageMode.Background", function(assert) {
		var done = assert.async();
		var oImage = createImage({
			mode: ImageMode.Background
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		jQuery(oImage._oImage).on("load", function() {
			var $Image = oImage.$(),
					sBackgroundImage = $Image.css("background-image");

			assert.equal(sBackgroundImage.indexOf("url("), 0, "The background-image CSS style starts with 'url('");
			assert.equal(sBackgroundImage.charAt(sBackgroundImage.length - 1), ")", "The background-image CSS style ends with ')'");
			assert.ok(sBackgroundImage.substring(4, sBackgroundImage.length - 1).indexOf("images/SAPLogo.jpg") !== -1, "The background-image CSS style has the right path");
			assert.equal($Image.css("background-size"), "cover", "backgroundSize property is set by default to 'cover' and output to the dom CSS style");
			assert.equal($Image.css("background-repeat"), "no-repeat", "backgroundRepeat property is set by default to 'no-repeat' and output to the dom CSS style");
			oImage.destroy();
			assert.equal(oImage._oImage, null, "internal image instance is also set to null");
			done();
		});

	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oImage = new Image();
		},
		afterEach: function () {
			this.oImage.destroy();
		}
	});

	QUnit.test("detailBox", 7, function (oAssert) {
		// Arrange
		var oLightBox = new LightBox(),
			fnDone = oAssert.async();

		// Act
		this.oImage.setDetailBox(oLightBox);

		// Assert
		oAssert.strictEqual(this.oImage.getDetailBox(), oLightBox, "Returned aggregation should be the same object");
		oAssert.ok(this.oImage._fnLightBoxOpen, "Internal method for opening the LightBox should be available");
		oAssert.ok(this.oImage.hasListeners("press"), "There should be a press event attached to the control");

		// Arrange
		this.oImage.setDetailBox(undefined);

		// Assert
		oAssert.notOk(this.oImage.getDetailBox(), "No LightBox is returned");
		oAssert.notOk(this.oImage._fnLightBoxOpen, "No internal method for opening the LightBox should be assigned");
		oAssert.notOk(this.oImage.hasListeners("press"), "There should no press listeners");

		// Arrange
		this.oImage.attachPress(function () {
			// Assert
			oAssert.ok(true, "Press event also fired");
			fnDone();
		});
		this.oImage.setDetailBox(oLightBox);

		// Act
		this.oImage.firePress();

		// Cleanup
		oLightBox.destroy();
	});

	QUnit.test("detailBox lifecycle and events", function (oAssert) {
		// Arrange
		var oLightBoxA = new LightBox(),
			oLightBoxB = new LightBox(),
			oAttachPressSpy = sinon.spy(this.oImage, "attachPress"),
			oDetachPressSpy = sinon.spy(this.oImage, "detachPress");

		// Act - set LightBox
		this.oImage.setDetailBox(oLightBoxA);

		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with new LightBox
		oAttachPressSpy.reset();
		this.oImage.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Act - replace with the same LightBox
		oAttachPressSpy.reset();
		oDetachPressSpy.reset();
		this.oImage.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 0, "attachPress method should not be called");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with the same LightBox
		oDetachPressSpy.reset();
		this.oImage.setDetailBox(undefined);

		// Assert
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Cleanup
		oLightBoxA.destroy();
		oLightBoxB.destroy();
		oAttachPressSpy.restore();
		oDetachPressSpy.restore();
	});

	QUnit.test("detailBox and Image cloning of press event handler", function (assert) {
		// Arrange
		var oLightBox = new LightBox(),
			oImageClone;

		this.oImage.setDetailBox(oLightBox);

		// Act - clone the Image
		oImageClone = this.oImage.clone();

		// Assert
		assert.strictEqual(oImageClone.hasListeners("press"), true, "Press event listener is cloned");
		assert.notStrictEqual(this.oImage.mEventRegistry.press[0].oListener,
				oImageClone.mEventRegistry.press[0].oListener,
				"Press listener should not be a reference to the original listener");
	});

	QUnit.module("Associations");

	QUnit.test("ariaLabelledBy", function (assert) {
		var oSampleText = new Text("sampleText", {
			text: "Sample text"
		}), oAnotherText = new Text("anotherText", {
			text: "Another text"
		}), oLabelledImage = new Image("labelledImage", {
			decorative: false,
			ariaLabelledBy: [oSampleText, oAnotherText]
		});

		oLabelledImage.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.notOk(oLabelledImage.$().attr("aria-describedby"), "Image with only ariaLabelledBy association shouldn't have aria-describedby attribute");
		assert.strictEqual(oLabelledImage.$().attr("aria-labelledby"), "sampleText anotherText", "aria-labelledby association is set correctly");

		oLabelledImage.destroy();
		oSampleText.destroy();
		oAnotherText.destroy();
	});

	QUnit.test("ariaDescribedBy", function (assert) {
		var oSampleText = new Text("sampleText", {
			text: "Sample text"
		}), oAnotherText = new Text("anotherText", {
			text: "Another text"
		}), oDescribedImage = new Image("describedImage", {
			decorative: false,
			ariaDescribedBy: [oSampleText, oAnotherText]
		});

		oDescribedImage.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.notOk(oDescribedImage.$().attr("aria-labelledby"), "Image with only ariaDescribedBy association shouldn't have aria-labelledby attribute");
		assert.strictEqual(oDescribedImage.$().attr("aria-describedby"), "sampleText anotherText", "aria-describedby association is set correctly");

		oDescribedImage.destroy();
		oSampleText.destroy();
		oAnotherText.destroy();
	});


	QUnit.module("Dimensions");

	QUnit.test("Default Offset Dimensions", function(assert) {
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// test the initial dimensions
		var oDomRef = document.getElementById(sControlId);
		assert.equal(oDomRef.offsetWidth, parseInt(oImage.getWidth()), "oImage.offsetWidth should equal " + parseInt(oImage.getWidth()));
		assert.equal(oDomRef.offsetHeight, parseInt(oImage.getHeight()), "oImage.offsetHeight should equal " + parseInt(oImage.getHeight()));

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Original Width", function(assert) {
		var done = assert.async();
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// test original width
		oImage.setWidth("");
		oImage.setHeight("");
		Core.applyChanges();

		setTimeout(function() {
			var oDomRef = window.document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 150, "oImage.offsetWidth should equal 150");
			assert.equal(oDomRef.offsetHeight, 74, "oImage.offsetHeight should equal 74");

			// Clean up
			oImage.destroy();
			done();
		}, 100);
	});

	QUnit.test("Dimension Changes", function(assert) {
		var done = assert.async();
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// test changed dimensions
		oImage.setWidth("292px");
		oImage.setHeight("292px");
		Core.applyChanges();

		// Assert
		setTimeout(function() {
			var oDomRef = document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 292, "oImage.offsetWidth should equal 292");
			assert.equal(oDomRef.offsetHeight, 292, "oImage.offsetHeight should equal 292");

			// Clean up
			oImage.destroy();
			done();
		}, 1000);
	});

	QUnit.test("Aspect Ratio", function(assert) {
		var done = assert.async();
		var oImage = createImage();

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// test aspect ratio after changed dimensions
		oImage.setWidth("300px");
		oImage.setHeight("");
		Core.applyChanges();

		setTimeout(function() {
			var oDomRef = window.document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 300, "oImage.offsetWidth should equal 300");
			assert.equal(oDomRef.offsetHeight, 148, "oImage.offsetHeight should equal 148");

			// Clean up
			oImage.destroy();
			done();
		}, 100);
	});


	QUnit.module("Density Aware");

	if (window.devicePixelRatio > 1) {
		QUnit.test("Density Aware default value (false)", function(assert) {
			var done = assert.async();
			var oImage = createImage({
				width: "",
				height: ""
			});

			// System under test
			oImage.placeAt("qunit-fixture");
			Core.applyChanges();

			setTimeout(function() {
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc, "oImage is NOT density aware, it loads the default image.");

				var oDomRef = document.getElementById(sControlId);

				assert.equal(oDomRef.offsetWidth, 150, "density perfect image also has the default size");
				assert.equal(oDomRef.offsetHeight, 74, "density perfect image also has the default size");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});

		QUnit.test("Density Aware set to true", function(assert) {
			var done = assert.async();
			var oImage = createImage({
				densityAware: true,
				width: "",
				height: ""
			});

			// System under test
			oImage.placeAt("qunit-fixture");
			Core.applyChanges();

			setTimeout(function() {
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc2, "oImage is density aware, so it loads the density perfect image.");

				var oDomRef = document.getElementById(sControlId);

				assert.equal(oDomRef.offsetWidth, 150, "default image has the default size");
				assert.equal(oDomRef.offsetHeight, 74, "default image has the default size");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});

		QUnit.test("Loading default image when high resolution image not available", function(assert) {
			var done = assert.async();
			var oImage = createImage({
				densityAware: true,
				src: sSrc3
			});

			// System under test
			oImage.placeAt("qunit-fixture");
			Core.applyChanges();

			setTimeout(function() {
				var oDomRef = document.getElementById(sControlId);
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc3, "default image should be loaded because the high resolution version isn't available");
				assert.equal(oDomRef.naturalWidth === 100, true, "default image loaded successfully");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});
	}

	QUnit.test("Image with density 1.5, source handling after rerendering", function(assert) {
		var done = assert.async();
		var oSandbox = sinon.sandbox.create();
		oSandbox.stub(Image, "_currentDevicePixelRatio", 1.5);

		var oImage = createImage({ densityAware: true });

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		oImage.$().on("load", function() {
			assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is taken");
			oImage.rerender();
			oImage.$().on("load", function() {
				assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is still taken");
				oImage.destroy();
				// Restore the stubbed property in the callback
				oSandbox.restore();
				done();
			});
		});
	});


	QUnit.module("Src and ActiveSrc properties");

	if (window.devicePixelRatio === 1) {
		QUnit.test("Active Source Changed when pressed", function(assert) {
			var done = assert.async();
			var oImage = createImage({
				src: sSrcAction,
				activeSrc: sSrcActionPressed,
				alt: sAlt
			});

			// System under test
			oImage.placeAt("qunit-fixture");
			Core.applyChanges();

			var $oImage = jQuery("#" + sControlId);

			oImage.ontouchstart({
				targetTouches: [{}],
				preventDefault: function() {},
				srcControl: oImage
			});

			setTimeout(function() {
				assert.equal($oImage.attr("src"), sSrcActionPressed);

				oImage.ontouchend({
					targetTouches: []
				});

				setTimeout(function() {
					assert.equal($oImage.attr("src"), sSrcAction);
					// Clean up
					oImage.destroy();
					done();
				}, 50);
			}, 50);
		});
	}

	QUnit.test("Image with valid src", function(assert) {
		var done = assert.async();

		var oLoadSpy = sinon.spy(function() {
				var $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be visible");
				assert.equal(oErrorSpy.callCount, 0, "Error handler isn't called");

				oImage.destroy();
				done();
			}),
			oErrorSpy = sinon.spy();

		var oImage = createImage({
			src: sSrcAction,
			load: oLoadSpy,
			error: oErrorSpy
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Image with Invalid src and src change", function(assert) {
		var done = assert.async();
		var oLoadSpy = sinon.spy(function() {
				var $oImage = jQuery("#" + sControlId);
				assert.equal($oImage.css("visibility"), "visible", "Image with valid src should be set back to visible");
				assert.equal(oErrorSpy.callCount, 1, "error handler isn't called again");

				oImage.destroy();
				done();
			}),
			oErrorSpy = sinon.spy(function() {
				assert.equal(oLoadSpy.callCount, 0 ,"load handler shouldn't be called");

				var $oImage = jQuery("#" + sControlId);
				assert.equal($oImage.css("visibility"), "visible", "Image with invalid src should be visible to show the alt text");

				oImage.setSrc(sSrcAction);
			});

		var oImage = createImage({
			decorative: false,
			alt: "invalid picture",
			src: "invalid_src.png",
			width: "48px",
			height: "48px",
			load: oLoadSpy,
			error: oErrorSpy
		});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Image with invalid src, no alt text and decorative mode - true", 2, function(assert) {
		// Arrange
		var fnDone = assert.async(),
				oErrorSpy = sinon.spy(function() {
					// Assert
					assert.strictEqual(oErrorSpy.callCount, 1, "Error spy called once");
					assert.ok(oImage.$().hasClass("sapMNoImg"),
							"'sapMNoImg' class should not be removed from the control");

					// Cleanup
					oImage.destroy();
					fnDone();
				}),
				oImage = createImage({
					src: "invalid_src.png",
					error: oErrorSpy
				});

		// Act
		oImage.placeAt("qunit-fixture");
	});

	QUnit.module("Tabindex");

	QUnit.test("Existence of attribute tabindex", function(assert) {
		var fn1 = function() {},
			fn2 = function() {},
			oImage = createImage({
				press: fn1
			});

		// System under test
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		var $Image = oImage.$();
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.attachPress(fn2);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn1);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn2);
		assert.strictEqual($Image.attr("tabindex"), undefined, "no tabindex is output");
		assert.equal($Image.attr("role"), "presentation", "role is set to presentation");

		oImage.attachPress(fn2);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.setDecorative(false);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn2);
		assert.strictEqual($Image.attr("tabindex"), undefined, "no tabindex is output");
		assert.ok(!$Image.attr("role"), "role is removed");

		//Clean up
		oImage.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oImage = new Image({alt: "Alt", tooltip: "Tooltip"});
		assert.ok(!!oImage.getAccessibilityInfo, "Image has a getAccessibilityInfo function");
		var oInfo = oImage.getAccessibilityInfo();
		assert.ok(!oInfo, "getAccessibilityInfo returns no info object in case of decorative images");
		oImage.setDecorative(false);
		oInfo = oImage.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "img", "AriaRole");
		assert.strictEqual(oInfo.type, Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_IMAGE"), "Type");
		assert.strictEqual(oInfo.description, "Alt", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.ok(oInfo.enabled === undefined || oInfo.enabled === null, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oImage.setAlt("");
		oImage.attachPress(function(){});
		oInfo = oImage.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		oImage.destroy();
	});

	QUnit.module("Bug fixes");

	QUnit.test("Change image src in case detailBox is present", function(assert){
		var oImage = createImage();
		var oLightBox = new LightBox();

		// Arrange
		oImage.setDetailBox(oLightBox);
		oImage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oImage._getDomImg().attr("src"), sSrc, "Image src attribute is properly set");

		// Act
		oImage.setSrc(sSrc3);

		// Assert
		assert.ok(oImage._getDomImg().attr("src"), sSrc3, "Image src attribute was properly changed");

		oImage.destroy();
	});

	QUnit.test("Image with valid src and default densityAware", function(assert) {
		var done = assert.async();
		var oLoadSpy = sinon.spy(function() {
				var $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be visible");
				assert.equal(oErrorSpy.callCount, 0, "Error handler isn't called");

				oImage.destroy();
				done();
			}),
			oErrorSpy = sinon.spy();

		var oImage = new Image({
			src: sSrcAction,
			load: oLoadSpy,
			error: oErrorSpy
		});

		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Image with Invalid src and src change under default densityAware", function(assert) {
		var done = assert.async();
		var oLoadSpy = sinon.spy(function() {
				var $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be set back to visible");
				assert.equal(oErrorSpy.callCount, 1, "error handler isn't called again");

				oImage.destroy();
				done();
			}),
			oErrorSpy = sinon.spy(function() {
				assert.equal(oLoadSpy.callCount, 0 ,"load handler shouldn't be called");
				var $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with invalid src should be visible to show the alt text");

				oImage.setSrc(sSrcAction);
			});

		var oImage = new Image({
			decorative: false,
			alt: "invalid picture",
			src: "invalid_src.png",
			width: "48px",
			height: "48px",
			load: oLoadSpy,
			error: oErrorSpy
		});

		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Image with density 1.5, source handling after rerendering", function(assert) {
		var done = assert.async();
		var oSandbox = sinon.sandbox.create(),
			oLoadSpy = sinon.spy(function() {
				assert.equal(oErrorSpy.callCount, 0, "error event handler shouldn't be called");
			}),
			oErrorSpy = sinon.spy();

		oSandbox.stub(Image, "_currentDevicePixelRatio", 1.5);

		var oImage = new Image({
			src: sSrc,
			load: oLoadSpy,
			densityAware: true
		});

		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
		oImage.$().on("load", function() {
			assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is taken");
			assert.equal(oLoadSpy.callCount, 1, "load event handler is called");
			oImage.rerender();
			oImage.$().on("load", function() {
				assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is still taken");
				assert.equal(oLoadSpy.callCount, 2, "load event handler is called again");
				oImage.destroy();
				// Restore the stubbed property in the callback
				oSandbox.restore();
				done();
			});
		});
	});

	QUnit.test("Invalid image src in case detailBox is present", function(assert){
		// Arrange
		var fnDone = assert.async(),
			oErrorSpy = sinon.spy(function() {
				// Assert
				assert.strictEqual(oErrorSpy.callCount, 1, "Error spy called once");

				// Cleanup
				oImage.destroy();
				fnDone();
			}),
			oImage = createImage({
				src: "invalid_src.png",
				error: oErrorSpy
			});

		// Act
		oImage.setDetailBox(new LightBox());
		oImage.placeAt("qunit-fixture");
	});

	QUnit.test("onsapspace event should be prevented - SPACE", function(assert){
		//setup
		var oImage = createImage({
				src: sSrc
			}),
			oEvent = {
				which: KeyCodes.SPACE,
				preventDefault: function () {}
			},
			oSpy = this.spy(oEvent, "preventDefault");

		Core.applyChanges();

		//act
		oImage.onsapspace(oEvent);

		//assert
		assert.ok(oSpy.calledOnce, "preventDefault is called on SPACE key");

		oImage.destroy();
	});

	// This unit test is meant to cover the current logic of
	// Image control where it fires load event after each
	// re-rendering cycle
	QUnit.test("Load is called on rerender", function (assert) {
		var done = assert.async();
		var callCount = 0;
		var callLimit = 10;

		assert.expect(1);

		//setup
		var oImage = createImage({
			src: sSrc,
			load: function () {
				if (callCount < callLimit) {
					callCount++;
					oImage.invalidate();
				} else {
					assert.ok(true, 'Load after rerendering called ' + callCount + ' times');
					done();
					oImage.destroy();
				}
			}
		});

		oImage.placeAt("qunit-fixture");
		Core.applyChanges();
	});
});