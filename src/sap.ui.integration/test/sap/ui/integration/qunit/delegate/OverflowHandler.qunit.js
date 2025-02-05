/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/util/Deferred",
	"sap/ui/integration/widgets/Card",
	"sap/m/VBox",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextDialogAfterOpenEvent"
], (
	library,
	Deferred,
	Card,
	VBox,
	nextCardReadyEvent,
	nextDialogAfterOpenEvent
) => {
	"use strict";
	const DOM_RENDER_LOCATION = "qunit-fixture";

	const CardOverflow = library.CardOverflow;

	const fnNextFooterAfterRendered = async function (oFooter) {
		const oAfterFooterRendered = new Deferred();
		oFooter.addEventDelegate({
			onAfterRendering: function () {
				oAfterFooterRendered.resolve();
			}
		});

		await oAfterFooterRendered.promise;
	};

	const oTestManifest1 = {
		"sap.app": {
			"id": "test.card.overflowHandler.sample1"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": [
					{
						"Name": "Career",
						"icon": "sap-icon://leads"
					},
					{
						"Name": "Company Directory",
						"icon": "sap-icon://address-book"
					},
					{
						"Name": "Development Plan",
						"icon": "sap-icon://activity-items"
					},
					{
						"Name": "Business Goals",
						"icon": "sap-icon://target-group"
					}
				]
			},
			"header": {
				"title": "Test Card"
			},
			"content": {
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": "{Name}"
				}
			}
		}
	};

	const oTestManifest2 = {
		"sap.app": {
			"id": "test.card.overflowHandler.sample2"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": [
					{
						"Name": "Career",
						"icon": "sap-icon://leads"
					},
					{
						"Name": "Company Directory",
						"icon": "sap-icon://address-book"
					},
					{
						"Name": "Development Plan",
						"icon": "sap-icon://activity-items"
					},
					{
						"Name": "Business Goals",
						"icon": "sap-icon://target-group"
					}
				]
			},
			"header": {
				"title": "Test Card"
			},
			"content": {
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": "{Name}"
				}
			},
			"footer": {
				"actionsStrip": [
					{
						"type": "Link",
						"text": "Agenda",
						"icon": "sap-icon://action"
					},
					{
						"text": "Approve"
					}
				]
			}
		}
	};

	QUnit.module("Fixed height", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: oTestManifest1,
				overflow: CardOverflow.ShowMore
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("When space is not enough", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		oCard.setHeight("100%");

		const vBox = new VBox({
			height: "150px",
			renderType: "Bare",
			items: [oCard]
		});

		// Act
		vBox.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);

		const oFooter = oCard.getCardFooter();
		await fnNextFooterAfterRendered(oFooter);

		// Assert
		assert.ok(oFooter, "The card has a footer.");
		assert.ok(oFooter.getVisible(), "The footer is visible.");
		assert.ok(oFooter.getAggregation("_showMore")?.getVisible(), "The card has a visible show more button.");
		assert.ok(oCard.hasStyleClass("sapUiIntCardIsOverflowing"), "The card has the correct class.");

		// Clean up
		vBox.destroy();
	});

	QUnit.test("When space is not enough press the show more", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		oCard.setHeight("100%");

		const vBox = new VBox({
			height: "150px",
			renderType: "Bare",
			items: [oCard]
		});

		// Act
		vBox.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);

		const oFooter = oCard.getCardFooter();
		await fnNextFooterAfterRendered(oFooter);

		oFooter.getAggregation("_showMore").firePress();

		// Assert
		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextDialogAfterOpenEvent(oDialog);

		assert.deepEqual(oSnackCard.getManifestEntry("/sap.card"), oCard.getManifestEntry("/sap.card"), "The show more card is opened with the correct manifest.");

		// Clean up
		vBox.destroy();
	});

	QUnit.test("When space is enough", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		oCard.setHeight("100%");

		const vBox = new VBox({
			height: "1000px",
			renderType: "Bare",
			items: [oCard]
		});

		// Act
		vBox.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);

		const oFooter = oCard.getCardFooter();

		// Assert
		assert.ok(oFooter, "The card has a footer.");
		assert.notOk(oFooter.getVisible(), "The footer is not visible.");
		assert.notOk(oFooter.getAggregation("_showMore")?.getVisible(), "The card has no visible show more button.");
		assert.notOk(oCard.hasStyleClass("sapUiIntCardIsOverflowing"), "The card has the correct class.");

		// Clean up
		vBox.destroy();
	});

	QUnit.module("Fixed height and footer with actions", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: oTestManifest2,
				overflow: CardOverflow.ShowMore
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("When space is not enough", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		oCard.setHeight("100%");

		const vBox = new VBox({
			height: "150px",
			renderType: "Bare",
			items: [oCard]
		});

		// Act
		vBox.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);

		const oFooter = oCard.getCardFooter();
		await fnNextFooterAfterRendered(oFooter);

		// Assert
		assert.ok(oFooter, "The card has a footer.");
		assert.ok(oFooter.getVisible(), "The footer is visible.");
		assert.ok(oFooter.getAggregation("_showMore")?.getVisible(), "The card has a visible show more button.");
		assert.ok(oCard.hasStyleClass("sapUiIntCardIsOverflowing"), "The card has the correct class.");

		// Clean up
		vBox.destroy();
	});

	QUnit.test("When space is enough", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		oCard.setHeight("100%");

		const vBox = new VBox({
			height: "1000px",
			renderType: "Bare",
			items: [oCard]
		});

		// Act
		vBox.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);

		const oFooter = oCard.getCardFooter();

		// Assert
		assert.ok(oFooter, "The card has a footer.");
		assert.ok(oFooter.getVisible(), "The footer is visible.");
		assert.notOk(oFooter.getAggregation("_showMore")?.getVisible(), "The card has a visible show more button.");
		assert.notOk(oCard.hasStyleClass("sapUiIntCardIsOverflowing"), "The card has the correct class.");

		// Clean up
		vBox.destroy();
	});
});