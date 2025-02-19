/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/m/VBox",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], (
	library,
	Card,
	VBox,
	QUnitUtils,
	nextUIUpdate,
	nextCardReadyEvent
) => {
	"use strict";
	const {CardOverflow} = library;

	const DOM_RENDER_LOCATION = "qunit-fixture";

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

	QUnit.module("Prevent keyboard scrolling", {
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
		await nextUIUpdate();

		const oList = oCard.getCardContent().getInnerList();

		oList.focus();

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		oCard.getCardContent()._oOverflowHandler._oPreventKeyboardScrolling._scroll(); // @todo the scroll event should be fired, but is not

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		oCard.getCardContent()._oOverflowHandler._oPreventKeyboardScrolling._scroll();

		// Assert
		const oFooter = oCard.getCardFooter();
		const oShowMore = oFooter.getAggregation("_showMore");
		const oContentSection = oCard.getDomRef("contentSection");

		assert.strictEqual(oContentSection.scrollTop, 0, "The content is not scrolled");
		assert.strictEqual(oShowMore.getDomRef(), document.activeElement, "The focus is on the show more button.");

		// Clean up
		vBox.destroy();
	});
});