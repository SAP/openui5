(function () {
	"use strict";

	var sControlId = "AvatarId",
		sImagePath = "../images/Woman_avatar_01.png",
		sIconPath ="sap-icon://lab",
		sPreAvatarSize = "Avatar's size is ",
		sPreAvatarShape = "Avatar's shape is ",
		sPreAvatarType = "Avatar's type is ",
		sDefaultIconRendered = "Avatar is a default icon",
		sPreAvatarFitType = "Avatar's image fit type is ",
		oCore = sap.ui.getCore();

	function createAvatar(oProps, sId) {
		var oAvatarProps = {};
		sId = sId || sControlId;

		oProps && jQuery.extend(oAvatarProps, oProps);

		return new sap.f.Avatar(sId, oAvatarProps);
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
		setup: function () {
			this.oAvatar = createAvatar({press: function () {}});
			this.oAvatar.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		teardown: teardownFunction
	});

	QUnit.test("Avatar with press event only", function () {
		var $oAvatar = this.oAvatar.$();

		ok(jQuery.sap.domById(sControlId), "Avatar is rendered in the DOM");
		ok($oAvatar.hasClass("sapFAvatar"), "Avatar is rendered with the Avatar class.");
		ok($oAvatar.hasClass("sapFAvatarS"), sPreAvatarSize + "S");
		ok($oAvatar.hasClass("sapFAvatarCircle"), sPreAvatarShape +  "Circle");
		ok($oAvatar.hasClass("sapFAvatarIcon"), sPreAvatarType + "Icon");
		ok($oAvatar.hasClass("sapMPointer"), "The cursor becomes pointer when hovering over the avatar");
		ok(($oAvatar !== undefined) && ($oAvatar != null), "Avatar should not be null");
	});

	QUnit.module("Rendering different sizes", {
		setup: setupFunction,
		teardown: teardownFunction
	});

	QUnit.test("Avatar with displaySize set to 'XS'", function () {
		this.oAvatar.setDisplaySize("XS");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarXS"), sPreAvatarSize + "XS");
	});

	QUnit.test("Avatar with displaySize set to 'S'", function () {
		this.oAvatar.setDisplaySize("S");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarS"), sPreAvatarSize + "S");
	});

	QUnit.test("Avatar with displaySize set to 'M'", function () {
		this.oAvatar.setDisplaySize("M");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarM"), sPreAvatarSize + "M");
	});

	QUnit.test("Avatar with displaySize set to 'L'", function () {
		this.oAvatar.setDisplaySize("L");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarL"), sPreAvatarSize + "L");
	});

	QUnit.test("Avatar with displaySize set to 'XL'", function () {
		this.oAvatar.setDisplaySize("XL");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarXL"), sPreAvatarSize + "XL");
	});

	QUnit.test("Avatar with displaySize set to 'Custom'", function () {
		this.oAvatar.setDisplaySize("Custom");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarCustom"), sPreAvatarSize + "Custom");
	});

	QUnit.module("Rendering different shapes", {
		setup: setupFunction,
		teardown: teardownFunction
	});

	QUnit.test("Avatar with displayShape set to 'Circle'", function () {
		this.oAvatar.setDisplayShape("Circle");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarCircle"), sPreAvatarShape + "Circle");
	});

	QUnit.test("Avatar with displayShape set to 'Square'", function () {
		this.oAvatar.setDisplayShape("Square");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarSquare"), sPreAvatarShape + "Square");
	});

	QUnit.module("Rendering different types", {
		setup: setupFunction,
		teardown: teardownFunction
	});

	QUnit.test("Avatar with src leading to an icon", function () {
		this.oAvatar.setSrc(sIconPath);
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarIcon"), sPreAvatarType + "Icon");
	});

	QUnit.test("Avatar with src leading to an image", function () {
		this.oAvatar.setSrc(sImagePath);
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarImage"), sPreAvatarType + "Image");
	});

	QUnit.test("Avatar with initials in valid format", function () {
		this.oAvatar.setInitials("SR");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarInitials"), sPreAvatarType + "Initials");
	});

	QUnit.test("Avatar with initials consisting of three letters", function () {
		this.oAvatar.setInitials("SRL");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of no letters", function () {
		this.oAvatar.setInitials("");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.test("Avatar with initials consisting of non-latin letters", function () {
		this.oAvatar.setInitials("ЯЪ");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarIcon"), sDefaultIconRendered);
	});

	QUnit.module("Rendering different fit types", {
		setup: setupFunction,
		teardown: teardownFunction
	});

	QUnit.test("Avatar with imageFitType set to 'Cover'", function () {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Cover");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarImageCover"), sPreAvatarFitType + "Cover");
	});

	QUnit.test("Avatar with imageFitType set to 'Contain'", function () {
		this.oAvatar.setSrc(sImagePath);
		this.oAvatar.setImageFitType("Contain");
		oCore.applyChanges();

		var $oAvatar = this.oAvatar.$();
		ok($oAvatar.hasClass("sapFAvatarImageContain"), sPreAvatarFitType + "Contain");
	});
})();