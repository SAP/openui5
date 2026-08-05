/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/util/Deferred",
	"sap/ui/integration/widgets/Card",
	"sap/m/VBox",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/ui/integration/delegate/OverflowHandler"
], (
	library,
	Deferred,
	Card,
	VBox,
	QUnitUtils,
	nextUIUpdate,
	nextCardReadyEvent,
	OverflowHandler
) => {
	"use strict";
	const {CardOverflow} = library;

	const DOM_RENDER_LOCATION = "qunit-fixture";

	function nextFooterAfterRendering(oFooter) {
		const oDeferred = new Deferred();
		oFooter.addEventDelegate({
			onAfterRendering: function () {
				oDeferred.resolve();
			}
		});
		return oDeferred.promise;
	}

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
		beforeEach: async function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: oTestManifest1,
				overflow: CardOverflow.ShowMore
			});

			this.oCard.setHeight("100%");

			this.vBox = new VBox({
				height: "150px",
				renderType: "Bare",
				items: [this.oCard]
			});

			this.oIsOverflowingSpy = this.spy(OverflowHandler.prototype, "_isOverflowing");
			this.vBox.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			const oFooter = this.oCard.getCardFooter();
			await nextFooterAfterRendering(oFooter);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.vBox.destroy();
		}
	});

	QUnit.test("When space is not enough", function (assert) {
		// Arrange
		const oFooter = this.oCard.getCardFooter();
		const oContent = this.oCard.getCardContent();
		const oList = oContent.getInnerList();

		oList.focus();

		assert.ok(this.oIsOverflowingSpy, "The _isOverflowing method is called");

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		oContent._oOverflowHandler._oPreventKeyboardScrolling._scroll(); // @todo the scroll event should be fired, but is not

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		oContent._oOverflowHandler._oPreventKeyboardScrolling._scroll();

		// Assert
		const oShowMore = oFooter.getAggregation("_showMore");
		const oContentSection = this.oCard.getDomRef("contentSection");

		assert.strictEqual(oContentSection.scrollTop, 0, "The content is not scrolled");
		assert.strictEqual(oShowMore.getDomRef(), document.activeElement, "The focus is on the show more button.");
	});
});