/* global QUnit */

sap.ui.define([
	"sap/base/util/Deferred",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], (
	Deferred,
	Card,
	openCardDialog,
	DataProvider,
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

	QUnit.test("max dimensions", async function (assert) {
		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
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
			}
		);

		const oCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		const oCardDomRef = oCard.getDomRef();
		const oWithinAreaDimensions = oDialog._getAreaDimensions();

		// Assert
		assert.strictEqual(oCardDomRef.style.maxHeight, oWithinAreaDimensions.height * 70 / 100 + "px",  "max height is 70% of the within area height");
		assert.strictEqual(oCardDomRef.style.maxWidth, oWithinAreaDimensions.width * 70 / 100 + "px",  "max width is 70% of the within area width");
	});

	QUnit.test("min dimensions", async function (assert) {
		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
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
			},
			true
		);

		const oCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		const oCardDomRef = oCard.getDomRef();
		const oMainCardDomRef = this.oCard.getDomRef();

		// Assert
		assert.strictEqual(oCardDomRef.style.minHeight, oMainCardDomRef.offsetHeight + "px",  "min height equals main card height");
		assert.strictEqual(oCardDomRef.style.minWidth, oMainCardDomRef.offsetWidth + "px",  "min width equals main card width");
	});

	QUnit.test("Busy/loading state of the opener while waiting", async function (assert) {
		// Arrange
		const oGetData = new Deferred();
		const oAfterDialogOpen = new Deferred();
		this.stub(DataProvider.prototype, "getData").returns(oGetData.promise);
		const oDialog = openCardDialog(
			this.oCard,
			{
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
			}
		);
		oDialog.attachEventOnce("afterOpen", oAfterDialogOpen.resolve);

		// Assert
		assert.ok(this.oCard.getBusy(), "Whole card should be busy");
		assert.strictEqual(this.oCard.getBusyIndicatorDelay(), 750, "Delay should be 750ms");

		// Act
		oGetData.resolve();
		await oAfterDialogOpen.promise;

		// Assert
		assert.notOk(this.oCard.getBusy(), "Card should NOT be busy once the dialog is opened");
	});
});