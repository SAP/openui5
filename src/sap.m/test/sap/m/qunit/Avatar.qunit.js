/*global QUnit */
sap.ui.define([
	"sap/ui/core/Core",
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
	"sap/ui/core/InvisibleText"
], function(
	oCore,
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

	function setupFunction() {
		this.oAvatar = createAvatar();
		this.oAvatar.placeAt("qunit-fixture");
		oCore.applyChanges();
	}

	function teardownFunction() {
		this.oAvatar.destroy();
	}

	/* tests */
	QUnit.module("Basic rendering", {
		beforeEach: function () {
			this.oAvatar = createAvatar({press: function () {}});
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with 'enable' set to 'false' has the proper attr and class", function (assert) {
		// arrange
		var $oAvatar = this.oAvatar.$();

		// act
		this.oAvatar.setEnabled(false);
		oCore.applyChanges();

		// assert
		assert.ok($oAvatar.hasClass("sapMAvatarDisabled"), "Avatar has the disabled CSS class");
		assert.strictEqual($oAvatar.attr("disabled"), "disabled", "Avatar has the 'disabled' DOM attribute");
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
		assert.strictEqual(sOffset, "1px", "Outline-offset is set");
	});

	QUnit.module("Rendering different sizes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with displaySize set to 'XS'", function (assert) {
		this.oAvatar.setDisplaySize("XS");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarXS"), sPreAvatarSize + "XS");
	});

	QUnit.test("Avatar with displaySize set to 'S'", function (assert) {
		this.oAvatar.setDisplaySize("S");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarS"), sPreAvatarSize + "S");
	});

	QUnit.test("Avatar with displaySize set to 'M'", function (assert) {
		this.oAvatar.setDisplaySize("M");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarM"), sPreAvatarSize + "M");
	});

	QUnit.test("Avatar with displaySize set to 'L'", function (assert) {
		this.oAvatar.setDisplaySize("L");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarL"), sPreAvatarSize + "L");
	});

	QUnit.test("Avatar with displaySize set to 'XL'", function (assert) {
		this.oAvatar.setDisplaySize("XL");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarXL"), sPreAvatarSize + "XL");
	});

	QUnit.test("Avatar with displaySize set to 'Custom'", function (assert) {
		this.oAvatar.setDisplaySize("Custom");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarCustom"), sPreAvatarSize + "Custom");
	});

	QUnit.module("Rendering different shapes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with displayShape set to 'Circle'", function (assert) {
		this.oAvatar.setDisplayShape("Circle");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarCircle"), sPreAvatarShape + "Circle");
	});

	QUnit.test("Avatar with displayShape set to 'Square'", function (assert) {
		this.oAvatar.setDisplayShape("Square");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarSquare"), sPreAvatarShape + "Square");
	});

	QUnit.module("Rendering fallback icon", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with valid icon src should not use default icon", function (assert) {
		this.oAvatar.setSrc("sap-icon://touch");
		oCore.applyChanges();

		assert.notOk(this.oAvatar._bIsDefaultIcon, "Icon source is valid");
	});

	QUnit.test("Avatar with invalid icon src should use default icon", function (assert) {
		this.oAvatar.setSrc("sap-icon://qwertyu");
		oCore.applyChanges();

		assert.ok(this.oAvatar._bIsDefaultIcon, "Icon source is invalid and fallback icon will be shown");
	});

	QUnit.test("Fallback type should be always restored according to current property values", function (assert) {
		//Arrange
		this.oAvatar.setSrc("https://example.org/some-image-src.jpg");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oAvatar._getImageFallbackType(), "Icon",
			"Icon is the fallback type when the Avatar has src and no initials");

		// Act
		this.oAvatar.setSrc("");
		this.oAvatar.setInitials("IB");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oAvatar._getImageFallbackType(), "Initials",
			"Initials is returned as fallback type when the src of the Avatar is removed and initials are set");
	});

	QUnit.module("Rendering different types", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with src leading to an icon", function (assert) {
		this.oAvatar.setSrc(sIconPath);
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sPreAvatarType + "Icon");
	});

	QUnit.test("Avatar with src leading to an image", function (assert) {
		this.oAvatar.setSrc(sImagePath);
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$(),
			sBackgroundColorValue = $oAvatar.css("background-color"),
			bIsTransparent = sBackgroundColorValue === "transparent" ||
					sBackgroundColorValue === "rgba(0, 0, 0, 0)";

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarImage"), sPreAvatarType + "Image");
		assert.ok(bIsTransparent, "Background is transparent");
	});

	QUnit.test("Avatar with src leading to an image has correct css style", function (assert) {
		var sExpectedOutputImage = 'url("' + sImagePath + '")';
		this.oAvatar.setSrc(sImagePath);
		oCore.applyChanges();

		var $oAvatarImageHolder = this.oAvatar.$().find('.sapFAvatarImageHolder').get(0);
		assert.strictEqual($oAvatarImageHolder.style.backgroundImage, sExpectedOutputImage, "correct style value");
	});

	QUnit.test("Avatar with initials in valid format", function (assert) {
		this.oAvatar.setInitials("SR");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarInitials"), sPreAvatarType + "Initials");
	});

	QUnit.test("Avatar with initials consisting of four letters", function (assert) {
		this.oAvatar.setInitials("SRLA");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of no letters", function (assert) {
		this.oAvatar.setInitials("");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of non-latin letters", function (assert) {
		this.oAvatar.setInitials("ЯЪ");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with three overflowing initials", function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("XL");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), "When initials inside sap.m.Avatar are overflwing, default icon should be shown after redering");
	});

	QUnit.test("Avatar with three overflowing initials", function (assert) {
		this.oAvatar.setInitials("WWW");
		this.oAvatar.setDisplaySize("XL");
		this.oAvatar.onThemeChanged();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarIcon"), "When initials inside sap.m.Avatar are overflwing, default icon should be shown after theme is changed");
	});

	QUnit.test("Avatar with initials consisting of accented characters", function (assert) {
		this.oAvatar.setInitials("ÌÒ");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.hasClass("sapFAvatarInitials"), sPreAvatarType + "Initials");
	});

	QUnit.module("Rendering different fit types", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Avatar with imageFitType set to 'Cover'", function (assert) {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Cover");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.find(".sapFAvatarImageHolder").hasClass("sapFAvatarImageCover"), sPreAvatarFitType + "Cover");
	});

	QUnit.test("Avatar with imageFitType set to 'Contain'", function (assert) {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Contain");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		assert.ok($oAvatar.find(".sapFAvatarImageHolder").hasClass("sapFAvatarImageContain"), sPreAvatarFitType + "Contain");
	});

	QUnit.test("Show fallback initials when image source is invalid and initials are set and valid", function (assert) {
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
		oCore.applyChanges();

		//Assert
		$oAvatar = this.oAvatar.$();
		assert.equal($oAvatar.find(".sapFAvatarInitialsHolder").text(),"PB", "When type of sap.m.Avatar is 'Image'" +
		 " and initials are set we load fallback initials container");
	});

	QUnit.test("Add initials class when source is invalid and initials are set", function (assert) {
		// Arrange
		var $oAvatar,
			done = assert.async(),
			that = this,
			oStub = this.stub(this.oAvatar, "_onImageError").callsFake(function() {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageError();
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
		this.oAvatar.setSrc("_");
		oCore.applyChanges();
	});

	QUnit.test("Show fallback default Icon when image source is invalid and initials are not set", function (assert) {
		//Act
		this.oAvatar.setSrc("_");
		oCore.applyChanges();

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

	QUnit.test("Add icon class when source is invalid and initials are not set", function (assert) {
		// Arrange
		var $oAvatar,
			done = assert.async(),
			that = this,
			oStub = this.stub(this.oAvatar, "_onImageError").callsFake(function() {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageError();
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
		this.oAvatar.setSrc("_");
		oCore.applyChanges();
	});

	QUnit.test("Fallback content is loaded, but hidden when sap.m.Avatar type Image has valid image source", function (assert) {
		//Arrange
		assert.expect(2);
		var done = assert.async(),
			that = this,

			oStub = this.stub(this.oAvatar, "_onImageLoad").callsFake(function() {
				oStub.restore(); // avoid endless recursion
				that.oAvatar._onImageLoad();
				//Assert
				assert.ok(true, "When image inside sap.m.Avatar is loaded, success callback launches");
				assert.equal(that.oAvatar.$().find(".sapUiIcon").css('display'), 'none', "Hiding fallback content valid");
				done();
			});
		//Act
		this.oAvatar.setSrc(sImagePath);
		oCore.applyChanges();
	});

	QUnit.module("Rendering with sap.m.ImageCustomData", {
		beforeEach: function () {
			this.oAvatar = createAvatar({
				src: sImagePath,
				customData: [
					new ImageCustomData({ paramName: "xcache" })
				]
			});

			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
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

	QUnit.test("Cache busting paramater value is not changed when Avatar gets invalidated ", function (assert) {
		// Arrange
		var sAvatarUrl = this.oAvatar.$().find(".sapFAvatarImageHolder")[0].style.backgroundImage,
			sAvatarParamValue = sAvatarUrl.match(/xcache=(\d+)/)[1];

		// Act
		this.oAvatar.invalidate();
		oCore.applyChanges();

		// Assert
		assert.strictEqual(sAvatarParamValue, this.oAvatar._iCacheBustingValue.toString(), "Avatar is rendered with correct query parameter");
	});

	QUnit.test("Avatar's internal preloaded Image has correct url when used in cache busting context", function (assert) {
		// Arrange
		var sAvatarUrl = this.oAvatar.$().find(".sapFAvatarImageHolder")[0].style.backgroundImage;

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

	QUnit.test("_icon", function (assert) {
		this.oAvatar.placeAt("qunit-fixture");
		oCore.applyChanges();
		assert.ok(this.oAvatar.getAggregation("_icon"), "The '_icon' aggregation is created.");
		assert.strictEqual(this.oAvatar._icon, undefined, "The '_icon' is no longer stored as internal object.");
	});

	QUnit.module("Functionality", {
		beforeEach: function () {
			this.oAvatar = createAvatar({ src: "/you/must/escape/single'quotes" });
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: teardownFunction
	});

	QUnit.test(".sapMAvatarPressed class is added where applicable", function (assert) {
		// Arrange
		var fnHandler = this.stub();
		this.oAvatar.attachPress(fnHandler);

		// Act - Simulate press in order to add the new CSS class
		this.oAvatar._handlePress();

		// Assert
		assert.ok(this.oAvatar.hasStyleClass('sapMAvatarPressed'), ".sapMAvatarPressed class is added to the Avatar");

		// Act - Simulate press in order to remove the new CSS class
		this.oAvatar._handlePress();

		// Assert
		assert.notOk(this.oAvatar.hasStyleClass('sapMAvatarPressed'), ".sapMAvatarPressed class is removed from the Avatar");

		// Act - Remove the press handler
		this.oAvatar.detachPress(fnHandler);

		// Act - Simulate press in order to add the new CSS class
		this.oAvatar._handlePress();

		// Assert
		assert.notOk(this.oAvatar.hasStyleClass('sapMAvatarPressed'), ".sapMAvatarPressed class isn't added to the Avatar when there is no press handler");
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

	QUnit.test("Avatar with border", function (assert) {
		// Arrange
		var $oAvatar = this.oAvatar.$();

		// Assert
		assert.notOk($oAvatar.hasClass("sapFAvatarBorder"), "Avatar does not have 'sapFAvatarBorder' class when showBorder='fase'");

		// Act
		this.oAvatar.setShowBorder(true);
		oCore.applyChanges();

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarBorder"), "Avatar has 'sapFAvatarBorder' class when showBorder='true'");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oAvatar = createAvatar({ tooltip: "sampleTooltip" });
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: teardownFunction
	});

	QUnit.test("Check if tooltip is present", function (assert) {
		var $oAvatar = this.oAvatar.$();
		assert.strictEqual($oAvatar.prop("title"), "sampleTooltip", "Tooltip is present");
	});

	QUnit.test("Check ARIA specific roles", function (assert) {
		var $oAvatar = this.oAvatar.$(),
			sDefaultTooltip = oCore.getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP");

		assert.strictEqual($oAvatar.attr("role"), "img", "Aria role should be 'img'");
		assert.strictEqual($oAvatar.attr("aria-label"), "sampleTooltip", "Aria-label should be the custom 'sampleTooltip' text tooltip");

		//act
		this.oAvatar.setInitials("BP");
		oCore.applyChanges();
		$oAvatar = this.oAvatar.$();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"), "sampleTooltip", "Aria-label should still be the custom 'sampleTooltip' text tooltip");

		//act
		this.oAvatar.setTooltip("");
		oCore.applyChanges();
		$oAvatar = this.oAvatar.$();

		//assert
		assert.strictEqual($oAvatar.attr("aria-label"),  sDefaultTooltip + " BP", "Aria-label should include the defined initials and the default 'Avatar' text if no tooltip is set");

		//act
		this.oAvatar.setInitials("");
		oCore.applyChanges();
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
		oCore.applyChanges();

		assert.strictEqual($oAvatar.attr("aria-hidden"), "true", "Aria-hidden should be set to default avatars");
		assert.strictEqual($oAvatar.attr("role"), "presentation", "Aria role should be 'img' on decorative avatars");
	});

	QUnit.test("Appearance of the aria-haspopup attribute", function (assert) {
		var AriaHasPopup = coreLibrary.aria.HasPopup,
			oAvatarDomRef;

		// setup
		this.oAvatar.placeAt("qunit-fixture");
		oCore.applyChanges();
		oAvatarDomRef = this.oAvatar.getDomRef();

		// check initial aria-haspopup state
		assert.notOk(oAvatarDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute initially.");

		// act
		this.oAvatar.setAriaHasPopup(AriaHasPopup.Menu);
		oCore.applyChanges();

		// check if aria-haspopup appears
		assert.equal(oAvatarDomRef.getAttribute("aria-haspopup"), AriaHasPopup.Menu.toLowerCase(), "There is aria-haspopup attribute with proper value after the avatar property is being set to something different than None.");

		// act
		this.oAvatar.setAriaHasPopup(AriaHasPopup.None);
		oCore.applyChanges();

		// check if aria-haspopup disappears
		assert.notOk(oAvatarDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute after the avatar property is being set to None.");
	});

	QUnit.test("Aria-labelledby", function(assert) {
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
		oCore.applyChanges();
		oAvatarDomRef = avatar.getDomRef();

		//assert
		assert.strictEqual(oAvatarDomRef.getAttribute("aria-labelledby"), "id1", "Aria-labelledby is set correctly");

		// Act
		avatar.setInitials("BP");
		oCore.applyChanges();

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
		beforeEach: function () {
			this.oAvatar = createAvatar({ tooltip: "sampleTooltip" });
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
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

	QUnit.test("Iterate over all possible colors and set them", function (assert) {
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
			oCore.applyChanges();

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sCurrentColor,
					"Avatar has the correct backgroundProperty value " + sCurrentColor + ".");
			assert.ok($oAvatar.hasClass("sapFAvatarColor" + sCurrentColor),
					"Avatar is with the correct CSS class for " + sCurrentColor + " background color.");
		}
	});

	QUnit.test("Random color is not changed after re-rendering", function (assert) {
		// Arrange
		var oAvatar = this.oAvatar,
			$oAvatar = oAvatar.$(),
			sActualBackgroundColor;

		// Act - Setting the background of the control to Random
		oAvatar.setBackgroundColor(AvatarColor.Random);
		oCore.applyChanges();

		sActualBackgroundColor = oAvatar._getActualBackgroundColor();

		// Assert
		assert.ok($oAvatar.hasClass("sapFAvatarColor" + sActualBackgroundColor),
			"After setting the Avatar color to Random, its background is " + sActualBackgroundColor + ".");

		// Act - Re-rendering the control
		oAvatar.invalidate();
		oCore.applyChanges();

		// Assert
		assert.strictEqual(sActualBackgroundColor, oAvatar._getActualBackgroundColor(),
			"After re-rendering the Avatar, its background is kept (" + sActualBackgroundColor + ").");
	});

	/* tests */
	QUnit.module("Avatar different badge configurations", {
		beforeEach: function () {
			this.oAvatar = createAvatar();
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: teardownFunction
	});

	QUnit.test("badgeValueState applies correct css classes to the Avatar", function(assert) {
		//setup
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		oCore.applyChanges();

		//assert
		Object.keys(ValueState).forEach(function(val){
			this.oAvatar.setBadgeValueState(val);
			oCore.applyChanges();
			assert.ok(this.oAvatar.hasStyleClass('sapFAvatar' + val), 'The avatar has the ' + val + ' class');
			Object.keys(ValueState).forEach(function(nestedVal){
				if (nestedVal !== val) {
					assert.notOk(this.oAvatar.hasStyleClass('sapFAvatar' + nestedVal), "The avatar doesn't have the + " + nestedVal + " class");
				}
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Affordance is rendered when press event is attached", function(assert) {
		//setup
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		oCore.applyChanges();

		//assert
		assert.equal(this.oAvatar._badgeRef != null, true, "Badge is attached to Avatar");
		assert.equal(this.oAvatar._badgeRef.getTooltip(),
			oCore.getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),
			"Badge Tooltip is predefined");
	});

	QUnit.test("Affordance is not attached, when press event is missing", function(assert) {
		//setup
		this.oAvatar.setBadgeIcon("sap-icon://zoom-in");
		oCore.applyChanges();

		//assert
		assert.equal(this.oAvatar._badgeRef === null, true, "Badge is attached to Avatar");
	});

	QUnit.test("Affordance is attached, when details aggregation is presented", function(assert) {
		// Act
		this.oAvatar.setDetailBox(new LightBox());
		oCore.applyChanges();

		//assert
		assert.equal(this.oAvatar._badgeRef != null, true, "Badge is attached to Avatar");
	});

	QUnit.test("Affordance is attached, when details aggregation is presented", function(assert) {
		// Act
		this.oAvatar.attachPress(function () {});
		this.oAvatar.setBadgeIcon("sap-icon://edit");
		this.oAvatar.setBadgeTooltip("Edit custom");
		oCore.applyChanges();

		//assert
		assert.equal(this.oAvatar._badgeRef.getTooltip() != oCore.getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),
		true, "Badge tooltip is not predefined");

		//assert
		assert.equal(this.oAvatar._badgeRef.getTooltip() != this.oAvatar.getTooltip(),
			true, "Badge tooltip is not default one");
	});

	QUnit.test("Affordance is not presented with bulk data", function(assert) {
		// Arrange
		var sWarnArgs = "No valid Icon URI source for badge affordance was provided";
		this.oAvatar.attachPress(function () {});
		this.stub(Log, "warning");

		//Act
		this.oAvatar.setBadgeIcon("12345");
		oCore.applyChanges();

		//Assert
		assert.equal(this.oAvatar._badgeRef === null, true, "No badge is attached to Avatar with various string value");

		//Act
		this.oAvatar.setBadgeIcon("sap-icon://no-icon");
		oCore.applyChanges();

		//Assert
		assert.equal(this.oAvatar._badgeRef === null, true, "Badge is attached to Avatar with bulk URI");
		assert.ok(Log.warning.withArgs(sWarnArgs).called, "then an error was logged");
		assert.equal(Log.warning.withArgs(sWarnArgs).callCount, 2, "then an error was logged");
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