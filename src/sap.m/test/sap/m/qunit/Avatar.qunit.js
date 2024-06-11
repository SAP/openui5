/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/URI",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Avatar",
	"sap/m/ImageCustomData",
	"sap/m/LightBox",
	"sap/m/library",
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/InvisibleText"
], function(
	Library,
	coreLibrary,
	Device,
	KeyCodes,
	URI,
	qutils,
	Avatar,
	ImageCustomData,
	LightBox,
	library,
	Log,
	extend,
	nextUIUpdate,
	InvisibleText
) {
	"use strict";

	var sControlId = "AvatarId",
		sImagePath = "test-resources/sap/f/images/Woman_avatar_01.png",
		sIconPath = "sap-icon://lab",
		sPreAvatarSize = "Avatar's size is ",
		sPreAvatarShape = "Avatar's shape is ",
		sPreAvatarType = "Avatar's type is ",
		sDefaultIconRendered = "Avatar is a default icon",
		sPreAvatarFitType = "Avatar's image fit type is ",
		// shortcut for sap.m.AvatarColor
		AvatarColor = library.AvatarColor,
		ValueState = coreLibrary.ValueState;

	function createAvatar(oProps, sId) {
		var oAvatarProps = {};
		sId = sId || sControlId;

		if (oProps) {
			extend(oAvatarProps, oProps);
		}

		return new Avatar(sId, oAvatarProps);
	}

	async function setupFunction() {
		this.oAvatar = createAvatar();
		this.oAvatar.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	function teardownFunction() {
		this.oAvatar.destroy();
	}

	/* tests */
	QUnit.module("Basic rendering", {
		beforeEach: async function () {
			this.oAvatar = createAvatar({press: function () {}});
			this.oAvatar.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with 'enable' set to 'false' has the proper attr and class", async function (assert) {
		// act
		this.oAvatar.setEnabled(false);
		await nextUIUpdate();

		// assert
		assert.ok(this.oAvatar.getDomRef().className.includes("sapMAvatarDisabled"), "Avatar has the disabled CSS class");
		assert.strictEqual(this.oAvatar.getDomRef().getAttribute("disabled"), "disabled", "Avatar has the 'disabled' DOM attribute");
	});


	QUnit.test("Avatar with press event only", function (assert) {
		var $oAvatar = this.oAvatar.$();

		assert.ok(document.getElementById(sControlId), "Avatar is rendered in the DOM");
		assert.ok($oAvatar.hasClass("sapFAvatar"), "Avatar is rendered with the Avatar class.");
		assert.ok($oAvatar.hasClass("sapFAvatarS"), sPreAvatarSize + "S");
		assert.ok($oAvatar.hasClass("sapFAvatarCircle"), sPreAvatarShape +  "Circle");
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sPreAvatarType + "Icon");
		assert.ok($oAvatar.hasClass("sapMPointer"), "The cursor becomes pointer when hovering over the avatar");
		assert.ok(($oAvatar !== undefined) && ($oAvatar != null), "Avatar should not be null");
		assert.strictEqual($oAvatar.attr("role"), "button", "Aria role should be 'button'");
	});

	QUnit.test("Focus have 1px outline-offset", function (assert) {
		// Arrange
		var $oAvatar = this.oAvatar.$(),
			sOffset;

		// Act
		$oAvatar.trigger("focus");
		sOffset = $oAvatar.css("outline-offset");

		// Assert
		assert.ok(sOffset, "Outline-offset is set");
	});

	QUnit.module("Rendering different sizes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with displaySize set to 'XS'", async function (assert) {
		this.oAvatar.setDisplaySize("XS");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarXS"), sPreAvatarSize + "XS");
	});

	QUnit.test("Avatar with displaySize set to 'S'", async function (assert) {
		this.oAvatar.setDisplaySize("S");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarS"), sPreAvatarSize + "S");
	});

	QUnit.test("Avatar with displaySize set to 'M'", async function (assert) {
		this.oAvatar.setDisplaySize("M");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarM"), sPreAvatarSize + "M");
	});

	QUnit.test("Avatar with displaySize set to 'L'", async function (assert) {
		this.oAvatar.setDisplaySize("L");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarL"), sPreAvatarSize + "L");
	});

	QUnit.test("Avatar with displaySize set to 'XL'", async function (assert) {
		this.oAvatar.setDisplaySize("XL");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarXL"), sPreAvatarSize + "XL");
	});

	QUnit.test("Avatar with displaySize set to 'Custom'", async function (assert) {
		this.oAvatar.setDisplaySize("Custom");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarCustom"), sPreAvatarSize + "Custom");
	});

	QUnit.module("Rendering different shapes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with displayShape set to 'Circle'", async function (assert) {
		this.oAvatar.setDisplayShape("Circle");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarCircle"), sPreAvatarShape + "Circle");
	});

	QUnit.test("Avatar with displayShape set to 'Square'", async function (assert) {
		this.oAvatar.setDisplayShape("Square");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarSquare"), sPreAvatarShape + "Square");
	});

	QUnit.module("Rendering fallback icon", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with valid icon src should not use default icon", async function (assert) {
		this.oAvatar.setSrc("sap-icon://touch");
		await nextUIUpdate();

		assert.notOk(this.oAvatar._bIsDefaultIcon, "Icon source is valid");
	});

	QUnit.test("Avatar with invalid icon src should use default icon", async function (assert) {
		this.oAvatar.setSrc("sap-icon://qwertyu");
		await nextUIUpdate();

		assert.ok(this.oAvatar._bIsDefaultIcon, "Icon source is invalid and fallback icon will be shown");
	});

	QUnit.test("Fallback type should be always restored according to current property values", async function (assert) {
		//Arrange
		this.oAvatar.setSrc("https://example.org/some-image-src.jpg");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oAvatar._getImageFallbackType(), "Icon",
			"Icon is the fallback type when the Avatar has src and no initials");

		// Act
		this.oAvatar.setSrc("");
		this.oAvatar.setInitials("IB");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oAvatar._getImageFallbackType(), "Initials",
			"Initials is returned as fallback type when the src of the Avatar is removed and initials are set");
	});

	QUnit.module("Rendering different types", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with src leading to an icon", async function (assert) {
		this.oAvatar.setSrc(sIconPath);
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sPreAvatarType + "Icon");
	});

	QUnit.test("Avatar with src leading to an image", async function (assert) {
		this.oAvatar.setSrc(sImagePath);
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$(),
			sBackgroundColorValue = $oAvatar.css("background-color"),
			bIsTransparent = sBackgroundColorValue === "transparent" ||
					sBackgroundColorValue === "rgba(0, 0, 0, 0)";

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarImage"), sPreAvatarType + "Image");
		assert.ok(bIsTransparent, "Background is transparent");
	});

	QUnit.test("Avatar with src leading to an image has correct css style", async function (assert) {
		var sExpectedOutputImage = 'url("' + sImagePath + '")';
		this.oAvatar.setSrc(sImagePath);
		await nextUIUpdate();

		var $oAvatarImageHolder = this.oAvatar.$().find('.sapFAvatarImageHolder').get(0);
		assert.strictEqual($oAvatarImageHolder.style.backgroundImage, sExpectedOutputImage, "correct style value");
	});

	QUnit.test("Avatar with sync changed src property to invalid/valid has correct css style", async function (assert) {
		var sExpectedOutputImage = 'url("' + sImagePath + '")',
			sWrongPath = "wrong-image-path",
			fnDone = assert.async(),
			that = this,
			$oAvatarImageHolder,
			oStub = this.stub(this.oAvatar, "_onImageError").callsFake(function(sSrc) {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageError(sSrc);
				$oAvatarImageHolder = that.oAvatar.$().find('.sapFAvatarImageHolder').get(0);
				assert.strictEqual($oAvatarImageHolder.style.backgroundImage, sExpectedOutputImage, "correct style value");
				assert.ok(that.oAvatar.$().hasClass("sapFAvatarImage"), "Avatar has image class");

				fnDone();
			});

		// Act
		this.oAvatar.setSrc(sWrongPath);
		this.oAvatar.setSrc(sImagePath);
		await nextUIUpdate();
	});

	QUnit.test("Avatar with initials in valid format", async function (assert) {
		this.oAvatar.setInitials("SR");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarInitials"), sPreAvatarType + "Initials");
	});

	QUnit.test("Avatar with initials consisting of four letters", async function (assert) {
		this.oAvatar.setInitials("SRLA");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of no letters", async function (assert) {
		this.oAvatar.setInitials("");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of non-latin letters", async function (assert) {
		this.oAvatar.setInitials("ЯЪ");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with three overflowing initials", async function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("XL");
		await nextUIUpdate();

		assert.ok(this.oAvatar.getDomRef().className.includes("sapFAvatarIcon"), "When initials inside sap.m.Avatar are overflwing, default icon should be shown after redering");
	});

	QUnit.test("Avatar with three overflowing initials", async function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("XL");

		await nextUIUpdate();

		this.oAvatar.onThemeChanged();

		assert.ok(this.oAvatar.getDomRef().className.includes("sapFAvatarIcon"), "When initials inside sap.m.Avatar are overflwing, default icon should be shown after theme is changed");
	});

	QUnit.test("Avatar with three initials, having the same width as the control", async function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("S");
		await nextUIUpdate();

		assert.ok(this.oAvatar.getDomRef().className.includes("sapFAvatarIcon"), "When the initials holder inside sap.m.Avatar has the same width as the control, default icon should be shown after redering");
	});

	QUnit.test("Avatar with three initials, having the same width as the control", async function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("S");

		await nextUIUpdate();

		this.oAvatar.onThemeChanged();

		assert.ok(this.oAvatar.getDomRef().className.includes("sapFAvatarIcon"), "When the initials holder inside sap.m.Avatar has the same width as the control, default icon should be shown after theme is changed");
	});

	QUnit.test("Avatar with initials consisting of accented characters", async function (assert) {
		this.oAvatar.setInitials("ÌÒ");
		await nextUIUpdate();

		assert.ok(this.oAvatar.getDomRef().className.includes("sapFAvatarInitials"), sPreAvatarType + "Initials");
	});

	QUnit.module("Rendering different fit types", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with imageFitType set to 'Cover'", async function (assert) {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Cover");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.find(".sapFAvatarImageHolder").hasClass("sapFAvatarImageCover"), sPreAvatarFitType + "Cover");
	});

	QUnit.test("Avatar with imageFitType set to 'Contain'", async function (assert) {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Contain");
		await nextUIUpdate();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.find(".sapFAvatarImageHolder").hasClass("sapFAvatarImageContain"), sPreAvatarFitType + "Contain");
	});

	QUnit.test("Show fallback initials when image source is invalid and initials are set and valid", async function (assert) {
		//Arrange
		var done = assert.async(),
			$oAvatar;

		this.stub(this.oAvatar, "_onImageError").callsFake(function() {
			//Assert
			assert.ok(true, "When image inside sap.m.Avatar is not loaded, error callback launches");
			done();
		});

		this.oAvatar.setInitials("PB");
		assert.expect(2);

		//Act
		this.oAvatar.setSrc("_");
		await nextUIUpdate();

		//Assert
		$oAvatar = this.oAvatar.$();
		assert.equal($oAvatar.find(".sapFAvatarInitialsHolder").text(),"PB", "When type of sap.m.Avatar is 'Image'" +
		 " and initials are set we load fallback initials container");
	});

	QUnit.test("Add initials class when source is invalid and initials are set", async function (assert) {
		// Arrange
		var $oAvatar,
			done = assert.async(),
			that = this,
			sWrongPath = "_",
			oStub = this.stub(this.oAvatar, "_onImageError").callsFake(function(sSrc) {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageError(sSrc);
				$oAvatar = that.oAvatar.$();

				//Assert
				assert.notOk($oAvatar.hasClass("sapFAvatarImage"),
					"When image src is not correct, image class is removed");
				assert.ok($oAvatar.hasClass("sapFAvatarInitials"),
					"When image src is not correct, initials class is added");

				done();
			});

		assert.expect(2);

		//Act
		this.oAvatar.setInitials("PB");
		this.oAvatar.setSrc(sWrongPath);
		await nextUIUpdate();
	});

	QUnit.test("Show fallback default Icon when image source is invalid and initials are not set", async function (assert) {
		//Act
		this.oAvatar.setSrc("_");
		await nextUIUpdate();

		//Assert
		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.find(".sapUiIcon") !== undefined, "When type of sap.m.Avatar is 'Image'" +
		"we load fallback icon container");

	});

	QUnit.test("Show user set fallback Icon when image source is invalid and initials are not set", function (assert) {
		var sFallbackIcon = "sap-icon://accelerated";

		//Act
		this.oAvatar.setSrc("_");
		this.oAvatar.setFallbackIcon(sFallbackIcon);

		//Assert
		assert.strictEqual(this.oAvatar._getDefaultIconPath("Circle"), sFallbackIcon, "Fallback icon path is correct");
		assert.strictEqual(this.oAvatar._getDefaultIconPath("Square"), sFallbackIcon, "Fallback icon path is correct");

		//Act
		this.oAvatar.setFallbackIcon("wrongIcon");

		//Assert
		assert.strictEqual(this.oAvatar._getDefaultIconPath("Circle"), Avatar.DEFAULT_CIRCLE_PLACEHOLDER, "Fallback icon is set to person default");
		assert.strictEqual(this.oAvatar._getDefaultIconPath("Square"), Avatar.DEFAULT_SQUARE_PLACEHOLDER, "Fallback icon is set to product default");
	});

	QUnit.test("Add icon class when source is invalid and initials are not set", async function (assert) {
		// Arrange
		var $oAvatar,
			done = assert.async(),
			that = this,
			sWrongPath = "_",
			oStub = this.stub(this.oAvatar, "_onImageError").callsFake(function(sSrc) {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageError(sSrc);
				$oAvatar = that.oAvatar.$();

				//Assert
				assert.notOk($oAvatar.hasClass("sapFAvatarImage"),
					"When image src is not correct, image class is removed");
				assert.ok($oAvatar.hasClass("sapFAvatarIcon"),
					"When image src is not correct and initials are not set, icon class is added");

				done();
			});

		assert.expect(2);

		//Act
		this.oAvatar.setSrc(sWrongPath);
		await nextUIUpdate();
	});

	QUnit.test("Fallback content is loaded, but hidden when sap.m.Avatar type Image has valid image source", async function (assert) {
		// Assert
		assert.notEqual(this.oAvatar.$().find(".sapUiIcon").css('display'), 'none', "Hiding fallback content not valid");

		// Act
		this.oAvatar.setSrc(sImagePath);
		await nextUIUpdate();

		// Assert
		assert.equal(this.oAvatar.$().find(".sapUiIcon").css('display'), 'none', "Hiding fallback content valid");
	});

	QUnit.module("Rendering with sap.m.ImageCustomData", {
		beforeEach: async function () {
			this.oAvatar = createAvatar({
				src: sImagePath,
				customData: [
					new ImageCustomData({ paramName: "xcache" })
				]
			});

			this.oAvatar.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.oAvatar.destroy();
		}
	});

	QUnit.test("Avatar is rendered correctly with cache busting query parameter added to his source", function (assert) {
		// Assert
		var sAvatarUrl = this.oAvatar.$().find(".sapFAvatarImageHolder")[0].style.backgroundImage,
			sAvatarParamValue = sAvatarUrl.match(/xcache=(\d+)/)[1];

		assert.strictEqual(sAvatarParamValue, this.oAvatar._iCacheBustingValue.toString(), "Avatar is rendered with correct query parameter");
	});

	QUnit.test("Cache busting paramater value is not changed when Avatar gets invalidated ", async function (assert) {
		// Arrange
		var sAvatarUrl = this.oAvatar.$().find(".sapFAvatarImageHolder")[0].style.backgroundImage,
			sAvatarParamValue = sAvatarUrl.match(/xcache=(\d+)/)[1];

		// Act
		this.oAvatar.invalidate();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(sAvatarParamValue, this.oAvatar._iCacheBustingValue.toString(), "Avatar is rendered with correct query parameter");
	});

	QUnit.test("Avatar's internal preloaded Image has correct url when used in cache busting context", function (assert) {
		// Act
		var sAvatarUrl = this.oAvatar.$().find(".sapFAvatarImageHolder")[0].style.backgroundImage;

		// based on internal state re-run src validating function so that image is preloaded
		this.oAvatar._validateSrc(this.oAvatar._getAvatarSrc());


		if (this.oAvatar.preloadedImage) {
			// Assert
			assert.strictEqual(this.oAvatar.preloadedImage.src, sAvatarUrl.replace(/url\(\"(.*)\"\)/, "$1"), "Preloaded image has correct src");
		}
	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oAvatar = new Avatar();
		},
		afterEach: function () {
			this.oAvatar.destroy();
		}
	});

	QUnit.test("detailBox", function (oAssert) {
		// Assert
		oAssert.expect(7);

		// Arrange
		var oLightBox = new LightBox(),
			fnDone = oAssert.async();

		// Act
		this.oAvatar.setDetailBox(oLightBox);

		// Assert
		oAssert.strictEqual(this.oAvatar.getDetailBox(), oLightBox, "Returned aggregation should be the same object");
		oAssert.ok(this.oAvatar._fnLightBoxOpen, "Internal method for opening the LightBox should be available");
		oAssert.ok(this.oAvatar.hasListeners("press"), "There should be a press event attached to the control");

		// Arrange
		this.oAvatar.setDetailBox(undefined);

		// Assert
		oAssert.notOk(this.oAvatar.getDetailBox(), "No LightBox is returned");
		oAssert.notOk(this.oAvatar._fnLightBoxOpen, "No internal method for opening the LightBox should be assigned");
		oAssert.notOk(this.oAvatar.hasListeners("press"), "There should no press listeners");

		// Arrange
		this.oAvatar.attachPress(function () {
			// Assert
			oAssert.ok(true, "Press event also fired");
			fnDone();
		});
		this.oAvatar.setDetailBox(oLightBox);

		// Act
		this.oAvatar.firePress();

		// Cleanup
		oLightBox.destroy();
	});

	QUnit.test("detailBox lifecycle and events", function (oAssert) {
		// Arrange
		var oLightBoxA = new LightBox(),
			oLightBoxB = new LightBox(),
			oAttachPressSpy = this.spy(this.oAvatar, "attachPress"),
			oDetachPressSpy = this.spy(this.oAvatar, "detachPress");

		// Act - set LightBox
		this.oAvatar.setDetailBox(oLightBoxA);

		oAssert.strictEqual(this.oAvatar.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with new LightBox
		oAttachPressSpy.resetHistory();
		this.oAvatar.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oAvatar.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Act - replace with the same LightBox
		oAttachPressSpy.resetHistory();
		oDetachPressSpy.resetHistory();
		this.oAvatar.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oAvatar.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 0, "attachPress method should not be called");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with the same LightBox
		oDetachPressSpy.resetHistory();
		this.oAvatar.setDetailBox(undefined);

		// Assert
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Cleanup
		oLightBoxA.destroy();
		oLightBoxB.destroy();
	});

	QUnit.test("detailBox destroy", async function (oAssert) {
		// Assert
		oAssert.expect(9);

		// Arrange
		var oLightBox = new LightBox(),
			oNewLightBox = new LightBox();

		// Act
		this.oAvatar.setDetailBox(oLightBox);
		await nextUIUpdate();

		// Assert
		oAssert.strictEqual(this.oAvatar.getDetailBox(), oLightBox, "detailBox is set");
		oAssert.ok(this.oAvatar._fnLightBoxOpen, "Internal method for opening the LightBox should be available");
		oAssert.ok(this.oAvatar.hasListeners("press"), "There should be a press event attached to the control");

		// Act
		this.oAvatar.destroyDetailBox();
		await nextUIUpdate();

		// Assert
		oAssert.notOk(this.oAvatar.getDetailBox(), "No LightBox is returned");
		oAssert.notOk(this.oAvatar._fnLightBoxOpen, "No internal method for opening the LightBox should be assigned");
		oAssert.notOk(this.oAvatar.hasListeners("press"), "There should no press listeners");

		// Act
		this.oAvatar.setDetailBox(oNewLightBox);
		await nextUIUpdate();

		oAssert.strictEqual(this.oAvatar.getDetailBox(), oNewLightBox, "detailBox is set again");
		oAssert.ok(this.oAvatar._fnLightBoxOpen, "Internal method for opening the LightBox should be available again");
		oAssert.ok(this.oAvatar.hasListeners("press"), "There should be a press event attached to the control again");

		// Cleanup
		oLightBox.destroy();
	});

	QUnit.test("cloning of press event handler", function (assert) {
		// Arrange
		var oLightBox = new LightBox(),
			oAvatarClone;

		this.oAvatar.setDetailBox(oLightBox);

		// Act - clone the Avatar
		oAvatarClone = this.oAvatar.clone();

		// Assert
		assert.strictEqual(oAvatarClone.hasListeners("press"), true, "Press event listener is cloned");
		assert.notStrictEqual(this.oAvatar.mEventRegistry.press[0].oListener,
			oAvatarClone.mEventRegistry.press[0].oListener,
			"Press listener should not be a reference to the original listener");
	});

	QUnit.test("_icon", async function (assert) {
		this.oAvatar.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.ok(this.oAvatar.getAggregation("_icon"), "The '_icon' aggregation is created.");
		assert.strictEqual(this.oAvatar._icon, undefined, "The '_icon' is no longer stored as internal object.");
	});

	QUnit.module("Functionality", {
		beforeEach: async function () {
			this.oAvatar = createAvatar({ src: "/you/must/escape/single'quotes" });
			this.oAvatar.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: teardownFunction
	});

	QUnit.test(".sapMAvatarPressed class is added where applicable", async function (assert) {
		// Arrange
		var fnHandler = this.stub(),
		$oAvatar = this.oAvatar.$();
		this.oAvatar.attachPress(fnHandler);

		// Act
		this.oAvatar.setActive(true);
		await nextUIUpdate();

		// Assert
		assert.ok($oAvatar.hasClass('sapMAvatarPressed'), ".sapMAvatarPressed class is added to the Avatar");

		// Act
		this.oAvatar.setActive(false);
		await nextUIUpdate();

		// Assert
		assert.notOk($oAvatar.hasClass('sapMAvatarPressed'), ".sapMAvatarPressed class is removed from the Avatar");

		// Act - Remove the press handler
		this.oAvatar.detachPress(fnHandler);

		// Act
		this.oAvatar.setActive(true);
		await nextUIUpdate();

		// Assert
		assert.notOk($oAvatar.hasClass('sapMAvatarPressed'), ".sapMAvatarPressed class isn't added to the Avatar when there is no press handler");
	});

	QUnit.test("press isn't fired when 'enabled' is set to 'false'", function (assert) {
		// arrange
		var oSpy = this.spy(Avatar.prototype, "firePress");

		// act
		this.oAvatar.setEnabled(false);
		qutils.triggerKeyup(this.oAvatar, KeyCodes.SPACE);

		// assert
		assert.notOk(oSpy.called, "Press event isn't fired when the 'enabled' prop is set to 'false'");
	});

	QUnit.test("URL escaping", function (assert) {
		var $oAvatar = this.oAvatar.$();
		// If src is not escaped, the css value would be invalid and jQuery would return 'none'
		assert.notStrictEqual($oAvatar.find(".sapFAvatarImageHolder").css("background-image"), "none", "src is properly escaped");
	});

	QUnit.test("Avatar with border", async function (assert) {
		// Arrange
		var $oAvatar = this.oAvatar.$();

		// Assert
		assert.notOk($oAvatar.hasClass("sapFAvatarBorder"), "Avatar does not have 'sapFAvatarBorder' class when showBorder='fase'");

		// Act
		this.oAvatar.setShowBorder(true);
		await nextUIUpdate();

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarBorder"), "Avatar has 'sapFAvatarBorder' class when showBorder='true'");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oAvatar = createAvatar({ tooltip: "sampleTooltip" });
			this.oAvatar.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: teardownFunction
	});

	QUnit.test("Check if tooltip is present", function (assert) {
		var $oAvatar = this.oAvatar.$();
		assert.strictEqual($oAvatar.prop("title"), "sampleTooltip", "Tooltip is present");
	});

	QUnit.test("Check ARIA specific roles", async function (assert) {
		var $oAvatar = this.oAvatar.$(),
			sDefaultTooltip = Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP");

		assert.strictEqual($oAvatar.attr("role"), "img", "Aria role should be 'img'");
		assert.strictEqual($oAvatar.attr("aria-label"), "sampleTooltip", "Aria-label should be the custom 'sampleTooltip' text tooltip");

		//act
		this.oAvatar.setInitials("BP");
		await nextUIUpdate();
		$oAvatar = this.oAvatar.$();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), "sampleTooltip", "Aria-label should still be the custom 'sampleTooltip' text tooltip");

		//act
		this.oAvatar.setTooltip("");
		await nextUIUpdate();
		$oAvatar = this.oAvatar.$();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"),  sDefaultTooltip + " BP", "Aria-label should include the defined initials and the default 'Avatar' text if no tooltip is set");

		//act
		this.oAvatar.setInitials("");
		await nextUIUpdate();
		$oAvatar = this.oAvatar.$();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), sDefaultTooltip, "Aria-label should be the default 'Avatar' text");

		//act
		var fnHandler = this.stub();
		this.oAvatar.attachPress(fnHandler);

		//assert
		assert.strictEqual($oAvatar.attr("role"), "button", "Aria role should be 'button'");

		//act
		this.oAvatar.detachPress(fnHandler);

		//assert
		assert.strictEqual($oAvatar.attr("role"), "img", "Aria role should be 'img'");

		this.oAvatar.setDecorative(true);
		await nextUIUpdate();

		assert.strictEqual($oAvatar.attr("aria-hidden"), "true", "Aria-hidden should be set to default avatars");
		assert.strictEqual($oAvatar.attr("role"), "presentation", "Aria role should be 'img' on decorative avatars");
	});

	QUnit.test("Appearance of the aria-haspopup attribute", async function (assert) {
		var AriaHasPopup = coreLibrary.aria.HasPopup,
			oAvatarDomRef;

		// setup
		this.oAvatar.placeAt("qunit-fixture");
		await nextUIUpdate();
		oAvatarDomRef = this.oAvatar.getDomRef();

		// check initial aria-haspopup state
		assert.notOk(oAvatarDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute initially.");

		// act
		this.oAvatar.setAriaHasPopup(AriaHasPopup.Menu);
		await nextUIUpdate();

		// check if aria-haspopup appears
		assert.equal(oAvatarDomRef.getAttribute("aria-haspopup"), AriaHasPopup.Menu.toLowerCase(), "There is aria-haspopup attribute with proper value after the avatar property is being set to something different than None.");

		// act
		this.oAvatar.setAriaHasPopup(AriaHasPopup.None);
		await nextUIUpdate();

		// check if aria-haspopup disappears
		assert.notOk(oAvatarDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute after the avatar property is being set to None.");
	});

	QUnit.test("Aria-labelledby", async function(assert) {
		// Arrange
		var avatar = new Avatar({
			id: "avatarID",
			ariaLabelledBy: "id1"
		}),
			oAvatarDomRef,
			sInitialsAriaLabelledBy,
			sInitials;

		// Setup
		avatar.placeAt("qunit-fixture");
		await nextUIUpdate();
		oAvatarDomRef = avatar.getDomRef();

		//assert
		assert.strictEqual(oAvatarDomRef.getAttribute("aria-labelledby"), "id1", "Aria-labelledby is set correctly");

		// Act
		avatar.setInitials("BP");
		await nextUIUpdate();

		sInitialsAriaLabelledBy = avatar.sId + "-InvisibleText";

		// Assert
		assert.strictEqual(oAvatarDomRef.getAttribute("aria-labelledby"), "id1 " + sInitialsAriaLabelledBy, "Avatar`s initials are part of aria-labelledby");

		var sInvisibleMessage = document.getElementById(sInitialsAriaLabelledBy).innerText;
		sInitials = avatar.getInitials();

		// Assert
		assert.strictEqual(sInitials, sInvisibleMessage, "The initials are contained inside the InvisibleMessage.");

		// Cleanup
		avatar.destroy();
	});

	QUnit.module("Avatar backgroundColor API", {
		beforeEach: async function () {
			this.oAvatar = createAvatar({ tooltip: "sampleTooltip" });
			this.oAvatar.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: teardownFunction
	});

	QUnit.test("Check default backgroundColor property value", function (assert) {
		// Arrange
		var oAvatar = this.oAvatar,
			$oAvatar = oAvatar.$(),
			sDefaultColor = AvatarColor.Accent6;

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), sDefaultColor,
				"Avatar has the default backgroundProperty value.");
		assert.ok($oAvatar.hasClass("sapFAvatarColor" + sDefaultColor),
				"Avatar is with the default CSS class for " + sDefaultColor + " background color.");
	});

	QUnit.test("Iterate over all possible colors and set them", async function (assert) {
		// Arrange
		var oAvatar = this.oAvatar,
			$oAvatar = oAvatar.$(),
			sCurrentColor,
			aKeys = Object.keys(AvatarColor);

		// Iterating over all of the properties of AvatarColor enum,
		// without "Random".
		for (var i = 0; i < aKeys.length; i++) {
			sCurrentColor = aKeys[i];

			if (sCurrentColor === AvatarColor.Random) {
				continue;
			}

			// Act
			oAvatar.setBackgroundColor(sCurrentColor);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sCurrentColor,
					"Avatar has the correct backgroundProperty value " + sCurrentColor + ".");
			assert.ok($oAvatar.hasClass("sapFAvatarColor" + sCurrentColor),
					"Avatar is with the correct CSS class for " + sCurrentColor + " background color.");
		}
	});

	QUnit.test("Random color is not changed after re-rendering", async function (assert) {
		// Arrange
		var oAvatar = this.oAvatar,
			$oAvatar = oAvatar.$(),
			sActualBackgroundColor;

		// Act - Setting the background of the control to Random
		oAvatar.setBackgroundColor(AvatarColor.Random);
		await nextUIUpdate();

		sActualBackgroundColor = oAvatar._getActualBackgroundColor();

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarColor" + sActualBackgroundColor),
			"After setting the Avatar color to Random, its background is " + sActualBackgroundColor + ".");

		// Act - Re-rendering the control
		oAvatar.invalidate();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(sActualBackgroundColor, oAvatar._getActualBackgroundColor(),
			"After re-rendering the Avatar, its background is kept (" + sActualBackgroundColor + ").");
	});

	/* tests */
	QUnit.module("Avatar different badge configurations", {
		beforeEach: async function () {
			this.oAvatar = createAvatar();
			this.oAvatar.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: teardownFunction
	});

	QUnit.test("badgeValueState applies correct css classes to the Avatar", async function(assert) {
		//setup
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		await nextUIUpdate();

		//assert
		for (const val of Object.values(ValueState)) {

			this.oAvatar.setBadgeValueState(val);
			await nextUIUpdate();
			assert.ok(this.oAvatar.getDomRef().className.includes('sapFAvatar' + val), 'The avatar has the ' + val + ' class');

			for (const nestedVal of Object.values(ValueState)) {
				if (nestedVal !== val) {
					assert.notOk(this.oAvatar.getDomRef().className.includes('sapFAvatar' + nestedVal), "The avatar doesn't have the + " + nestedVal + " class");
				}
			}
		}
	});

	QUnit.test("Affordance is rendered when press event is attached", async function(assert) {
		//setup
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		await nextUIUpdate();

		//assert
		assert.equal(this.oAvatar._badgeRef != null, true, "Badge is attached to Avatar");
		assert.equal(this.oAvatar._badgeRef.getTooltip(),
			Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),
			"Badge Tooltip is predefined");
	});

	QUnit.test("Affordance is attached, even when press event is missing", async function(assert) {
		//setup
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		await nextUIUpdate();

		//assert
		assert.equal(this.oAvatar._badgeRef !== null, true, "Badge is attached to Avatar");
	});

	QUnit.test("Affordance with detailBox aggregation", async function(assert) {
		// Act
		this.oAvatar.setDetailBox(new LightBox());
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oAvatar._badgeRef, null, "Badge is not attached to Avatar with detailBox, if no image is set");

		// Act
		this.oAvatar.setSrc(sImagePath);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oAvatar._getBadge(), "Badge is  attached to Avatar with detailBox, if image is set");
	});

	QUnit.test("Affordance is attached, when details aggregation is presented", async function(assert) {
		// Act
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://edit");
		this.oAvatar.setBadgeTooltip("Edit custom");
		await nextUIUpdate();

		//assert
		assert.equal(this.oAvatar._badgeRef.getTooltip() != Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),
		true, "Badge tooltip is not predefined");

		//assert
		assert.equal(this.oAvatar._badgeRef.getTooltip() != this.oAvatar.getTooltip(),
			true, "Badge tooltip is not default one");
	});

	QUnit.test("Affordance is not presented with bulk data", async function(assert) {
		// Arrange
		var sWarnArgs = "No valid Icon URI source for badge affordance was provided";
		this.oAvatar.attachPress(function () {});
		this.stub(Log, "warning");

		//Act
		this.oAvatar.setBadgeIcon("12345");
		await nextUIUpdate();

		//Assert
		assert.equal(this.oAvatar._badgeRef === null, true, "No badge is attached to Avatar with various string value");

		//Act
		this.oAvatar.setBadgeIcon("sap-icon://no-icon");
		await nextUIUpdate();

		//Assert
		assert.equal(this.oAvatar._badgeRef === null, true, "Badge is attached to Avatar with bulk URI");
		assert.ok(Log.warning.withArgs(sWarnArgs).called, "then an error was logged");
		assert.equal(Log.warning.withArgs(sWarnArgs).callCount, 2, "then an error was logged");
	});

	QUnit.test("Check aria-label of avatar with badgeTooltip", function(assert) {
		var $oAvatar = this.oAvatar.$(),
			sDefaultBadgeTooltip = this.oAvatar._getDefaultTooltip();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), sDefaultBadgeTooltip, "Default badgeTooltip value is set as aria-label");
	});

	QUnit.test("Check aria-label of avatar with badgeTooltip", async function(assert) {
		var $oAvatar = this.oAvatar.$(),
			sDefaultBadgeTooltip = this.oAvatar._getDefaultTooltip(),
			sCustomBadgeTooltip = "Custom Tooltip";

		// Act
		this.oAvatar.setBadgeTooltip(sCustomBadgeTooltip);
		await nextUIUpdate();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), sDefaultBadgeTooltip + " " + sCustomBadgeTooltip, "Custom badgeTooltip value is set as aria-label");
	});

	QUnit.test("Check aria-label of avatar with badgeTooltip and initials", async function(assert) {
		var $oAvatar = this.oAvatar.$(),
			sDefaultBadgeTooltip = this.oAvatar._getDefaultTooltip(),
			sCustomBadgeTooltip = "Custom Tooltip",
			sInitials = "AA";

		// Act
		this.oAvatar.setBadgeTooltip(sCustomBadgeTooltip);
		this.oAvatar.setInitials(sInitials);
		await nextUIUpdate();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), sDefaultBadgeTooltip + " " + sCustomBadgeTooltip + " " + sInitials, "Both custom badgeTooltip and initials value are set as aria-label");
	});

	QUnit.module("Keyboard handling", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("SPACE - press event", function(assert) {
		//setup
		var oSpy = this.spy(Avatar.prototype, "firePress");

		//act
		qutils.triggerKeydown(this.oAvatar, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeydown");

		//act
		qutils.triggerKeyup(this.oAvatar, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.called, "Press event is fired onkeyup");
	});

	QUnit.test("SPACE - press event interupt", function(assert) {
		//setup
		var	oSpy = this.spy(Avatar.prototype, "firePress");

		testPressInterupt(assert, this.oAvatar, oSpy, KeyCodes.SHIFT);
		testPressInterupt(assert, this.oAvatar, oSpy, KeyCodes.ESCAPE);
	});

	QUnit.test("ENTER - press event", function(assert) {
		//setup
		var oSpy = this.spy(Avatar.prototype, "firePress");

		//act
		qutils.triggerKeyup(this.oAvatar, KeyCodes.ENTER);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeyup");

		//act
		qutils.triggerKeydown(this.oAvatar, KeyCodes.ENTER);

		//assert
		assert.ok(oSpy.called, "Press event is fired onkeydown");
	});

	function testPressInterupt (assert, oAvatar, oSpy, sKey) {
		//act
		qutils.triggerKeydown(oAvatar, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeydown");
		assert.ok(oAvatar._bSpacePressed, "Space key is marked as pressed");

		//act
		qutils.triggerKeydown(oAvatar, sKey);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeydown");
		assert.ok(oAvatar._bSpacePressed, "Space key is marked as pressed");
		assert.ok(oAvatar._bShouldInterupt, sKey + " key is marked as pressed");

		//act
		qutils.triggerKeyup(oAvatar, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeyup");
		assert.notOk(oAvatar._bSpacePressed, "Space key is unmarked as pressed");
		assert.notOk(oAvatar._bShouldInterupt, sKey + " key is unmarked as pressed");
	}
});
