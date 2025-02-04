/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/openCardShowMore",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextDialogAfterOpenEvent"
], (
	Card,
	openCardShowMore,
	nextCardReadyEvent,
	nextDialogAfterOpenEvent
) => {
	"use strict";
	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oTestManifest1 = {
		"sap.app": {
			id: "test.card"
		},
		"sap.card": {
			type: "List",
			data: {
				json: []
			},
			configuration: {
				filters: {
					productCategory: {
						value: "Notebooks",
						type: "Select",
						items: [
							{
								title: "All",
								key: "all"
							},
							{
								title: "Notebooks",
								key: "Notebooks"
							}
						]
					}
				}
			},
			header: {
				title: "Test Card"
			},
			content: {
				item: {
					title: "{title}"
				}
			}
		}
	};

	QUnit.module("openCardShowMore", {
		beforeEach: async function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: oTestManifest1
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Opens the same card with correct manifest", async function (assert) {
		// Arrange
		const oCard = this.oCard;
		const oDialog = openCardShowMore(oCard);

		await nextDialogAfterOpenEvent(oDialog);

		const oChildCard = oDialog.getContent()[0];
		const oChildManifest = oChildCard.getManifestEntry("/");

		// Assert
		assert.strictEqual(oChildCard.getBaseUrl(), oCard.getBaseUrl(), "Base url is correct.");
		assert.notStrictEqual(oChildManifest["sap.app"].id, oTestManifest1["sap.app"].id, "Id is changed.");
		assert.deepEqual(oChildManifest["sap.card"], oTestManifest1["sap.card"], "The card manifest is correct.");

		const oExpectedFilterValue = oTestManifest1["sap.card"].configuration.filters.productCategory.value;
		const oChidlCardFilterValue = oChildManifest["sap.card"].configuration.filters.productCategory.value;

		assert.strictEqual(oExpectedFilterValue, oChidlCardFilterValue, "The filter value is correct.");
	});
});