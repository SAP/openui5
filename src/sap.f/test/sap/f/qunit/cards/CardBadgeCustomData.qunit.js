/*global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/ui/core/CustomData",
	"sap/f/cards/CardBadgeCustomData",
	"sap/m/BadgeCustomData",
	"sap/f/library",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
],
function (
	Lib,
	Card,
	CardHeader,
	CustomData,
	CardBadgeCustomData,
	BadgeCustomData,
	fLibrary,
	Text,
	nextUIUpdate,
	Element
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const CardBadgeVisibilityMode = fLibrary.CardBadgeVisibilityMode;
	/**
	 * In each test using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each test another rendering cycle is executed which will clear any
	 * pending fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 */
	async function afterEach() {
		this.oCard.destroy();
		await nextUIUpdate(this.clock);
	}

	QUnit.module("Card Badge", {
		beforeEach:  function () {
			this.oCard = new Card({
				header: new CardHeader({ title: "Title" }),
				content: new Text({ text: "Text" })
			});

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: afterEach
	});

	QUnit.test("Properties", async function (assert) {
		// Arrange
		const sValue = "New",
			sIcon = "sap-icon://pushpin-off",
			sColor = "Indication04";

		this.oCard.addCustomData(new CardBadgeCustomData({value: sValue, icon: sIcon, state: sColor}));
		await nextUIUpdate(this.clock);

		const aCardBadges = this.oCard.getAggregation("_cardBadges");

		// Assert
		assert.strictEqual(aCardBadges[0].getText(), sValue, "Badge value is correctly set");
		assert.strictEqual(aCardBadges[0].getIcon(), sIcon, "Badge icon is correctly set");
		assert.strictEqual(aCardBadges[0].getState(), sColor, "Badge state is correctly set");
	});

	QUnit.test("Setters and updated card badge", async function (assert) {
		// Arrange
		const sValue = "New",
			sIcon = "sap-icon://pushpin-off",
			sColor = "Indication04",
			bVisible = false,
			sStateText = "Card is Updated";

		this.oCard.addCustomData(new CardBadgeCustomData({value: "Update"}));
		await nextUIUpdate(this.clock);
		this.oCard._getCardBadgeCustomData()[0].setValue(sValue);
		this.oCard._getCardBadgeCustomData()[0].setIcon(sIcon);
		this.oCard._getCardBadgeCustomData()[0].setState(sColor);
		this.oCard._getCardBadgeCustomData()[0].setVisible(bVisible);
		this.oCard._getCardBadgeCustomData()[0].setAnnouncementText(sStateText);

		const aCardBadges = this.oCard.getAggregation("_cardBadges");

		// Assert
		assert.strictEqual(aCardBadges[0].getText(), sValue, "Badge value is correctly set");
		assert.strictEqual(aCardBadges[0].getIcon(), sIcon, "Badge icon is correctly set");
		assert.strictEqual(aCardBadges[0].getState(), sColor, "Badge state is correctly set");
		assert.strictEqual(aCardBadges[0].getVisible(), false, "Badge visibility is correctly set");
		assert.strictEqual(aCardBadges[0].getStateAnnouncementText(), sStateText, "Badge visibility is correctly set");
	});

	QUnit.test("Auto hide - visibilityMode", async function (assert) {
		// Arrange
		const sValue = "New",
			sIcon = "sap-icon://pushpin-off";

		this.oCard.addCustomData(new CardBadgeCustomData({icon: sIcon }));
		this.oCard.addCustomData(new CardBadgeCustomData({value: sValue, visibilityMode: CardBadgeVisibilityMode.Persist}));
		await nextUIUpdate(this.clock);

		var $cardBadges = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.strictEqual($cardBadges.length, 2, "CardBadges are rendered");

		this.oCard.focus();
		this.clock.tick(4000);

		var $cardBadges = this.oCard.$().find(".sapMObjStatus");
		assert.strictEqual($cardBadges.length, 1, "Card badge  with visibilityMode: 'Persist' is not hidden");
	});

	QUnit.test("cards badge is not rendered", function (assert) {
		// Arrange
		var $cardBadge = this.oCard.$();

		// Assert
		assert.strictEqual($cardBadge.find(".sapFCardBadgePlaceholder").length, 0, "Placeholder is not rendered");
		assert.notOk($cardBadge.attr("aria-describedby"), "Invisible text is not rendered");
	});

	QUnit.test("BadgeCustomData - rendering", async function (assert) {
		// Arrange
		const sValue = "New",
			sNewValue = "Updated";

		this.oCard.addCustomData(new BadgeCustomData({value: sValue }));
		await nextUIUpdate(this.clock);
		const $cardBadge = this.oCard.$();

		// Assert
		assert.strictEqual($cardBadge.find(".sapMObjStatus").length, 1, "Badge from BadgeCustomData is rendered");

		this.oCard.getBadgeCustomData().setValue(sNewValue);

		assert.strictEqual(this.oCard._getCardBadges()[0].getText(), sNewValue, "BadgeCustomData updates value correctly the ObjectStatus");

		this.oCard.getBadgeCustomData().setVisible(false);

		assert.strictEqual(this.oCard._getCardBadges()[0].getVisible(), false, "BadgeCustomData updates visible correctly the ObjectStatus");
	});

	QUnit.test("BadgeCustomData -  auto hide", async function (assert) {
		// Arrange
		const sValue = "New";

		this.oCard.addCustomData(new BadgeCustomData({value: sValue }));
		await nextUIUpdate(this.clock);

		this.oCard.focus();
		this.clock.tick(4000);
		const $cardBadge = this.oCard.$();

		// Assert
		assert.strictEqual($cardBadge.find(".sapMObjStatus").length, 0, "Badge from BadgeCustomData is hidden");
	});

	QUnit.test("Accessibility", async function (assert) {
		// Arrange
		const sIcon = "sap-icon://pushpin-off";

		this.oCard.addCustomData(new CardBadgeCustomData({icon: sIcon }));
		await nextUIUpdate(this.clock);

		const $card = this.oCard.$(),
			sAriaId = $card.attr("aria-describedby"),
			oInvText = Element.getElementById(sAriaId);

		// Assert
		assert.ok(sAriaId, "Attribute is added to card");
		assert.equal(oInvText.getText(), this.oCard._getCardBadgeAccessibilityText(), "Accessibility text is set correctly.");
	});

	QUnit.test("Accessibility - announcementText", async function (assert) {
		// Arrange
		const sValue = "New",
			sIcon = "sap-icon://pushpin-off",
			SAnnText = "Newly created card";

		this.oCard.addCustomData(new CardBadgeCustomData({icon: sIcon }));
		this.oCard.addCustomData(new CardBadgeCustomData({value: sValue, announcementText: SAnnText}));
		await nextUIUpdate(this.clock);

		const $card = this.oCard.$(),
			sAriaId = $card.attr("aria-describedby"),
			oInvText = Element.getElementById(sAriaId);

		// Assert
		assert.ok(sAriaId, "Attribute is added to card");
		assert.ok(oInvText.getText().indexOf(SAnnText) > -1, "Accessibility text is set correctly.");

		this.oCard.focus();
		this.clock.tick(4000);

		// Assert
		assert.notOk(oInvText.getText().indexOf(SAnnText) > 0, "Accessibility text is updated correctly.");

	});

	QUnit.module("Adding, removing and updating badges wtih custom data", {
		beforeEach:  function () {
			this.oCard = new Card({
				header: new CardHeader({ title: "Title" }),
				content: new Text({ text: "Text" })
			});
		},
		afterEach: afterEach
	});

	QUnit.test("Inserting custom data", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const sValue1 = "One",
			sValue2 = "Two",
			sValue3 = "Three";

		const customData = new CardBadgeCustomData({value: sValue1}),
			customData2 = new CardBadgeCustomData({value: sValue2}),
			customData3 = new CardBadgeCustomData({value: sValue3});

		this.oCard.addCustomData(customData);
		this.oCard.insertCustomData(customData3, 0);
		this.oCard.insertCustomData(customData2, 1);
		await nextUIUpdate(this.clock);

		const aCardBadges = this.oCard.getAggregation("_cardBadges");
		const index = this.oCard.indexOfCustomData(customData);

		// Assert
		assert.strictEqual(aCardBadges[0].getText(), sValue3, "Badge3 is correctly inserted at position 0");
		assert.strictEqual(aCardBadges[1].getText(), sValue2, "Badge2 is correctly inserted at position 1");
		assert.strictEqual(index, 2, "Badge1 is correctly inserted at the end");
	});

	QUnit.test("Updating badges invisible text when badge is added after rendering", async function (assert) {
		// Arrange
		const customData = new CardBadgeCustomData({value: "first"});
		customData.setAnnouncementText("first");
		this.oCard.addCustomData(customData);

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const customData1 = new CardBadgeCustomData({value: "second"});
		customData1.setAnnouncementText("second");

		this.oCard.addCustomData(customData1);
		await nextUIUpdate(this.clock);

		const $card = this.oCard.$(),
			sAriaId = $card.attr("aria-describedby"),
			text = document.getElementById(sAriaId).textContent,
			expectedText = " " + customData.getAnnouncementText() + " " + customData1.getAnnouncementText();

		// Assert
		assert.equal(text, expectedText, "Accessibility text is updated correctly.");
	});

	QUnit.test("Adding custom data one after another", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const customData = new CardBadgeCustomData({value: "Old"});
		this.oCard.addCustomData(customData);
		await nextUIUpdate(this.clock);

		const $cardBadges = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges.length === 1, "First badge is rendered");

		// Arrange
		const customData2 = new CardBadgeCustomData({value: "New"});
		this.oCard.addCustomData(customData2);
		await nextUIUpdate(this.clock);

		const $cardBadges1 = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges1.length === 2, "Second badge is rendered");
	});

	QUnit.test("Removing custom data", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const customData = new CardBadgeCustomData({value: "Test"});
		this.oCard.addCustomData(customData);
		await nextUIUpdate(this.clock);

		const $cardBadges = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges.length === 1, "Badge is rendered");

		// Arrange
		this.oCard.removeCustomData(customData);
		await nextUIUpdate(this.clock);

		const $cardBadges1 = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges1.length === 0, "Badge is removed");
	});

	QUnit.test("Destroying custom data", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const customData = new CardBadgeCustomData({value: "Test"});
		this.oCard.addCustomData(customData);
		await nextUIUpdate(this.clock);

		const $cardBadges = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges.length === 1, "Badge is rendered");

		// Arrange
		this.oCard.destroyCustomData(customData);
		await nextUIUpdate(this.clock);

		const $cardBadges1 = this.oCard.$().find(".sapMObjStatus");
		// Assert
		assert.ok($cardBadges1.length === 0, "Badge is destroyed");
	});

	QUnit.test("Updating badge property before card is rendered", async function (assert) {
		// Arrange
		const customData = new CardBadgeCustomData({value: "Test"});
		this.oCard.addCustomData(customData);

		customData.setValue("Updated");

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const $cardBadges = this.oCard.$().find(".sapMObjStatus");
		const sCardBadgeText = this.oCard.$().find(".sapMObjStatusText").text();

		await nextUIUpdate(this.clock);

		// Assert
		assert.ok($cardBadges.length === 1, "Badge is rendered");
		assert.strictEqual(sCardBadgeText, "Updated", "Badge has correct value");
	});

	QUnit.test("Add custom data which is not CardBadgeCustomData", async function (assert) {
		// Arrange
		const oCustomData1 = new CustomData({value: "Not a badge 1"});
		this.oCard.addCustomData(oCustomData1);

		const oBadge1 = new CardBadgeCustomData({value: "Badge 1"}),
			oBadge2 = new CardBadgeCustomData({value: "Badge 2"});

		this.oCard.addCustomData(oBadge2);
		await nextUIUpdate(this.clock);

		const oCustomData2 = new CustomData({value: "Not a badge 2"});
		this.oCard.addCustomData(oCustomData2);

		this.oCard.insertCustomData(oBadge1, 0);

		// Assert
		const aCustomData = this.oCard.getCustomData();
		assert.strictEqual(aCustomData.length, 4, "There are 4 custom data.");

		assert.strictEqual(aCustomData[0].getValue(), "Badge 1", "Custom data at position 0 is correct.");
		assert.strictEqual(aCustomData[1].getValue(), "Not a badge 1", "Custom data at position 1 is correct.");
		assert.strictEqual(aCustomData[2].getValue(), "Badge 2", "Custom data at position 2 is correct.");
		assert.strictEqual(aCustomData[3].getValue(), "Not a badge 2", "Custom data at position 3 is correct.");

		const aCardBadges = this.oCard.getAggregation("_cardBadges");
		assert.strictEqual(aCardBadges.length, 2, "There are 2 badges.");

		assert.strictEqual(aCardBadges[0].getText(), "Badge 1", "Badge at position 0 is correct.");
		assert.strictEqual(aCardBadges[1].getText(), "Badge 2", "Badge data at position 1 is correct.");
	});

	QUnit.module("Destroying the card");

	QUnit.test("Destroying the card destroyes badge related objects", async function (assert) {
		// Arrange
		const oCard = new Card({
			header: new CardHeader({ title: "Title" }),
			content: new Text({ text: "Text" })
		});

		oCard.addCustomData(new CardBadgeCustomData({value: "Test"}));
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const oObserver = oCard._customDataObserver;
		const aCardBadges = oCard.getAggregation("_cardBadges");
		const oInvisibleText = oCard.getAggregation("_oInvisibleCardBadgeText");

		// Act
		oCard.destroy();
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oObserver.isObserved(oCard), "Obeserver is destroyed.");
		assert.notOk(oCard._customDataObserver, "Obeserver is not there.");

		assert.ok(aCardBadges[0].isDestroyed(), "Card badge is destroyed.");
		assert.notOk(oCard.getAggregation("_cardBadges"), "Card badges aggregation is cleared.");

		assert.ok(oInvisibleText.isDestroyed(), "Card badges invisible text is destroyed.");
		assert.notOk(oCard.getAggregation("_oInvisibleCardBadgeText"), "Card badges invisible text aggregation is cleared.");
	});

	QUnit.test("Destroying the card and creating it again with same id", async function (assert) {
		// Arrange
		const oRb = Lib.getResourceBundleFor("sap.f");
		const oCard = new Card("myCard", {
			header: new CardHeader({ title: "Title" }),
			content: new Text({ text: "Text" })
		});

		oCard.addCustomData(new CardBadgeCustomData({value: "Test"}));
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act - destroy
		oCard.destroy();
		await nextUIUpdate(this.clock);

		// Act - create second card
		const oCard2 = new Card("myCard", {
			header: new CardHeader({ title: "Title" }),
			content: new Text({ text: "Text" })
		});

		oCard2.addCustomData(new CardBadgeCustomData({value: "Test"}));
		oCard2.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const $card = oCard2.$(),
			sAriaId = $card.attr("aria-describedby"),
			text = document.getElementById(sAriaId).textContent,
			expectedText = " " + oRb.getText("CARD_BADGE", ["Test"]);

		// Assert
		assert.equal(text, expectedText, "Accessibility text is updated correctly.");
	});
});