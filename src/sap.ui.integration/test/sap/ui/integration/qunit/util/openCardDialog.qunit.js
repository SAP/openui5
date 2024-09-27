/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], (
	Card,
	openCardDialog,
	nextUIUpdate,
	nextCardReadyEvent
) => {
	"use strict";
	const DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("openCardDialog", {
		beforeEach: async function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						id: "test.card"
					},
					"sap.card": {
						type: "List",
						data: {
							json: []
						},
						content: {
							item: {
								title: "{title}"
							}
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("min and max dimensions", async function (assert) {
		// Act
		const oDialog = openCardDialog(this.oCard, {
			manifest: {
				"sap.app": {
					id: "test.card"
				},
				"sap.card": {
					type: "Table",
					data: {
						json: []
					},
					content: {
						row: {
							columns: [
								{
									title: "Sales Order",
									value: "{product}"
								}
							]
						}
					}
				}
			}
		});

		const oCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		const oCardDomRef = oCard.getDomRef();
		const oMainCardDomRef = this.oCard.getDomRef();
		const oWithinAreaDimensions = oDialog._getAreaDimensions();

		// Assert
		assert.strictEqual(oCardDomRef.style.minHeight, oMainCardDomRef.offsetHeight + "px",  "min height equals main card height");
		assert.strictEqual(oCardDomRef.style.minWidth, oMainCardDomRef.offsetWidth + "px",  "min width equals main card width");
		assert.strictEqual(oCardDomRef.style.maxHeight, oWithinAreaDimensions.height * 70 / 100 + "px",  "max height is 70% of the within area height");
		assert.strictEqual(oCardDomRef.style.maxWidth, oWithinAreaDimensions.width * 70 / 100 + "px",  "max width is 70% of the within area width");
	});
});