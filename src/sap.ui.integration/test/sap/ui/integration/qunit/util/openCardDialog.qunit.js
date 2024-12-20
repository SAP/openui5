/* global QUnit */

sap.ui.define([
	"sap/base/util/Deferred",
	"sap/base/Log",
	"sap/ui/integration/Host",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextDialogAfterOpenEvent"
], (
	Deferred,
	Log,
	Host,
	ActionDefinition,
	Card,
	openCardDialog,
	DataProvider,
	nextUIUpdate,
	nextCardReadyEvent,
	nextDialogAfterOpenEvent
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
						header: {
							title: "Test Card"
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

	QUnit.test("Busy/loading state of the opener while waiting", async function (assert) {
		// Arrange
		const oGetData = new Deferred();
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
						header: {
							title: "Test Card"
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

		// Assert
		assert.ok(this.oCard.getBusy(), "Whole card should be busy");
		assert.strictEqual(this.oCard.getBusyIndicatorDelay(), 750, "Delay should be 750ms");

		// Act
		oGetData.resolve();
		await nextDialogAfterOpenEvent(oDialog);

		// Assert
		assert.notOk(this.oCard.getBusy(), "Card should NOT be busy once the dialog is opened");
	});

	QUnit.test("Missing header", async function (assert) {
		// Act
		const fnErrorSpy = this.spy(Log, "error");
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card.brokenHeader"
					},
					"sap.card": {
						type: "Object",
						content: {
							groups: [
								{
									title: "Grpoup 1",
									items: []
								}
							]
						}
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);

		const oHeader = oDialog.getCustomHeader();

		// Assert
		assert.notOk(oHeader, "Dialog has no header and there are no exceptions thrown");
		assert.ok(fnErrorSpy.notCalled, "Error is not logged");
	});

	QUnit.test("Accessibility attributes", async function (assert) {
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
							json: [
								{
									"product": "Product 1"
								}
							]
						},
						header: {
							title: "Test Title"
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

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oHeader = oDialog.getCustomHeader();
		const oDialogRef = oDialog.getDomRef();
		const oCard = oDialog.getContent()[0];
		const oCardRef = oDialog.getContent()[0].getDomRef();

		// Assert
		assert.strictEqual(oDialogRef.getAttribute("aria-labelledby"), oHeader.getTitleId(), "Dialog has correct aria-labelledby attribute");
		assert.notOk(oCardRef.getAttribute("role"), "Card has correct role");
		assert.notOk(oCardRef.getAttribute("aria-labelledby"), "Card has no extra labeling");

		const oContentListRef = oCard.getCardContent().getInnerList().getDomRef("listUl");
		assert.strictEqual(oContentListRef.getAttribute("aria-labelledby"), oHeader.getTitleId() + "-inner", "List content has correct aria-labelledby attribute");
	});

	QUnit.test("After manifest changes", async function (assert) {
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
							json: [
								{
									"product": "Product 1"
								}
							]
						},
						header: {
							title: "Title Before"
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

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oHeaderBefore = oDialog.getCustomHeader();
		assert.strictEqual(oHeaderBefore.getTitle(), "Title Before", "Title is correct before manifest changes");

		const oCard = oDialog.getContent()[0];
		oCard.setManifestChanges([
			{
				"/sap.card/header/title": "Title After"
			}
		]);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		const oHeaderAfter = oDialog.getCustomHeader();
		assert.strictEqual(oHeaderAfter.getTitle(), "Title After", "Title is correct after manifest changes");
	});

	QUnit.module("Dialog Header", {
		beforeEach: function () {
			this.oHost = new Host({
				resolveDestination: function (sName) {
					switch (sName) {
						case "Northwind_V4":
							return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
						default:
							return null;
					}
				},
				actions: [
					{
						type: "Custom",
						text: "Add to Mobile",
						icon: "sap-icon://add"
					}
				]
			});
		},
		afterEach: function () {
			this.oHost.destroy();
		}
	});

	QUnit.test("Header properties", async function (assert) {
		// Arrange
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Act
		const oButton = oCard.getCardFooter().getAggregation("_showMore");
		oButton.firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);

		const oHeader = oDialog.getCustomHeader();
		const oChildCard = oDialog.getContent()[0];

		assert.ok(oHeader, "Dialog has a custom header");
		assert.ok(oHeader.isA("sap.ui.integration.cards.Header"), "Header is correct type");

		assert.strictEqual(oHeader, oChildCard.getCardHeader(), "The card header is the same as the dialog header");

		assert.strictEqual(oHeader.getTitle(), "Details card with filter 20 of 77", "Title with formatters is correct.");
		assert.strictEqual(oHeader.getStatusText(), "20 of 77", "Status is correct.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Numeric header properties", async function (assert) {
		// Arrange
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardNumericHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Act
		const oButton = oCard.getCardFooter().getAggregation("_showMore");
		oButton.firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);

		const oHeader = oDialog.getCustomHeader();
		const oChildCard = oDialog.getContent()[0];

		assert.ok(oHeader, "Dialog has a custom header");
		assert.ok(oHeader.isA("sap.ui.integration.cards.NumericHeader"), "Header is correct type");

		assert.strictEqual(oHeader, oChildCard.getCardHeader(), "The card header is the same as the dialog header");

		assert.strictEqual(oHeader.getTitle(), "Numeric title", "Title with is correct.");
		assert.strictEqual(oHeader.getStatusText(), "Visible 20", "Status is correct.");
		assert.strictEqual(oHeader.getNumber(), "200", "Main numeric indicator is correct.");
		assert.strictEqual(oHeader.getSideIndicators().length, 2, "Side indicators are correct.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Header is updated when data is updated", async function (assert) {
		// Arrange
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Act
		const oButton = oCard.getCardFooter().getAggregation("_showMore");
		oButton.firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);

		// Assert
		const oHeader = oDialog.getCustomHeader();
		assert.strictEqual(oHeader.getStatusText(), "20 of 77", "Status is correct.");

		// Act - change filter value
		const oChildCard = oDialog.getContent()[0];
		oChildCard.setFilterValue("name", "Chai");

		await nextUIUpdate();

		const oHeaderRendered = new Deferred();
		oHeader.addEventDelegate({
			onAfterRendering: () => {
				oHeaderRendered.resolve();
			}
		});

		await oHeaderRendered.promise;

		// Assert - after update
		assert.strictEqual(oHeader.getStatusText(), "1 of 1", "Status is updated and is correct.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Header toolbar", async function (assert) {
		// Arrange
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Act
		const oButton = oCard.getCardFooter().getAggregation("_showMore");
		oButton.firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);

		const oHeader = oDialog.getCustomHeader();
		const oMenu = oHeader.getToolbar().getAggregation("_actionsMenu");

		assert.strictEqual(oMenu.getItems().length, 2, "Menu has correct number of items initially.");

		// Act - add more actionDefinitions
		const oChildCard = oDialog.getContent()[0];
		oChildCard.addActionDefinition(new ActionDefinition({
			text: "Delayed Action",
			icon: "sap-icon://learning-assistant"
		}));
		await nextUIUpdate();

		// Assert - one more action is added at later stage
		assert.strictEqual(oMenu.getItems().length, 3, "Menu is correct after delay.");

		// Clean up
		oCard.destroy();
	});
});