/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/m/library"
], (
	Card,
	nextUIUpdate,
	nextCardReadyEvent,
	mLibrary
) => {
	"use strict";

	const AvatarImageFitType = mLibrary.AvatarImageFitType;
	const DOM_RENDER_LOCATION = "qunit-fixture";
	const WrappingType = mLibrary.WrappingType;

	QUnit.module("Numeric Header", {
		beforeEach: function () {
			this.oCard = new Card("somecard", {
				width: "400px",
				height: "600px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("'statusText' set with binding", async function (assert) {
		// Arrange
		const oManifest = {
				"sap.app": {
					"id": "my.card.test"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"type": "Numeric",
						"data": {
							"json": {
								"statusText": "2 of 10"
							}
						},
						"status": {
							"text": "{/statusText}"
						}
					}
				}
			};

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();

		// Assert
		assert.strictEqual(oHeader.getStatusText(),  oManifest["sap.card"].header.data.json.statusText, "Status text binding should be resolved.");
	});

	QUnit.test("Numeric Header generic", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.numericHeader.generic"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Project Cloud Transformation",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR",
					"dataTimestamp": "2021-03-18T12:00:00Z",
					"details": "Details, additional information"
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.ok(oHeader.getDomRef(), "Card Numeric header should be rendered.");

		// Assert properties
		assert.equal(oHeader.getAggregation("_title").getText(), oManifest["sap.card"].header.title, "Card header title should be correct.");
		assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest["sap.card"].header.subTitle, "Card header subtitle should be correct.");
		assert.equal(oHeader.getAggregation("_unitOfMeasurement").getText(), oManifest["sap.card"].header.unitOfMeasurement, "Card header unitOfMeasurement should be correct.");
		assert.equal(oHeader.getAggregation("_details").getText(), oManifest["sap.card"].header.details, "Card header details should be correct.");
		assert.equal(oHeader.getDataTimestamp(), oManifest["sap.card"].header.dataTimestamp, "Card header dataTimestamp should be correct.");
	});

	QUnit.test("Numeric Header main indicator with json data", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.numericHeader.mainIndicator"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Project Cloud Transformation",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					}
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header"),
			oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

		// Assert aggregation mainIndicator
		assert.ok(oMainIndicator.getDomRef(), "Card header main indicator aggregation should be set and rendered");
		assert.equal(oMainIndicator.getValue(), oManifest["sap.card"].header.data.json["n"], "Card header main indicator value should be correct.");
		assert.equal(oMainIndicator.getScale(), oManifest["sap.card"].header.data.json["u"], "Card header main indicator scale should be correct.");
		assert.equal(oMainIndicator.getIndicator(), oManifest["sap.card"].header.data.json["trend"], "Card header main indicator indicator should be correct.");
		assert.equal(oMainIndicator.getValueColor(), oManifest["sap.card"].header.data.json["valueColor"], "Card header main indicator valueColor should be correct.");
	});

	QUnit.test("Numeric Header main indicator without 'data'", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.mainIndicator"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation",
					"mainIndicator": {
						"number": "56",
						"unit": "%",
						"trend": "Up",
						"state": "Good"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header"),
			oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

		// Assert aggregation _mainIndicator
		assert.ok(oMainIndicator.getDomRef(), "Card header main indicator aggregation should be set and rendered");
		assert.equal(oMainIndicator.getValue(), oManifest["sap.card"].header.mainIndicator.number, "Card header main indicator value should be correct.");
		assert.equal(oMainIndicator.getScale(), oManifest["sap.card"].header.mainIndicator.unit, "Card header main indicator scale should be correct.");
		assert.equal(oMainIndicator.getIndicator(), oManifest["sap.card"].header.mainIndicator.trend, "Card header main indicator indicator should be correct.");
		assert.equal(oMainIndicator.getValueColor(), oManifest["sap.card"].header.mainIndicator.state, "Card header main indicator valueColor should be correct.");
	});

	QUnit.test("Numeric Header side indicators", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.numericHeader.sideIndicators"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Project Cloud Transformation",
					"sideIndicators": [
						{
							"title": "Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"title": "Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header");

		// Assert aggregation sideIndicators
		assert.ok(oHeader.getAggregation("sideIndicators"), "Card header side indicators should be set.");
		assert.equal(oHeader.getAggregation("sideIndicators").length, oManifest["sap.card"].header.sideIndicators.length, "Card header should have two side indicators.");

		oHeader.getAggregation("sideIndicators").forEach(function (oIndicator, iIndex) {
			const oSideIndicator = oManifest["sap.card"].header.sideIndicators[iIndex];
			assert.ok(oIndicator.getDomRef(), "Card header sideIndicators one should be rendered.");
			assert.equal(oIndicator.getTitle(), oSideIndicator.title, "Card header side indicator " + iIndex + " title should be correct.");
			assert.equal(oIndicator.getNumber(), oSideIndicator.number, "Card header side indicator " + iIndex + " number should be correct.");
			assert.equal(oIndicator.getUnit(), oSideIndicator.unit, "Card header side indicator " + iIndex + " unit should be correct.");
		});
	});

	QUnit.test("Numeric Header with no Details and no Indicators (Main and Side)", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.card11"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.equal(document.getElementsByClassName("sapFCardHeaderDetails").length, 0, "Card header Details are not rendered.");
		assert.equal(document.getElementsByClassName("sapFCardNumericIndicators").length, 0, "Card header Indicators are not rendered.");
		assert.equal(document.getElementsByClassName("sapFCardNumericIndicatorsMain").length, 0, "Card header Main Indicator is not rendered.");
		assert.equal(document.getElementsByClassName("sapFCardNumericIndicatorsSide").length, 0, "Card header Side Indicator is not rendered.");
	});

	QUnit.test("hidden header", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"visible": false,
					"title": "Card title"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");
	});

	QUnit.test("hidden header with binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"headerVisible": false
					}
				},
				"header": {
					"type": "Numeric",
					"visible": "{/headerVisible}",
					"title": "Card title"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");
	});

	QUnit.test("Numeric header main indicator visibility", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.mainIndicator"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Card title",
					"subTitle": "Card subtitle",
					"unitOfMeasurement": "EUR",
					"mainIndicator": {
						"visible": false,
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z",
					"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
					"sideIndicators": [
						{
							"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"title": "Long Deviation Long Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header"),
			oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

		// Assert aggregation mainIndicator
		assert.notOk(oMainIndicator.getVisible(), "Card header main indicator is hidden");
		assert.notOk(oMainIndicator.getDomRef(), "Card header main indicator should not be rendered if invisible");
	});

	QUnit.test("Numeric header side indicators visibility", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.mainIndicator"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation",
					"sideIndicators": [
						{
							"visible": false,
							"title": "Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"visible": false,
							"title": "Long Deviation Long Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header");
		const oSideIndicators = oHeader.getAggregation("sideIndicators");

		// Assert
		oSideIndicators.forEach(function (oIndicator, iIndex) {
			assert.notOk(oIndicator.getDomRef(), "Card header sideIndicators shouldn't be rendered if invisible.");
			assert.notOk(oIndicator.getVisible(), "Card header sideIndicators are hidden");
		});
	});

	QUnit.test("Numeric header main indicator visibility with binding", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.mainIndicator"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"visibility": false
						}
					},
					"title": "Project Cloud Transformation",
					"mainIndicator": {
						"visible": "{visibility}",
						"number": "25"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header"),
			oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

		// Assert aggregation mainIndicator
		assert.notOk(oMainIndicator.getVisible(), "Card header main indicator is hidden");
		assert.notOk(oMainIndicator.getDomRef(), "Card header main indicator should not be rendered if invisible");
		assert.equal(oHeader.getNumberVisible(), oManifest["sap.card"].header.data.json["visibility"], "Card header main indicator visibility property value should be correct.");
	});

	QUnit.test("Numeric header side indicators visibility with binding", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.sideIndicators"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"visibility": false
						}
					},
					"sideIndicators": [
						{
							"visible": "{visibility}",
							"title": "Target"
						},
						{
							"visible": "{visibility}",
							"title": "Deviation"
						}
					]
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getAggregation("_header");
		const oSideIndicators = oHeader.getAggregation("sideIndicators");

		// Assert
		oSideIndicators.forEach(function (oIndicator, iIndex) {
			assert.notOk(oIndicator.getDomRef(), "Card header sideIndicators shouldn't be rendered if invisible.");
			assert.notOk(oIndicator.getVisible(), "Card header sideIndicators are hidden");
			assert.equal(oIndicator.getVisible(), oManifest["sap.card"].header.data.json["visibility"], "Card header side indicators visibility property value should be correct.");
		});
	});

	QUnit.test("Numeric Header Hyphenation", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.headerHyphenation"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"wrappingType": "Hyphenated",
					"title": "pneumonoultramicroscopicsilicovolcanoconiosis"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCard.getCardHeader().getWrappingType(), WrappingType.Hyphenated, "Card Numeric Header has wrappingType: Hyphenated.");
	});

	QUnit.test("Numeric Header empty 'details' text given as object", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.headerHyphenation"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Title",
					"details": {
						"text": ""
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCard.getCardHeader().getDetails(), "", "Target 'details' property is empty string.");
		assert.notOk(this.oCard.getCardHeader().getDomRef().querySelector(".sapFCardHeaderDetails"), "Details are not rendered.");
	});

	QUnit.test("Numeric Header Avatar", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.numericHeader.avatar"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"icon": {
						"initials": "AJ",
						"shape": "Circle",
						"fitType": "Contain"
					},
					"title": "Project Cloud Transformation",
					"sideIndicators": [
						{
							"title": "Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"title": "Long Deviation Long Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.notOk(oHeader.getAggregation("_avatar").getSrc(), "Card header icon src should be empty.");
		assert.equal(oHeader.getAggregation("_avatar").getDisplayShape(), "Circle", "Card header icon shape should be 'Circle'.");
		assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be 'AJ'.");
		assert.equal(oHeader.getAggregation("_avatar").getImageFitType(), AvatarImageFitType.Contain, "ImageFitType should be 'Contain'.");
	});

	QUnit.test("Cloned Numeric Header", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.numericHeader.genericClone"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Project Cloud Transformation",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR",
					"dataTimestamp": "2021-03-18T12:00:00Z",
					"details": "Details, additional information"
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oClonedHeader = this.oCard.getCardHeader().clone();

		// Act
		oClonedHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oClonedHeader.getDomRef(), "Cloned Numeric header should be rendered.");
		assert.equal(oClonedHeader.getAggregation("_title").getText(), oManifest["sap.card"].header.title, "Cloned header title should be correct.");
		assert.equal(oClonedHeader.getAggregation("_subtitle").getText(), oManifest["sap.card"].header.subTitle, "Cloned header subtitle should be correct.");
		assert.equal(oClonedHeader.getAggregation("_unitOfMeasurement").getText(), oManifest["sap.card"].header.unitOfMeasurement, "Cloned header unitOfMeasurement should be correct.");
		assert.equal(oClonedHeader.getAggregation("_details").getText(), oManifest["sap.card"].header.details, "Cloned header details should be correct.");
		assert.equal(oClonedHeader.getDataTimestamp(), oManifest["sap.card"].header.dataTimestamp, "Cloned header dataTimestamp should be correct.");
	});
});