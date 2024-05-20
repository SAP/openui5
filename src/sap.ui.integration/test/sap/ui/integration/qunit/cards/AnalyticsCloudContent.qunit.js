/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/AnalyticsCloudContent",
	"sap/ui/integration/util/AnalyticsCloudHelper",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	AnalyticsCloudContent,
	AnalyticsCloudHelper,
	Host,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oExample1 = {
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
				"title": "Demonstration SAC Card",
				"subTitle": "Shows a widget from story"
			},
			"content": {
				"minHeight": "25rem",
				"widget": {
					"storyId": "{parameters>/storyId/value}",
					"widgetId": "{parameters>/widgetId/value}",
					"destination": "{{destinations.SAC}}"
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
							renderWidget: sinon.stub()
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
		const oCard = new Card({
			manifest: oExample1,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(sap.sac.api.widget.setup.calledOnce, "sap.sac.api.widget.setup was called only once.");

		assert.ok(sap.sac.api.widget.renderWidget.calledOnce, "sap.sac.api.widget.renderWidget was called only once.");

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
