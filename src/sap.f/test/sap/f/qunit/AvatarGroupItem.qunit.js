/*global QUnit */

sap.ui.define([
	"sap/f/AvatarGroupItem",
	"sap/ui/core/Core"
],
function (
	AvatarGroupItem,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		sControlId = "AvatarGroupItemId";

	function createAvatarGroupItem(oProps, sId) {
		var sId = sId || sControlId;

		return new AvatarGroupItem(sId, oProps);
	}

	function setupFunction() {
		this.oAvatarGroupItem = createAvatarGroupItem({
			initials: "BD",
			src: "src",
			fallbackIcon: "icon"
		});
		this.oAvatarGroupItem.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	}

	function teardownFunction() {
		this.oAvatarGroupItem.destroy();
	}

	QUnit.module("Basic Rendering");

	QUnit.test("Rendering", function (assert) {
		// Arrange
		var oAvatarGroupItem = createAvatarGroupItem(),
			$oDomRef;

		// Act
		oAvatarGroupItem.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		$oDomRef = oAvatarGroupItem.$();

		// Assert
		assert.ok($oDomRef, "The AvatarGroupItem is rendered");
		assert.ok($oDomRef.hasClass("sapFAvatarGroupItem"), "The AvatarGroupItem has 'sapFAvatarGroupItem' class");
		assert.strictEqual($oDomRef.attr("tabindex"), undefined, "The AvatarGroupItem has no tabindex when it is in Group mode");

		// Act
		oAvatarGroupItem._setGroupType("Individual");
		oAvatarGroupItem._setInteractive(true);
		Core.applyChanges();

		// Assert
		assert.strictEqual($oDomRef.attr("tabindex"), "0", "The AvatarGroupItem has tabindex=0 when it is in Individual mode");

		// Act
		oAvatarGroupItem._setGroupType("Individual");
		oAvatarGroupItem._setInteractive(false);
		Core.applyChanges();

		// Assert
		assert.strictEqual($oDomRef.attr("tabindex"), undefined, "The AvatarGroupItem has no tabindex when it is in Individual mode and is not interactive");

		// Clean up
		oAvatarGroupItem.destroy();
	});

	QUnit.module("API", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("setSrc", function (assert) {
		// Arrange
		var sNewSrc = "newSrc",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getSrc(), "src", "src of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setSrc(sNewSrc);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oAvatar.getSrc(), sNewSrc, "src of Avatar is changed correctly");
	});

	QUnit.test("setInitials", function (assert) {
		// Arrange
		var sNewInitials = "GR",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getInitials(), "BD", "initials of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setInitials(sNewInitials);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oAvatar.getInitials(), sNewInitials, "initials of Avatar is changed correctly");
	});

	QUnit.test("setFallbackIcon", function (assert) {
		// Arrange
		var sNewFallbackIcon = "newIcon",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getFallbackIcon(), "icon", "fallbackIcon of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setFallbackIcon(sNewFallbackIcon);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oAvatar.getFallbackIcon(), sNewFallbackIcon, "fallbackIcon of Avatar is changed correctly");
	});


	QUnit.test("Avatar Group Item tooltip", function (assert) {
		// Arrange

		this.oAvatarGroupItem.setTooltip("New Tooltip");
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oAvatarGroupItem.$().attr("title"), "New Tooltip", "Avatar tooltip was correctly attached tp AvatarGroupItem");
	});

	QUnit.module("Private API", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("_setDisplaySize", function (assert) {
		// Arrange
		var oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("S");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "S", "displaySize of Avatar is set correctly");
	});

	QUnit.test("_setAvatarColor", function (assert) {
		// Arrange
		var oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setAvatarColor("Accent1");

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), "Accent1", "backgroundColor of Avatar is set correctly");
	});

	QUnit.test("_setGroupType", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oAvatarGroupItem, "invalidate");
		this.oAvatarGroupItem._setGroupType("Group");

		// Assert
		assert.strictEqual(this.oAvatarGroupItem._getGroupType(), "Group", "groupType of AvatarGroupItem is set correctly");
		assert.strictEqual(oSpy.callCount, 1, "Invalidate is called");
	});

	QUnit.test("_getAvatar", function (assert) {
		// Arrange
		var oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.ok(oAvatar.isA("sap.f.Avatar"), "Avatar instance is created");
		assert.strictEqual(oAvatar.getShowBorder(), true, "showBorder of Avatar is true");
	});

	QUnit.test("_setCustomDisplaySize", function (assert) {
		// Arrange
		var oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("Custom");
		this.oAvatarGroupItem._setCustomDisplaySize("3rem");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "Custom", "displaySize of Avatar is set correctly");
		assert.strictEqual(oAvatar.getCustomDisplaySize(), "3rem", "customDisplaySize of Avatar is set correctly");
	});

	QUnit.test("_setCustomFontSize", function (assert) {
		// Arrange
		var oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("Custom");
		this.oAvatarGroupItem._setCustomFontSize("0.5rem");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "Custom", "displaySize of Avatar is set correctly");
		assert.strictEqual(oAvatar.getCustomFontSize(), "0.5rem", "customFontSize of Avatar is set correctly");
	});
});