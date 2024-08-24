/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/f/AvatarGroup",
	"sap/f/AvatarGroupItem",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function (
	Page,
	AvatarGroup,
	AvatarGroupItem,
	KeyCodes,
	nextUIUpdate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		sControlId = "AvatarGroupId";

	function createAvatarGroup(oProps, sId) {
		sId = sId || sControlId;

		return new AvatarGroup(sId, oProps);
	}

	function getItems() {
		return [
			new AvatarGroupItem({ initials: "BD" }),
			new AvatarGroupItem({ initials: "BD" }),
			new AvatarGroupItem({ initials: "BD" }),
			new AvatarGroupItem({ initials: "BD" }),
			new AvatarGroupItem({ initials: "BD" })
		];
	}

	function setupFunction() {
		this.oAvatarGroup = createAvatarGroup({items: getItems()});
	}

	function teardownFunction() {
		this.oAvatarGroup.destroy();
	}

	QUnit.module("Basic Rendering");

	QUnit.test("Rendering", async function (assert) {

		// Arrange
		var oAvatarGroup = new AvatarGroup({}),
			$oDomRef;

		// Act
		oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		$oDomRef = oAvatarGroup.$();

		// Assert
		assert.ok($oDomRef, "The AvatarGroup is rendered");
		assert.ok($oDomRef.hasClass("sapFAvatarGroup"), "The AvatarGroup has 'sapFAvatarGroup' class");
		assert.ok($oDomRef.hasClass("sapFAvatarGroupGroup"),
			"The AvatarGroup has 'sapFAvatarGroupGroup' class when groupType property is default");
		assert.ok($oDomRef.hasClass("sapFAvatarGroupS"), "The AvatarGroup has 'sapFAvatarGroupS' class by default");
		assert.notOk($oDomRef.hasClass("sapFAvatarGroupShowMore"),
			"The AvatarGroup does not have 'sapFAvatarGroupShowMore' class when there are no AvatarGroupItems");
		assert.strictEqual($oDomRef.attr("tabindex"), "0", "The AvatarGroup has tabindex=0 when it is in Group mode");

		// Act
		oAvatarGroup.setGroupType("Individual");
		await nextUIUpdate();

		// Assert
		assert.ok($oDomRef.hasClass("sapFAvatarGroupIndividual"),
			"The AvatarGroup has 'sapFAvatarGroupIndividual' class when groupType property is 'Individual'");

		// Clean up
		oAvatarGroup.destroy();
	});

	QUnit.test("Tooltip", async function (assert) {

		// Arrange
		var sTooltip = "Test tooltip",
				oAvatarGroup = new AvatarGroup({
				tooltip: sTooltip
			}),
			$oDomRef;

		// Act
		oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		$oDomRef = oAvatarGroup.$();

		// Assert
		assert.strictEqual($oDomRef.attr("title"), sTooltip, "The AvatarGroup has tooltip shown, when in Group mode");

		// Act
		oAvatarGroup.setGroupType("Individual");
		await nextUIUpdate();

		// Assert
		assert.strictEqual($oDomRef.attr("title"), undefined, "The AvatarGroup does not have tooltip shown, when in Individual mode");

		// Clean up
		oAvatarGroup.destroy();
	});

	QUnit.module("Rendering different sizes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("AvatarGroup with avatarDisplaySize set to 'XS' then to 'L'", async function (assert) {
		// Arrange
		var $oDomRef;
		this.oAvatarGroup.setAvatarDisplaySize("XS");
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		$oDomRef = this.oAvatarGroup.$();
		assert.ok($oDomRef.hasClass("sapFAvatarGroupXS"), "The AvatarGroup has 'sapFAvatarGroupXS' class");

		this.oAvatarGroup.getItems().forEach(function (oItem) {
			assert.ok(oItem.$().hasClass("sapFAvatarGroupItemXS"), "The AvatarGroupItem has 'sapFAvatarGroupItemXS' class");
		});

		// Act
		this.oAvatarGroup.setAvatarDisplaySize("L");
		await nextUIUpdate();

		// Assert
		assert.notOk($oDomRef.hasClass("sapFAvatarGroupXS"),
			"The AvatarGroup does not have previous 'sapFAvatarGroupXS' class");
		assert.ok($oDomRef.hasClass("sapFAvatarGroupL"), "The AvatarGroup has 'sapFAvatarGroupL' class");

		this.oAvatarGroup.getItems().forEach(function (oItem) {
			assert.notOk(oItem.$().hasClass("sapFAvatarGroupItemXS"),
				"The AvatarGroupItem does not have previous'sapFAvatarGroupItemXS' class");
			assert.ok(oItem.$().hasClass("sapFAvatarGroupItemL"), "The AvatarGroupItem has 'sapFAvatarGroupItemL' class");
		});
	});

	QUnit.test("AvatarGroup with avatarDisplaySize set to 'Custom'", async function (assert) {
		// Arrange
		var $oDomRef;
		this.oAvatarGroup.setAvatarDisplaySize("Custom");
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		$oDomRef = this.oAvatarGroup.$();
		assert.ok($oDomRef.hasClass("sapFAvatarGroupCustom"), "The AvatarGroup has 'sapFAvatarGroupCustom' class");
		assert.ok(this.oAvatarGroup.getAvatarCustomDisplaySize(), "3rem", "The AvatarGroup has 'avatarCustomDisplaySize' property with 3rem by default");
		assert.ok(this.oAvatarGroup.getAvatarCustomFontSize(), "1.125rem", "The AvatarGroup has 'avatarCustomFontSize' property with 1.125rem by default");

		this.oAvatarGroup.getItems().forEach(function (oItem) {
			assert.ok(oItem.$().hasClass("sapFAvatarGroupItemCustom"), "The AvatarGroupItem has 'sapFAvatarGroupItemCustom' class");
		});

		// Act
		this.oAvatarGroup.setAvatarCustomDisplaySize("4rem");
		this.oAvatarGroup.setAvatarCustomFontSize("1.5rem");
		await nextUIUpdate();

		// Assert
		assert.ok(this.oAvatarGroup.getAvatarCustomDisplaySize(), "4rem", "The AvatarGroup has 'avatarCustomDisplaySize' property changed to 4rem");
		assert.ok(this.oAvatarGroup.getAvatarCustomFontSize(), "1.5rem", "The AvatarGroup has 'avatarCustomFontSize' property changed to 1.5rem");

		this.oAvatarGroup.getItems().forEach(function (oItem) {
			assert.ok(oItem._getAvatar().getCustomDisplaySize(), "4rem", "The avatarCustomDisplaySize property propagates to Avatar");
			assert.ok(oItem._getAvatar().getCustomFontSize(), "1.5rem", "The avatarCustomFontSize property propagates to Avatar");
		});
	});

	QUnit.test("Avatar theme changing logic", async function (assert) {
		// Arrange
		var oSpy = this.spy(this.oAvatarGroup, "_onResize");

		// Act
		this.oAvatarGroup.onThemeChanged({ theme: "mock" });

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "_onResize method not called when AvatarGroup is not rendered");

		// Act
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		oSpy.resetHistory();
		this.oAvatarGroup.onThemeChanged({ theme: "mock" });

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "_onResize is called when theme is changed");
	});

	QUnit.module("AvatarGroupItems Creation", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("AvatarGroupItems color", function (assert) {
		// Arrange
		var aItems = this.oAvatarGroup.getItems(),
			oItem;

		// Assert
		assert.strictEqual(this.oAvatarGroup._iCurrentAvatarColorNumber, aItems.length + 1,
			"The current avatar color should be the next Accent color");

		for (var i = 1; i <= aItems.length; i++) {
			oItem = aItems[i - 1];
			assert.strictEqual(oItem.getAvatarColor(), "Accent" + i, "The Avatar has correct consequent color");
		}
	});

	QUnit.test("AvatarGroupItems groupType", async function (assert) {
		// Arrange
		var aItems = this.oAvatarGroup.getItems(),
			oItem;

		// Assert
		for (var i = 1; i <= aItems.length; i++) {
			oItem = aItems[i - 1];
			assert.strictEqual(oItem._getGroupType(), "Group", "The Avatar has Group groupType by default");
		}

		// Act
		this.oAvatarGroup.setGroupType("Individual");
		await nextUIUpdate();

		// Assert
		for (var i = 1; i <= aItems.length; i++) {
			oItem = aItems[i - 1];
			assert.strictEqual(oItem._getGroupType(), "Individual", "The Avatar has Individual groupType");
		}
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("Space/Enter key pressed", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oAvatarGroup, "ontap");

		// Act
		this.oAvatarGroup.onsapenter({});

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Enter key press calls ontap");

		// Act
		this.oAvatarGroup.onsapspace({});

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "Space key press calls ontap");
	});

	QUnit.test("ontap", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oAvatarGroup, "firePress");

		// Act
		this.oAvatarGroup.ontap({ srcControl: this.oAvatarGroup });

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "firePress event is fired");
	});

	QUnit.test("onkeyup", function (assert) {
		// Arrange
		var oEventCalled = {
				shiftKey: true,
				keyCode: KeyCodes.ENTER,
				preventDefault: function () {
					assert.ok(true, "preventDefault is called when shift + enter/space are pressed");
				}
			};

		// Act
		this.oAvatarGroup.onkeyup(oEventCalled);
		oEventCalled.keyCode = KeyCodes.SPACE;
		this.oAvatarGroup.onkeyup(oEventCalled);
	});

	QUnit.module("Private API", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("_getAvatarsToShow", function (assert) {
		// Assert
		assert.strictEqual(this.oAvatarGroup._getAvatarsToShow(464, 3, 3.125), 9,
			"Avatars to be shown are calculated correctly");
		assert.strictEqual(this.oAvatarGroup._getAvatarsToShow(464, 4, 2.375), 11,
		"Avatars to be shown are calculated correctly");
	});

	QUnit.test("_iAvatarsToShow after addItem", function (assert) {
		var iExpectedCount = this.oAvatarGroup.getItems().length + 1;

		// Act
		this.oAvatarGroup.addItem(new AvatarGroupItem({ initials: "BD" }));

		//Assert
		assert.strictEqual(this.oAvatarGroup._iAvatarsToShow, iExpectedCount,
		"Avatars to be shown are calculated correctly");
	});

	QUnit.test("_adjustAvatarsToShow", function (assert) {
		// Arrange
		this.oAvatarGroup._iAvatarsToShow = 10;

		// Act
		this.oAvatarGroup._adjustAvatarsToShow(110);

		// Assert
		assert.strictEqual(this.oAvatarGroup._iAvatarsToShow, 8,
			"When button has more than two digits, substract two Avatars");

		// Act
		this.oAvatarGroup._iAvatarsToShow = 10;
		this.oAvatarGroup._adjustAvatarsToShow(90);

		// Assert
		assert.strictEqual(this.oAvatarGroup._iAvatarsToShow, 9,
			"When button has at most two digits, substract one Avatar");
	});

	QUnit.test("_getAvatarWidth", async function (assert) {
		// Assert
		assert.strictEqual(this.oAvatarGroup._getAvatarWidth("M"), 4,
			"Avatar width in Group mode is calculated correctly");

		// Act
		this.oAvatarGroup.setGroupType("Individual");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oAvatarGroup._getAvatarWidth("M"), 4,
			"Avatar width in Individual mode is calculated correctly");
	});

	QUnit.test("_getAvatarNetWidth", function (assert) {
		// Assert
		assert.strictEqual(this.oAvatarGroup._getAvatarNetWidth(48, 8), 48 - 8,
			"Avatar net width in Group mode is calculated correctly");

		// Act
		this.oAvatarGroup.setGroupType("Individual");

		// Assert
		assert.strictEqual(this.oAvatarGroup._getAvatarNetWidth(48, 8), 48 + 8,
			"Avatar net width in Individual mode is calculated correctly");
	});

	QUnit.test("_getAvatarMargin", function (assert) {
		var oAvatarGroupMargins = {
				XS: 0.5,
				S: 1.25,
				M: 1.625,
				L: 2,
				XL: 2.75
			},
			oAvatarIndividualMargins = {
				XS: 0.0625,
				S: 0.125,
				M: 0.125,
				L: 0.125,
				XL: 0.25
			};

		// Assert
		for (var sKey in oAvatarGroupMargins) {
			assert.strictEqual(this.oAvatarGroup._getAvatarMargin(sKey),
				oAvatarGroupMargins[sKey],
				"Avatar margin in Group mode with " + sKey + " size is returned correctly");
		}

		// Act
		this.oAvatarGroup.setGroupType("Individual");

		// Assert
		for (var sKey in oAvatarIndividualMargins) {
			assert.strictEqual(this.oAvatarGroup._getAvatarMargin(sKey),
				oAvatarIndividualMargins[sKey],
				"Avatar margin in Group mode with " + sKey + " size is returned correctly");
		}
	});

	QUnit.test("_onResize showing the ShowMoreButton", async function (assert) {
		// Arrange
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		this.stub(this.oAvatarGroup, "_getWidth").returns(120);

		// Act
		this.oAvatarGroup._onResize();

		// Assert
		assert.strictEqual(this.oAvatarGroup._bShowMoreButton, true, "Show more button should be shown");
		assert.strictEqual(this.oAvatarGroup._bAutoWidth, false, "Auto width is false");
		assert.strictEqual(this.oAvatarGroup._oShowMoreButton.getText(), "+3", "Text of show more button should be '+3'");
	});

	QUnit.test("_onResize not showing the ShowMoreButton", async function (assert) {
		// Arrange
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		this.stub(this.oAvatarGroup, "_getWidth").returns(1000);

		// Act
		this.oAvatarGroup._onResize();

		// Assert
		assert.equal(this.oAvatarGroup._bShowMoreButton, false, "Show more button should not be shown");
		assert.strictEqual(this.oAvatarGroup._bAutoWidth, true, "Auto width is true");
		assert.strictEqual(this.oAvatarGroup._oShowMoreButton.getText(), "", "Show more button should not have text");
	});

	QUnit.test("_onResize does not invalidates infinitely when control is not visible", async function (assert) {
		// Arrange
		var oSpy;
		this.oPage = new Page({
			content: [ this.oAvatarGroup ]
		});
		this.oPage.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oSpy = this.spy(this.oAvatarGroup, "invalidate");

		// Act
		this.oPage.$().css("display", "none");
		this.oAvatarGroup._onResize(); // Not waiting for ResizeHandler

		// Assert
		assert.ok(oSpy.notCalled, "AvatarGroup is not invalidated, when parent gets hidden");

		// Clean up
		oSpy.restore();
		this.oPage.destroy();
	});

	QUnit.test("non-interactive AvatarGroup - using _interactive property", async function (assert) {
		//Arrange
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		this.oAvatarGroup._setInteractive(false);
		var oFirePressSpy = this.spy(this.oAvatarGroup, "firePress");
		await nextUIUpdate();

		// Act
		this.oAvatarGroup.ontap();

		// Assert
		assert.strictEqual(oFirePressSpy.callCount, 0, "firePress event is not fired");
		var iTabbaleAvatars = this.oAvatarGroup.getDomRef().querySelectorAll('.sapFAvatarGroupItem[tabindex="-1"]').length;
		assert.strictEqual(iTabbaleAvatars, 0, "Avatars are not included in the tab chain");
	});
});