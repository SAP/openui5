/* global QUnit */

sap.ui.define([
	"sap/base/util/Deferred",
	"sap/base/Log",
	"sap/ui/integration/Host",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/test/utils/nextUIUpdate",
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
	RequestDataProvider,
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
		assert.strictEqual(oContentListRef.getAttribute("aria-labelledby"), oHeader.getTitleId(), "List content has correct aria-labelledby attribute");
	});

	QUnit.test("Only single data request must be executed", async function (assert) {
		// Act
		const fnSpy = this.spy(RequestDataProvider.prototype, "getData");
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card.dataRequest",
						type: "card"
					},
					"sap.card": {
						type: "List",
						header: {
							title: "Data Request Test"
						},
						data: {
							request: {
								url: "items.json"
							}
						},
						content: {
							item: {
								title: "{Name}"
							}
						}
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(fnSpy.callCount, 1, "Only single data request was executed.");

		fnSpy.restore();
	});

	QUnit.test("Refresh the child card", async function (assert) {
		// Act
		const fnSpy = this.spy(RequestDataProvider.prototype, "getData");
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card.dataRequestWithRefresh",
						type: "card"
					},
					"sap.card": {
						type: "List",
						header: {
							title: "Data Request Test"
						},
						data: {
							request: {
								url: "items.json"
							}
						},
						content: {
							item: {
								title: "{Name}"
							}
						}
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		oChildCard.refresh();

		await nextCardReadyEvent(oChildCard);

		// Assert
		assert.strictEqual(fnSpy.callCount, 2, "Two data requests were executed after explicit refresh.");

		// Clean up
		fnSpy.restore();
	});

	QUnit.test("Resize after open", async function (assert) {
		// Act
		const oData = [];
		for (let i = 0; i < 100; i++) {
			oData.push({ title: "Item" + i });
		}
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card.resize",
						type: "card"
					},
					"sap.card": {
						type: "List",
						data: {
							name: "testModel",
							json: oData.slice(0, 1) // 1 item
						},
						header: {
							title: "Resize test"
						},
						content: {
							data: {
								path: "testModel>/"
							},
							item: {
								title: "{testModel>title}"
							}
						}
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const iHeight1 = oDialog.getDomRef().getBoundingClientRect().height;

		// Act
		const oCard = oDialog.getContent()[0];
		oCard.getModel("testModel").setData(oData); // 100 items

		await nextUIUpdate();

		// Assert - height increases
		const iHeight2 = oDialog.getDomRef().getBoundingClientRect().height;
		assert.ok(iHeight1 < iHeight2, "The dialog height has increased.");
	});

	QUnit.test("Do not shrink if list content gets smaller", async function (assert) {
		// Act
		const oData = [];
		for (let i = 0; i < 100; i++) {
			oData.push({ title: "Item" + i });
		}
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card.resize",
						type: "card"
					},
					"sap.card": {
						type: "List",
						data: {
							name: "testModel",
							json: oData // 100 items
						},
						header: {
							title: "Resize test"
						},
						content: {
							data: {
								path: "testModel>/"
							},
							item: {
								title: "{testModel>title}"
							}
						}
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const iHeight1 = oDialog.getDomRef().getBoundingClientRect().height;

		// Act
		const oCard = oDialog.getContent()[0];
		oCard.getModel("testModel").setData(oData.slice(0, 1)); // 1 item

		await nextUIUpdate();

		// Assert - height stays the same
		const iHeight2 = oDialog.getDomRef().getBoundingClientRect().height;
		assert.strictEqual(iHeight2, iHeight1, "The dialog height has not changed when content is less.");

		// Assert - no scrollbar
		const iContentSectionHeight = oCard.getDomRef("contentSection").getBoundingClientRect().height;
		const iContentHeight = oCard.getCardContent().getDomRef().getBoundingClientRect().height;

		assert.ok(iContentHeight <= iContentSectionHeight, "The content has no scrollbar when not needed.");
	});

	QUnit.test("After manifest changes", async function (assert) {
		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					"sap.app": {
						id: "test.card",
						type: "card"
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

	QUnit.test("Component Card", async function (assert) {
		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				manifest: {
					_version: "2.0.2",

					"sap.app": {
						id: "test.card"
					},

					header: {
						title: "Test Card"
					},

					"sap.card": {
						type: "Component"
					}
				}
			}
		);

		await nextDialogAfterOpenEvent(oDialog);

		// Assert
		assert.ok(oDialog.isOpen(), "Dialog is open");
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