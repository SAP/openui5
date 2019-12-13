/*global QUnit, sinon */

sap.ui.define([
	"sap/f/AvatarGroup",
	"sap/f/AvatarGroupItem",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes"
],
function (
	AvatarGroup,
	AvatarGroupItem,
	Core,
	KeyCodes
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		sControlId = "AvatarGroupId";

	function createAvatarGroup(oProps, sId) {
		var sId = sId || sControlId;

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

	QUnit.test("Rendering", function (assert) {

		// Arrange
		var oAvatarGroup = new AvatarGroup({}),
			$oDomRef;

		// Act
		oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
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
		Core.applyChanges();

		// Assert
		assert.ok($oDomRef.hasClass("sapFAvatarGroupIndividual"),
			"The AvatarGroup has 'sapFAvatarGroupIndividual' class when groupType property is 'Individual'");

		// Clean up
		oAvatarGroup.destroy();
	});

	QUnit.module("Rendering different sizes", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("AvatarGroup with avatarDisplaySize set to 'XS' then to 'L'", function (assert) {
		// Arrange
		var $oDomRef;
		this.oAvatarGroup.setAvatarDisplaySize("XS");
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		$oDomRef = this.oAvatarGroup.$();
		assert.ok($oDomRef.hasClass("sapFAvatarGroupXS"), "The AvatarGroup has 'sapFAvatarGroupXS' class");

		this.oAvatarGroup.getItems().forEach(function (oItem) {
			assert.ok(oItem.$().hasClass("sapFAvatarGroupItemXS"), "The AvatarGroupItem has 'sapFAvatarGroupItemXS' class");
		});

		// Act
		this.oAvatarGroup.setAvatarDisplaySize("L");
		Core.applyChanges();

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

	QUnit.test("Avatar theme changing logic", function (assert) {
		var oSpy = sinon.spy(this.oAvatarGroup, "_onResize");

		this.oAvatarGroup.onThemeChanged({ theme: "mock" });

		assert.strictEqual(oSpy.callCount, 1, "_onResize method was called");

		oSpy.restore();
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

	QUnit.test("AvatarGroupItems groupType", function (assert) {
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
		Core.applyChanges();

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
		var oSpy = sinon.spy(this.oAvatarGroup, "ontap");

		// Act
		this.oAvatarGroup.onsapenter({});

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Enter key press calls ontap");

		// Act
		this.oAvatarGroup.onsapspace({});

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "Space key press calls ontap");

		// Clean up
		oSpy.restore();
	});

	QUnit.test("ontap", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oAvatarGroup, "firePress");

		// Act
		this.oAvatarGroup.ontap({ srcControl: this.oAvatarGroup });

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "firePress event is fired");

		// Clean up
		oSpy.restore();
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
				XS: 0.75,
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
			assert.strictEqual(this.oAvatarGroup._getAvatarMargin(sKey),oAvatarGroupMargins[sKey],
				"Avatar margin in Group mode with " + sKey + " size is returned correctly");
		}

		// Act
		this.oAvatarGroup.setGroupType("Individual");

		// Assert
		for (var sKey in oAvatarIndividualMargins) {
			assert.strictEqual(this.oAvatarGroup._getAvatarMargin(sKey),oAvatarIndividualMargins[sKey],
				"Avatar margin in Group mode with " + sKey + " size is returned correctly");
		}
	});

	QUnit.test("_onResize showing the ShowMoreButton", function (assert) {
		// Arrange
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oStub = sinon.stub(this.oAvatarGroup, "_getWidth", function () {
			return 120;
		});

		// Act
		this.oAvatarGroup._onResize();

		// Assert
		assert.strictEqual(this.oAvatarGroup._bShowMoreButton, true, "Show more button should be shown");
		assert.strictEqual(this.oAvatarGroup._bAutoWidth, false, "Auto width is false");
		assert.strictEqual(this.oAvatarGroup._oShowMoreButton.getText(), "+3", "Text of show more button should be '+3'");

		// Clean up
		oStub.restore();
	});

	QUnit.test("_onResize not showing the ShowMoreButton", function (assert) {
		// Arrange
		this.oAvatarGroup.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oStub = sinon.stub(this.oAvatarGroup, "_getWidth", function () {
			return 1000;
		});

		// Act
		this.oAvatarGroup._onResize();

		// Assert
		assert.equal(this.oAvatarGroup._bShowMoreButton, false, "Show more button should not be shown");
		assert.strictEqual(this.oAvatarGroup._bAutoWidth, true, "Auto width is true");
		assert.strictEqual(this.oAvatarGroup._oShowMoreButton.getText(), "", "Show more button should not have text");

		// Clean up
		oStub.restore();
	});

});