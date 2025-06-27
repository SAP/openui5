/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/m/library"
], (
	Card,
	nextUIUpdate,
	nextCardReadyEvent,
	mLibrary
) => {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Default Header", {
		beforeEach: async function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Basic Header Info Section", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"number": "65.34",
							"unit": "K",
							"trend": "Down",
							"state": "Error",
							"target": {
								"number": 100,
								"unit": "K"
							},
							"deviation": {
								"number": 34.7,
								"state": "Critical"
							},
							"details": "Q1, 2018"
						}
					},
					"title": "Project Cloud Transformation",
					"subTitle": "Revenue",
					"unitOfMeasurement": "EUR",
					"infoSection": {
						"rows": [
							{
								"items": [
									{
										"type": "Status",
										"value": "On Track",
										"state": "Success",
										"inverted": true,
										"showStateIcon": true
									},
									{
										"type": "Status",
										"value": "OKR Relevant",
										"state": "None",
										"inverted": true,
										"showStateIcon": true
									},
									{
										"type": "Status",
										"value": "Goal Template Available",
										"state": "Information",
										"inverted": true,
										"showStateIcon": true
									}
								]
							}
						]
					},
					"mainIndicator": {
						"number": "{number}",
						"unit": "{unit}",
						"trend": "{trend}",
						"state": "{state}"
					},
					"details": "{details}",
					"sideIndicators": [
						{
							"title": "Target",
							"number": "{target/number}",
							"unit": "{target/unit}"
						},
						{
							"title": "Deviation",
							"number": "{deviation/number}",
							"unit": "%",
							"state": "{deviation/state}"
						}
					]
				}
			}
		};
		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.ok(oHeader, "Card should have header.");
		assert.notOk(oHeader.$().hasClass("sapFCardHeaderMainPartOnly"), "sapFCardHeaderMainPartOnly class is not set");
		assert.notOk(oHeader.$().hasClass("sapFCardHeaderLastPart"), "sapFCardHeaderLastPart class is not set");

		const oInfoSection = oHeader.getDomRef().querySelector(".sapFCardHeaderInfoSection");
		assert.ok(oInfoSection, "Info section should be rendered.");

		const aRows = oInfoSection.querySelectorAll(".sapUiIntHeaderInfoSectionRow");
		assert.strictEqual(aRows.length, 1, "One row should be rendered.");
		assert.ok(aRows[0].classList.contains("sapUiIntHeaderInfoSectionItemJustifySpaceBetween"), "Row should have the default justify space class.");

		const aItemsGroups = aRows[0].querySelectorAll(".sapUiIntHeaderInfoSectionItemsGroup");
		assert.strictEqual(aItemsGroups.length, 1, "Row should have one items group.");

		assert.strictEqual(aItemsGroups[0].querySelectorAll(".sapMObjStatus").length, 3, "Group should have 3 items.");
	});

	QUnit.test("Header Info Section with Rows and Columns", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"number": "65.34",
							"unit": "K",
							"trend": "Down",
							"state": "Error",
							"target": {
								"number": 100,
								"unit": "K"
							},
							"deviation": {
								"number": 34.7,
								"state": "Critical"
							},
							"details": "Q1, 2018"
						}
					},
					"title": "Project Cloud Transformation",
					"subTitle": "Revenue",
					"unitOfMeasurement": "EUR",
					"infoSection": {
						"rows": [
							{
								"columns": [
									{
										"items": [
											{
												"type": "Status",
												"value": "On Track",
												"state": "Success",
												"inverted": true,
												"showStateIcon": true
											}
										]
									},
									{
										"items": [
											{
												"type": "Status",
												"value": "OKR Relevant",
												"state": "None",
												"inverted": true,
												"showStateIcon": true
											}
										]
									}
								]
							},
							{
								"justifyContent": "End",
								"items": [
									{
										"type": "Status",
										"value": "Goal Template Available",
										"state": "Information",
										"inverted": true,
										"showStateIcon": true
									}
								]
							}
						]
					},
					"mainIndicator": {
						"number": "{number}",
						"unit": "{unit}",
						"trend": "{trend}",
						"state": "{state}"
					},
					"details": "{details}",
					"sideIndicators": [
						{
							"title": "Target",
							"number": "{target/number}",
							"unit": "{target/unit}"
						},
						{
							"title": "Deviation",
							"number": "{deviation/number}",
							"unit": "%",
							"state": "{deviation/state}"
						}
					]
				}
			}
		};
		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.ok(oHeader, "Card should have header.");

		const oInfoSection = oHeader.getDomRef().querySelector(".sapFCardHeaderInfoSection");
		assert.ok(oInfoSection, "Info section should be rendered.");

		const aRows = oInfoSection.querySelectorAll(".sapUiIntHeaderInfoSectionRow");
		assert.strictEqual(aRows.length, 2, "Two rows should be rendered.");
		assert.ok(aRows[0].classList.contains("sapUiIntHeaderInfoSectionItemJustifySpaceBetween"), "Row should have the default justify space class.");
		assert.ok(aRows[1].classList.contains("sapUiIntHeaderInfoSectionItemJustifyEnd"), "Row should have the correct justify space class.");

		const aRow1Columns = aRows[0].querySelectorAll(".sapUiIntHeaderInfoSectionColumn");
		const aRow2Columns = aRows[1].querySelectorAll(".sapUiIntHeaderInfoSectionColumn");

		assert.strictEqual(aRow1Columns.length, 2, "Row 1 should have 2 columns.");
		assert.strictEqual(aRow2Columns.length, 0, "Row 2 should have no columns.");

		assert.strictEqual(aRow1Columns[0].querySelectorAll(".sapMObjStatus").length, 1, "Column should have one status.");
		assert.strictEqual(aRow1Columns[1].querySelectorAll(".sapMObjStatus").length, 1, "Column should have one status.");

		assert.strictEqual(aRows[1].querySelectorAll(".sapMObjStatus").length, 1, "Row 2 should have 1 item.");
	});

	QUnit.test("Nested rows and columns", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"number": "65.34",
							"unit": "K",
							"trend": "Down",
							"state": "Error",
							"target": {
								"number": 100,
								"unit": "K"
							},
							"deviation": {
								"number": 34.7,
								"state": "Critical"
							},
							"details": "Q1, 2018"
						}
					},
					"title": "Project Cloud Transformation",
					"subTitle": "Revenue",
					"unitOfMeasurement": "EUR",
					"infoSection": {
						"rows": [
							{
								"columns": [
									{
										"rows": [
											{
												"items": [
													{
														"type": "Status",
														"value": "On Track",
														"state": "Success",
														"inverted": true,
														"showStateIcon": true
													}
												]
											},
											{
												"items": [
													{
														"type": "Status",
														"value": "OKR Relevant",
														"state": "None",
														"inverted": true,
														"showStateIcon": true
													}
												]
											}
										]
									},
									{
										"items": [
											{
												"type": "Status",
												"value": "Goal Template Available",
												"state": "Information",
												"inverted": true,
												"showStateIcon": true
											}
										]
									}
								]
							}
						]
					},
					"mainIndicator": {
						"number": "{number}",
						"unit": "{unit}",
						"trend": "{trend}",
						"state": "{state}"
					},
					"details": "{details}",
					"sideIndicators": [
						{
							"title": "Target",
							"number": "{target/number}",
							"unit": "{target/unit}"
						},
						{
							"title": "Deviation",
							"number": "{deviation/number}",
							"unit": "%",
							"state": "{deviation/state}"
						}
					]
				}
			}
		};
		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.ok(oHeader, "Card should have header.");

		const oInfoSection = oHeader.getDomRef().querySelector(".sapFCardHeaderInfoSection");
		assert.ok(oInfoSection, "Info section should be rendered.");

		const aRows = oInfoSection.querySelectorAll(":scope > .sapUiIntHeaderInfoSectionRow");
		assert.strictEqual(aRows.length, 1, "One row should be rendered.");

		const aColumns = aRows[0].querySelectorAll(".sapUiIntHeaderInfoSectionColumn");
		assert.strictEqual(aColumns.length, 2, "Row should have 2 columns.");

		const aNestedRows = aColumns[0].querySelectorAll(".sapUiIntHeaderInfoSectionRow");
		assert.strictEqual(aNestedRows.length, 2, "First column should have 2 nested rows.");

		assert.strictEqual(aNestedRows[0].querySelectorAll(".sapMObjStatus").length, 1, "First nested row should have one status.");
		assert.strictEqual(aNestedRows[1].querySelectorAll(".sapMObjStatus").length, 1, "Second nested row should have one status.");

		assert.strictEqual(aColumns[1].querySelectorAll(".sapMObjStatus").length, 1, "Second column should have one status.");
	});
});