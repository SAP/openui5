/* global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/core/Theming",
	"sap/ui/integration/util/AnalyticsCloudHelper",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardStateChangedEvent",
	"sap/ui/integration/util/ManifestResolver"
], function (
	Localization,
	Locale,
	Theming,
	AnalyticsCloudHelper,
	Host,
	Card,
	nextUIUpdate,
	nextCardReadyEvent,
	nextCardStateChangedEvent,
	ManifestResolver
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oExample1 = {
		"sap.app": {
			"id": "qunit.analyticscloud.example1"
		},
		"sap.card": {
			"type": "AnalyticsCloud",
			"configuration": {
				"parameters": {
					"storyId": {
						"value": "ABD0990112D81FBF4C936C30444FA3B7"
					},
					"widgetId": {
						"value": "36486725-0138-4231-8435-538015664163"
					}
				},
				"destinations": {
					"SAC": {
						"name": "SAC",
						"defaultUrl": "https://master-fpa135.master.canary.eu10.projectorca.cloud"
					}
				}
			},
			"header": {
				"title": "{= ${widgetInfo>/title} || 'SAC Card'}",
				"subTitle": "{widgetInfo>/subtitle}"
			},
			"content": {
				"minHeight": "25rem",
				"sacTenantDestination": "{{destinations.SAC}}",
				"widget": {
					"storyId": "{parameters>/storyId/value}",
					"widgetId": "{parameters>/widgetId/value}"
				},
				"options": {
					"attributes": {
						"enableInteraction": true
					}
				}
			}
		}
	};

	const oExample2Interpretation = {
		"sap.app": {
			"id": "qunit.analyticscloud.example1"
		},
		"sap.card": {
			"type": "AnalyticsCloud",
			"configuration": {
				"destinations": {
					"SAC": {
						"name": "SAC",
						"defaultUrl": "https://master-fpa135.master.canary.eu10.projectorca.cloud"
					}
				}
			},
			"header": {
				"title": "Demonstration SAC Card",
				"subTitle": "Shows a widget from story"
			},
			"content": {
				"minHeight": "25rem",
				"sacTenantDestination": "{{destinations.SAC}}",
				"interpretation": [
					{
						"id": "4d6761bc-7525-4528-a198-c6c66d9007b6",
						"body": [
							{
								"id": "sac_widget1",
								"details": {}
							}
						]
					}
				],
				"options": {
					"attributes": {
						"enableInteraction": true
					}
				}
			}
		}
	};

	QUnit.module("Widget rendering", {
		beforeEach: function () {
			this.fnIncludeScriptStub = sinon.stub(AnalyticsCloudHelper, "_includeScript");
			this.fnIncludeScriptStub.callsFake(() => {
				sap.sac = {
					api: {
						widget: {
							setup: sinon.stub(),
							getWidgetInfo: sinon.stub().callsFake(() => {
								return {
									title: "Gross Margin, Quantity sold per City",
									subtitle: "Year to date"
								};
							}),
							renderWidget: sinon.stub(),
							renderWidgetForJustAsk: sinon.stub()
						}
					}
				};

				return Promise.resolve();
			});
		},
		afterEach: function () {
			this.fnIncludeScriptStub.restore();
			AnalyticsCloudHelper._pInitialize = null;
			delete sap.sac.api.widget;
		}
	});

	QUnit.test("Creating a card", async function (assert) {
		// Arrange
		const oLocale = new Locale(Localization.getLanguageTag());
		const oCard = new Card({
			manifest: oExample1,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		const fnSetup = sap.sac.api.widget.setup;
		assert.ok(fnSetup.calledOnce, "sap.sac.api.widget.setup was called only once.");
		assert.deepEqual(
			fnSetup.firstCall.args[0],
			{
				language: oLocale.toString(),
				dataAccessLanguage: oLocale.toString(),
				theme: Theming.getTheme()
			},
			"sap.sac.api.widget.setup was called with correct arguments."
		);

		const fnRenderWidget = sap.sac.api.widget.renderWidget;
		assert.ok(fnRenderWidget.calledOnce, "sap.sac.api.widget.renderWidget was called only once.");

		const sContainerId = oCard.getCardContent().getId() + "-widgetContainer";
		const oArgs = fnRenderWidget.firstCall.args;
		assert.strictEqual(oArgs[0], sContainerId, "Container id is correct.");
		assert.strictEqual(oArgs[1].proxy, "https://master-fpa135.master.canary.eu10.projectorca.cloud", "Destination is correct.");
		assert.strictEqual(oArgs[2], "ABD0990112D81FBF4C936C30444FA3B7", "Story ID is correct.");
		assert.strictEqual(oArgs[3], "36486725-0138-4231-8435-538015664163", "Widget ID is correct.");

		const oOptions = oArgs[4];
		assert.strictEqual(typeof oOptions.renderComplete.onSuccess, "function", "options.renderComplete.onSuccess is a function");
		assert.strictEqual(typeof oOptions.renderComplete.onFailure, "function", "options.renderComplete.onFailure is a function");
		assert.deepEqual(
			oOptions.attributes,
			{
				enableInteraction: true,
				enableUndoRedo: false,
				enableMenus: false,
				showHeader: false,
				showFooter: false
			},
			"options.attributes is correct."
		);

		oOptions.renderComplete.onSuccess();
		const fnGetWidgetInfo = sap.sac.api.widget.getWidgetInfo;
		assert.ok(fnGetWidgetInfo.calledOnce, "sap.sac.api.widget.getWidgetInfo was called only once.");
		assert.ok(fnGetWidgetInfo.calledWith(sContainerId), "getWidgetInfo is called with correct container id.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("State changed and manifest resolving", async function (assert) {
		// Arrange
		const oCard = new Card({
			manifest: oExample1,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardStateChangedEvent(oCard);
		await nextUIUpdate();

		// Assert
		const oResult1 = await ManifestResolver.resolveCard(oCard);
		const oHeader1 = oResult1["sap.card"].header;
		assert.strictEqual(oHeader1.title, "SAC Card", "Title is correct after first state change.");
		assert.notOk(oHeader1.subTitle, "Subtitle is correct after first state change.");

		// Simulate successful rendering
		const oOptions = sap.sac.api.widget.renderWidget.firstCall.args[4];
		oOptions.renderComplete.onSuccess();

		// Wait for second state change and check result
		await nextCardStateChangedEvent(oCard);

		const oResult2 = await ManifestResolver.resolveCard(oCard);
		const oHeader2 = oResult2["sap.card"].header;
		assert.strictEqual(oHeader2.title, "Gross Margin, Quantity sold per City", "Title is correct after second state change.");
		assert.strictEqual(oHeader2.subTitle, "Year to date", "Subtitle is correct after second state change.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Creating a card with interpretation", async function (assert) {
		// Arrange
		const oCard = new Card({
			manifest: oExample2Interpretation,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		const fnRenderWidgetForJustAsk = sap.sac.api.widget.renderWidgetForJustAsk;
		assert.ok(fnRenderWidgetForJustAsk.calledOnce, "sap.sac.api.widget.renderWidget was called only once.");

		const oArgs = fnRenderWidgetForJustAsk.firstCall.args;
		assert.strictEqual(oArgs[0], oCard.getCardContent().getId() + "-widgetContainer", "Container id is correct.");
		assert.strictEqual(oArgs[1].proxy, "https://master-fpa135.master.canary.eu10.projectorca.cloud", "Destination is correct.");
		assert.deepEqual(
			oArgs[2],
			[
				{
					"id": "4d6761bc-7525-4528-a198-c6c66d9007b6",
					"body": [
						{
							"id": "sac_widget1",
							"details": {}
						}
					]
				}
			],
			"Argument interpretation  is correct."
		);

		const oOptions = oArgs[3];
		assert.strictEqual(typeof oOptions.renderComplete.onSuccess, "function", "options.renderComplete.onSuccess is a function");
		assert.strictEqual(typeof oOptions.renderComplete.onFailure, "function", "options.renderComplete.onFailure is a function");
		assert.deepEqual(
			oOptions.attributes,
			{
				enableInteraction: true,
				enableUndoRedo: false,
				enableMenus: false,
				showHeader: false,
				showFooter: false
			},
			"options.attributes is correct."
		);

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Card host can override the widget src", async function (assert) {
		// Arrange
		const oHost = new Host();

		oHost.getAnalyticsCloudWidgetSrc = () => {
			return "dummy-src";
		};

		const oCard = new Card({
			host: oHost,
			manifest: oExample1,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.fnIncludeScriptStub.calledWith("dummy-src"), "Src was overridden successfully");

		// Clean up
		oCard.destroy();
		oHost.destroy();
	});
});
