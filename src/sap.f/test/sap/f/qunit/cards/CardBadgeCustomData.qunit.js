/*global QUnit */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/CardBadgeCustomData",
	"sap/m/BadgeCustomData",
	"sap/f/library",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
],
function (
	Card,
	CardHeader,
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
		beforeEach: function () {
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
});