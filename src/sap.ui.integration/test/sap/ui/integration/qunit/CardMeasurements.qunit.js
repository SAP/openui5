/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/base/config",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Card,
	BaseConfig,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Card measurements", {
		beforeEach: function () {
			var that = this;
			this.oCard = new Card({
				dataMode: "Active"
			});

			BaseConfig._.invalidate();
			this.bMeasureCards = true;
			this.stubbedMeasureCards = this.stub(BaseConfig, "get").callsFake(function(mParams) {
				return mParams.name === "sapUiXxMeasureCards" ? that.bMeasureCards : that.stubbedMeasureCards.wrappedMethod.call(this, mParams);
			});

			this.spyMark = this.spy(performance, "mark").withArgs(sinon.match(this.oCard._sPerformanceId));
			this.spyMeasure = this.spy(performance, "measure").withArgs(sinon.match(this.oCard._sPerformanceId));
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.stubbedMeasureCards.restore();
		}
	});

	QUnit.test("Markers placing is correct", async function (assert) {
		// assert
		assert.ok(this.spyMark.notCalled, "There should be no card markers before the manifest is set");
		assert.ok(this.spyMeasure.notCalled, "There should be no card measures before the manifest is set");

		// act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.measurements"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"item": { }
				}
			}
		});

		// assert
		assert.ok(this.spyMark.notCalled, "There should be no card markers before the card is rendered");

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.spyMark.withArgs(sinon.match(/-start$/)).callCount, 3, "There should be 3 'start' markers after the card is rendered");
		assert.strictEqual(this.spyMark.withArgs(sinon.match(/-end$/)).callCount, 3, "There should be 3 'end' markers after the card is ready");
		assert.strictEqual(this.spyMeasure.callCount, 3, "There should be 3 measurements after the card is ready");
	});

	QUnit.test("Markers are not placed if disabled", async function (assert) {
		// act
		BaseConfig._.invalidate();
		this.bMeasureCards = false;

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.measurements"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"item": { }
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// assert
		assert.ok(this.spyMark.notCalled, "There are no markers when card measurement is disabled");
		assert.ok(this.spyMeasure.notCalled, "There are no measurements when card measurement is disabled");
	});

});