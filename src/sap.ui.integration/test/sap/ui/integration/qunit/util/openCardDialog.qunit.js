/* global QUnit, sinon */

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

	function stubNorthwindFetch() {
		const aValues = [];

		for (let i = 1; i <= 50; i++) {
			aValues.push({ ProductName: "Product " + i, UnitsInStock: i });
		}

		return sinon.stub(RequestDataProvider.prototype, "_fetch").callsFake(function () {
			return Promise.resolve({
				"@odata.count": aValues.length,
				value: aValues
			});
		});
	}

	QUnit.module("openCardDialog", {
		beforeEach: async function () {
			const sBaseUrl = "ShowHideCardActionsFakeUrl/";
			this.oCardManifest = {
				"sap.app": {
					id: "test.card"
				},
				"sap.card": {
					type: "List",
					configuration: {
						childCards: {
							childCard: {
								manifest: "childManifest.json"
							}
						}
					},
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
			};

			this.oCard = new Card({
				baseUrl: sBaseUrl,
				manifest: this.oCardManifest
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.xhr.useFilters = true;
			this.oServer.xhr.addFilter(function(sMethod, sUrl) {
				return !sUrl.includes(sBaseUrl);
			});

			this.oServer.respondWith("GET", new RegExp("childManifest\\.json"), (oXhr) => {
				oXhr.respond(
					200,
					{ "Content-Type": "application/json" },
					JSON.stringify(this.oChildManifest)
				);
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Busy/loading state of the opener while waiting", async function (assert) {
		// Arrange
		const oGetData = new Deferred();
		this.stub(DataProvider.prototype, "getData").returns(oGetData.promise);
		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
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
		// Arrange
		const fnErrorSpy = this.spy(Log, "error");
		this.oChildManifest = {
			"sap.app": {
				id: "test.card.brokenHeader"
			},
			"sap.card": {
				type: "Object",
				content: {
					groups: [
						{
							title: "Group 1",
							items: []
						}
					]
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);

		const oHeader = oDialog.getCustomHeader();

		// Assert
		assert.notOk(oHeader, "Dialog has no header and there are no exceptions thrown");
		assert.ok(fnErrorSpy.notCalled, "Error is not logged");
	});

	QUnit.test("Accessibility attributes", async function (assert) {
		// Arrange
		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oHeader = oDialog.getCustomHeader();
		const oDialogRef = oDialog.getDomRef();
		const oCard = oDialog.getContent()[0];
		const oCardRef = oDialog.getContent()[0].getDomRef();
		const oTitleRef = document.getElementById(oHeader.getTitleId());

		// Assert
		assert.strictEqual(oDialogRef.getAttribute("aria-labelledby"), oHeader.getTitleId(), "Dialog has correct aria-labelledby attribute");
		assert.notOk(oCardRef.getAttribute("role"), "Card has correct role");
		assert.notOk(oCardRef.getAttribute("aria-labelledby"), "Card has no extra labeling");
		assert.strictEqual(oTitleRef.getAttribute("aria-level"), "1", "Dialog header title has aria-level 1");

		const oContentListRef = oCard.getCardContent().getInnerList().getDomRef("listUl");
		assert.strictEqual(oContentListRef.getAttribute("aria-labelledby"), oHeader.getTitleId(), "List content has correct aria-labelledby attribute");
	});

	QUnit.test("Object content group aria-level depends on dialog header level", async function (assert) {
		// Arrange - Object (snack) card opened in a dialog. The dialog forces the
		// header to H1, so group titles in the Object content must end up at aria-level "2".
		this.oChildManifest = {
			"sap.app": {
				id: "test.snackCard"
			},
			"sap.card": {
				type: "Object",
				header: {
					title: "Snack Card Title"
				},
				content: {
					groups: [
						{
							title: "Group A",
							items: [{ label: "L", value: "V" }]
						},
						{
							title: "Group B",
							items: [{ label: "L", value: "V" }]
						}
					]
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oHeader = oDialog.getCustomHeader();
		const oTitleRef = document.getElementById(oHeader.getTitleId());

		// Assert - dialog header is at H1
		assert.strictEqual(oTitleRef.getAttribute("aria-level"), "1", "Dialog header title has aria-level 1");

		// Assert - group titles are one level below the header (H1 -> 2)
		const oChildCard = oDialog.getContent()[0];
		const aGroupTitles = oChildCard.getDomRef().querySelectorAll(".sapFCardObjectItemTitle");
		assert.strictEqual(aGroupTitles.length, 2, "Two group titles are rendered");
		assert.strictEqual(aGroupTitles[0].getAttribute("role"), "heading", "Group title has role=heading");
		assert.strictEqual(aGroupTitles[0].getAttribute("aria-level"), "2", "Group aria-level is derived from dialog header level (H1 -> 2)");
		assert.strictEqual(aGroupTitles[1].getAttribute("aria-level"), "2", "All groups derive from the same dialog header level");
	});

	QUnit.test("Only single data request must be executed", async function (assert) {
		// Arrange
		const fnSpy = this.spy(RequestDataProvider.prototype, "getData");
		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(fnSpy.callCount, 1, "Only single data request was executed.");

		fnSpy.restore();
	});

	QUnit.test("Refresh the child card", async function (assert) {
		// Arrange
		const fnSpy = this.spy(RequestDataProvider.prototype, "getData");
		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
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
		// Arrange
		const oData = [];
		for (let i = 0; i < 100; i++) {
			oData.push({ title: "Item" + i });
		}

		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
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
		// Arrange
		const oData = [];
		for (let i = 0; i < 100; i++) {
			oData.push({ title: "Item" + i });
		}

		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
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
		// Arrange
		this.oChildManifest = {
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
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
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

	QUnit.test("Opening/closing slide is driven by transform, not left/top", async function (assert) {
		// Arrange - a List child so the ShowCard animation is enabled.
		this.oChildManifest = {
			"sap.app": {
				id: "test.card.slideAnimation"
			},
			"sap.card": {
				type: "List",
				data: {
					json: [
						{ "title": "Item 1" }
					]
				},
				header: {
					title: "Slide animation card"
				},
				content: {
					item: {
						title: "{title}"
					}
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oDialogRef = oDialog.getDomRef();

		// Capture left/top (which sap.m.Dialog rewrites to re-center the settling child) so we can
		// prove the slide does not touch them - otherwise re-centers would drift the slide.
		const sLeftBeforeClose = oDialogRef.style.left;
		const sTopBeforeClose = oDialogRef.style.top;

		// Act - closing synchronously arms the slide back to the parent card.
		oDialog.close();

		// Assert - the slide is produced via a transform translate...
		assert.ok(
			oDialogRef.classList.contains("sapUiIntCardDialogAnimate"),
			"Animation class is added for the slide"
		);
		assert.ok(
			/translate\(/.test(oDialogRef.style.transform),
			"The slide is driven by a transform translate"
		);

		// ...and left/top are left untouched, so re-centering cannot restart the slide.
		assert.strictEqual(oDialogRef.style.left, sLeftBeforeClose, "The slide does not rewrite 'left'");
		assert.strictEqual(oDialogRef.style.top, sTopBeforeClose, "The slide does not rewrite 'top'");
	});

	QUnit.test("Component Card", async function (assert) {
		// Arrange
		this.oChildManifest = {
			_version: "2.0.0",

			"sap.app": {
				id: "test.card"
			},

			header: {
				title: "Test Card"
			},

			"sap.card": {
				type: "Component"
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);

		// Assert
		assert.ok(oDialog.isOpen(), "Dialog is open");
	});

	QUnit.test("Returns null without setting parent busy when child card config has inline manifest object", function (assert) {
		// Arrange - a separate parent card with an inline object as childCards manifest.
		// startManifestProcessing creates _oCardManifest synchronously from the inline JSON,
		// so no async waiting is needed before calling openCardDialog.
		const oParentCard = new Card({
			manifest: {
				"sap.app": { "id": "test.card.parent.inlineChild", "type": "card" },
				"sap.card": {
					"type": "Object",
					"header": { "title": "Parent" },
					"configuration": {
						"childCards": {
							"badChild": {
								"manifest": { "sap.app": { "id": "inline" }, "sap.card": { "type": "Object" } }
							}
						}
					}
				}
			}
		});
		oParentCard.startManifestProcessing();

		// Act
		const oResult = openCardDialog(oParentCard, { childCardKey: "badChild" });

		// Assert
		assert.strictEqual(oResult, null, "openCardDialog returns null when child card config has an inline manifest.");
		assert.notOk(oParentCard.getBusy(), "Parent card is NOT set busy when openCardDialog aborts early.");

		// Clean up
		oParentCard.destroy();
	});

	QUnit.module("Child card - loading placeholder", {
		beforeEach: function () {
			this.oHost = new Host({
				resolveDestination: function (sName) {
					switch (sName) {
						case "Northwind_V4":
							return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
						default:
							return null;
					}
				}
			});

			this.oFetchStub = stubNorthwindFetch();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oFetchStub.restore();
		}
	});

	QUnit.test("Content keeps width during a long-running refresh and matches after data arrives", async function (assert) {
		// Arrange
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Open the dialog with the child card
		oCard.getCardFooter().getAggregation("_showMore").firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		const oContent = oChildCard.getCardContent();
		const sWidthAtOpen = oContent.getDomRef().style.minWidth;
		const iContentWidthAtOpen = oContent.getDomRef().offsetWidth;

		assert.ok(parseFloat(sWidthAtOpen) > 0, "Content has a non-zero min-width after dialog open");
		assert.strictEqual(sWidthAtOpen, iContentWidthAtOpen + "px", "min-width matches measured width at open");

		// Stall the next data request so the loading placeholder stays visible
		const oGetData = new Deferred();
		this.stub(DataProvider.prototype, "getData").returns(oGetData.promise);

		// Act - trigger a long-running data refresh (keeps content alive, unlike Card#refresh)
		oChildCard.refreshData();
		await nextUIUpdate();

		// Assert - during loading, the placeholder is rendered and min-width is preserved
		assert.ok(oContent.isLoading(), "Content is loading during the long-running refresh");
		assert.strictEqual(oContent.getDomRef().style.minWidth, sWidthAtOpen, "Content retains min-width while placeholder is shown");
		const oPlaceholder = oContent.getAggregation("_loadingPlaceholder");
		assert.ok(oPlaceholder.getDomRef(), "Loading placeholder is rendered");

		// Release the data
		oGetData.resolve([]);
		await nextUIUpdate();

		// Assert - after data arrives, no width change
		assert.strictEqual(oContent.getDomRef().style.minWidth, sWidthAtOpen, "Content min-width unchanged after data load");
		assert.strictEqual(oContent.getDomRef().offsetWidth, iContentWidthAtOpen, "Content rendered width unchanged after data load");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Child card - dialog drag/resize gestures", {
		beforeEach: function () {
			this.oHost = new Host({
				resolveDestination: function (sName) {
					switch (sName) {
						case "Northwind_V4":
							return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
						default:
							return null;
					}
				}
			});

			this.oFetchStub = stubNorthwindFetch();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oFetchStub.restore();
		}
	});

	QUnit.test("Mouse-down on resize handle releases the kept min-width", async function (assert) {
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		oCard.getCardFooter().getAggregation("_showMore").firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		const oContent = oChildCard.getCardContent();

		assert.ok(parseFloat(oContent.getDomRef().style.minWidth) > 0, "min-width is set before resize gesture");

		const oResizeHandle = oDialog.getDomRef().querySelector(".sapMDialogResizeHandle");
		assert.ok(oResizeHandle, "Resize handle exists in DOM");

		oDialog.onmousedown({
			which: 1,
			target: oResizeHandle,
			clientX: 0,
			clientY: 0,
			offsetX: 0,
			offsetY: 0,
			stopPropagation: function () {}
		});

		assert.strictEqual(oContent.getDomRef().style.minWidth, "", "min-width is released after mousedown on resize handle");
		assert.notOk(oContent._iKeptWidth, "Kept width is cleared on the content");

		oCard.destroy();
	});

	QUnit.test("Mouse-down outside the resize handle does NOT release the kept min-width", async function (assert) {
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		oCard.getCardFooter().getAggregation("_showMore").firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		const oContent = oChildCard.getCardContent();
		const sKeptWidth = oContent.getDomRef().style.minWidth;

		oDialog.onmousedown({
			which: 1,
			target: oContent.getDomRef(),
			clientX: 0,
			clientY: 0,
			offsetX: 0,
			offsetY: 0,
			stopPropagation: function () {}
		});

		assert.strictEqual(oContent.getDomRef().style.minWidth, sKeptWidth, "min-width is preserved on non-resize mousedown");

		oCard.destroy();
	});

	QUnit.test("Keyboard Shift+Arrow on resize handle releases the kept min-width", async function (assert) {
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		oCard.getCardFooter().getAggregation("_showMore").firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		const oContent = oChildCard.getCardContent();

		assert.ok(parseFloat(oContent.getDomRef().style.minWidth) > 0, "min-width is set before keyboard resize");

		const oHandler = oDialog.getDomRef("dragAndResizeHandler");
		assert.ok(oHandler, "dragAndResizeHandler element exists");

		oDialog._handleKeyboardDragResize({
			target: oHandler,
			keyCode: 39, // ArrowRight
			shiftKey: true,
			preventDefault: function () {}
		});

		assert.strictEqual(oContent.getDomRef().style.minWidth, "", "min-width is released after Shift+Arrow");
		assert.notOk(oContent._iKeptWidth, "Kept width is cleared on the content");

		oCard.destroy();
	});

	QUnit.test("Keyboard Arrow without Shift (drag, not resize) does NOT release the kept min-width", async function (assert) {
		const oCard = new Card({
			host: this.oHost,
			manifest: "test-resources/sap/ui/integration/qunit/manifests/showCardHeader/manifest.json"
		});
		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		oCard.getCardFooter().getAggregation("_showMore").firePress();
		const oDialog = oCard.getDependents()[0];
		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		const oChildCard = oDialog.getContent()[0];
		const oContent = oChildCard.getCardContent();
		const sKeptWidth = oContent.getDomRef().style.minWidth;

		const oHandler = oDialog.getDomRef("dragAndResizeHandler");

		oDialog._handleKeyboardDragResize({
			target: oHandler,
			keyCode: 39,
			shiftKey: false,
			preventDefault: function () {}
		});

		assert.strictEqual(oContent.getDomRef().style.minWidth, sKeptWidth, "min-width is preserved on drag (Arrow without Shift)");

		oCard.destroy();
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

	QUnit.module("ShowCard animation for Table cards", {
		beforeEach: async function () {
			const sBaseUrl = "ShowHideCardActionsFakeUrl/";
			this.oCardManifest = {
				"sap.app": {
					id: "test.card"
				},
				"sap.card": {
					type: "List",
					configuration: {
						childCards: {
							childCard: {
								manifest: "childManifest.json"
							}
						}
					},
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
			};

			this.oCard = new Card({
				baseUrl: sBaseUrl,
				manifest: this.oCardManifest
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.xhr.useFilters = true;
			this.oServer.xhr.addFilter(function(sMethod, sUrl) {
				return !sUrl.includes(sBaseUrl);
			});

			this.oServer.respondWith("GET", new RegExp("childManifest\\.json"), (oXhr) => {
				oXhr.respond(
					200,
					{ "Content-Type": "application/json" },
					JSON.stringify(this.oChildManifest)
				);
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Animation is disabled for Table card with autoPopinMode", async function (assert) {
		// Arrange
		this.oChildManifest = {
			"sap.app": {
				id: "test.card.tableWithPopIn"
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
					title: "Table with AutoPopin"
				},
				content: {
					autoPopinMode: true,
					row: {
						columns: [
							{
								title: "Product",
								value: "{product}"
							}
						]
					}
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		// Assert
		const oChildCard = oDialog.getContent()[0];
		assert.strictEqual(
			oChildCard.getManifestEntry("/sap.card/type"),
			"Table",
			"Child card type is Table"
		);
		assert.strictEqual(
			oChildCard.getManifestEntry("/sap.card/content/autoPopinMode"),
			true,
			"Child card has autoPopinMode enabled"
		);

		const oDialogRef = oDialog.getDomRef();
		assert.notOk(
			oDialogRef.classList.contains("sapUiIntCardDialogAnimate"),
			"Dialog should not have animation class for Table card with autoPopinMode"
		);

		oDialog.close();
		await nextUIUpdate();

		assert.notOk(
			oDialogRef.classList.contains("sapUiIntCardDialogAnimate"),
			"Dialog should not have animation class after close for Table card with autoPopinMode"
		);
	});

	QUnit.test("Animation is enabled for Table card without autoPopinMode", async function (assert) {
		// Arrange
		this.oChildManifest = {
			"sap.app": {
				id: "test.card.tableWithoutPopIn"
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
					title: "Table without AutoPopin"
				},
				content: {
					autoPopinMode: false,
					row: {
						columns: [
							{
								title: "Product",
								value: "{product}"
							}
						]
					}
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		// Assert
		const oChildCard = oDialog.getContent()[0];
		assert.strictEqual(
			oChildCard.getManifestEntry("/sap.card/type"),
			"Table",
			"Child card type is Table"
		);
		assert.strictEqual(
			oChildCard.getManifestEntry("/sap.card/content/autoPopinMode"),
			false,
			"Child card has autoPopinMode disabled"
		);

		const oDialogRef = oDialog.getDomRef();
		oDialog.close();
		await nextUIUpdate();

		assert.ok(
			oDialogRef.classList.contains("sapUiIntCardDialogAnimate"),
			"Dialog should have animation class after close for Table card without autoPopinMode"
		);
	});

	QUnit.test("Animation is enabled for non-Table cards", async function (assert) {
		// Arrange
		this.oChildManifest = {
			"sap.app": {
				id: "test.card.list"
			},
			"sap.card": {
				type: "List",
				data: {
					json: [
						{
							"title": "Item 1"
						}
					]
				},
				header: {
					title: "List Card"
				},
				content: {
					item: {
						title: "{title}"
					}
				}
			}
		};

		// Act
		const oDialog = openCardDialog(
			this.oCard,
			{
				childCardKey: "childCard"
			}
		);

		await nextDialogAfterOpenEvent(oDialog);
		await nextUIUpdate();

		// Assert
		const oChildCard = oDialog.getContent()[0];
		assert.strictEqual(
			oChildCard.getManifestEntry("/sap.card/type"),
			"List",
			"Child card type is List"
		);

		const oDialogRef = oDialog.getDomRef();
		oDialog.close();
		await nextUIUpdate();

		assert.ok(
			oDialogRef.classList.contains("sapUiIntCardDialogAnimate"),
			"Dialog should have animation class after close for non-Table cards"
		);
	});
});
