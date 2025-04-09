/*global QUnit */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/library",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/core/Control",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes"
],
function (
	Card,
	CardHeader,
	fLibrary,
	Text,
	TextArea,
	Control,
	QUnitUtils,
	nextUIUpdate,
	KeyCodes
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const SemanticRole = fLibrary.cards.SemanticRole;

	/**
	 * In each test using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each test another rendering cycle is executed which will clear any
	 * pending fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 */
	async function afterEach() {
		await nextUIUpdate(this.clock);
	}

	function createCard(HeaderType) {
		var oCard = new Card("somecard", {
			tooltip: 'Some tooltip',
			header: new HeaderType({ title: "Title" }),
			content: new Text({ text: "Text" })
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);

		return oCard;
	}

	QUnit.module("Init", {
		afterEach
	});

	QUnit.test("Initialization", async function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oCard.getDomRef(), "The card is rendered");
		assert.ok(oCard.getHeader().getDomRef(), "Card header should be rendered.");
		assert.ok(oCard.getContent().getDomRef(), "Card content should be rendered.");
		assert.strictEqual(oCard.$().attr('title'), "Some tooltip", "Tooltip is rendered");

		oCard.destroy();
	});

	QUnit.test("Card has correct class when header is not visible", async function (assert) {
		// Arrange
		var oCard = createCard(CardHeader);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oCard.getCardHeader().getVisible(), true, "Card's header is visible");
		assert.strictEqual(oCard.getDomRef().classList.contains("sapFCardNoHeader"), false, "Card does not have class sapFCardNoHeader");

		// Act
		oCard.getCardHeader().setVisible(false);
		this.clock.tick(100);

		// Assert
		assert.strictEqual(oCard.getCardHeader().getVisible(), false, "Card's header is not visible");
		assert.strictEqual(oCard.getDomRef().classList.contains("sapFCardNoHeader"), true, "Card has class sapFCardNoHeader");

		oCard.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("Accessibility", {
		afterEach
	});

	QUnit.test("Empty card", async function (assert) {

		// Arrange
		var oCard = new Card();

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		assert.ok(oCard.getDomRef().getAttribute("aria-labelledby"), "aria-labelledby is set");

		oCard.destroy();
	});

	QUnit.module("Custom header", {
		before: function () {
			this.CustomHeader = Control.extend("test.sap.f.card.CustomHeader", {
				metadata: {
					interfaces: ["sap.f.cards.IHeader"]
				},
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						oRm.openStart("div", oControl).openEnd().close("div");
					}
				}
			});
		},
		afterEach
	});

	QUnit.test("Card with custom header", function (assert) {
		// Arrange
		var oCard = new Card({
			header: new this.CustomHeader()
		});

		try {
			oCard.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync(); // TODO rendering async here might not allow to catch errors
			assert.ok(true, "Card with custom header is successfully rendered");

		} catch (e) {
			assert.ok(false, "Couldn't render card with custom header. " + e.message);
		}

		oCard.destroy();
	});

	QUnit.test("Card with invisible header", async function (assert) {
		// Arrange
		var oHeader = new CardHeader({
			title: "Invisible Title",
			visible: false
		});
		var oCard = new Card({
			id: "invisibleHeaderCard",
			header: oHeader
		});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		const aIds = oCard.getDomRef().getAttribute("aria-labelledby").split(" ");
		assert.strictEqual(document.getElementById(aIds[0]).id, "invisibleHeaderCard-invisibleTitle", "Aria labelled by has correct id.");
		assert.strictEqual(document.getElementById(aIds[0]).innerText, "Invisible Title", "Aria label for card invisible header is correct.");

		oCard.destroy();
		oHeader.destroy();
	});

	QUnit.module("Semantic Role = ListItem", {
		beforeEach: function () {
			this.clock.restore();
		}
	});

	QUnit.test("Rendering and press events", async function (assert) {
		// Arrange
		var fnCardPressHandler = this.stub();
		var fnHeaderPressHandler = this.stub();

		var oHeader = new CardHeader({
			title: "sap.f.Card with Card and Header Action",
			press: fnHeaderPressHandler
		});

		var oCard = new Card({
			semanticRole: SemanticRole.ListItem,
			header: oHeader,
			content: [
				new Text({ text: "Card Content" })
			],
			press: fnCardPressHandler
		});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		assert.strictEqual(oCard.getDomRef().getAttribute("role"), "listitem", "Card has correct role attribute");

		QUnitUtils.triggerMouseEvent(oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), "tap");
		assert.ok(fnHeaderPressHandler.callCount === 1, "Card header is clicked and header press event is fired");
		assert.ok(fnCardPressHandler.callCount === 0, "Card header is clicked and card press event is not fired");

		QUnitUtils.triggerMouseEvent(oCard.getContent().getDomRef(), "tap");
		assert.ok(fnCardPressHandler.callCount === 1, "Card content is clicked and card press event is fired");

		oCard.destroy();
	});

	QUnit.module("Keyboard handling", {
		beforeEach: function () {
			this.clock.restore();
		}
	});

	QUnit.test("Preventing default action of 'Space' keydown", async function (assert) {
		// Arrange
		const oTextArea = new TextArea();
		const oCard = new Card({
			content: [
				oTextArea
			]
		});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oCardEvent = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			keyCode: KeyCodes.SPACE
		});
		const oTextAreaEvent = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			keyCode: KeyCodes.SPACE
		});

		// Act
		oCard.getDomRef().dispatchEvent(oCardEvent);
		oTextArea.getDomRef().dispatchEvent(oTextAreaEvent);

		// Assert
		assert.strictEqual(oCardEvent.defaultPrevented, true, "Default action of 'Space' keydown is prevented on card");
		assert.strictEqual(oTextAreaEvent.defaultPrevented, false, "Default action of 'Space' keydown is not prevented on TextArea");

		oCard.destroy();
	});
});