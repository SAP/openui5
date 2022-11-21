/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/performance/Measurement"
], function (
	Card,
	Core,
	CoreMeasurement
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Card measurements", {
		beforeEach: function () {
			this.oCard = new Card({
				dataMode: "Active"
			});

			this.stub(CoreMeasurement, "getActive").returns(true);
			this.stubbedMark = this.stub(performance, "mark").withArgs(sinon.match(this.oCard._sPerformanceId)).callsFake(function () {});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Markers placing is correct", function (assert) {
		// arrange
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();

			// assert
			assert.strictEqual(this.stubbedMark.withArgs(sinon.match(/-end$/)).callCount, 3, "There should be 3 'end' markers after the card is ready");

			// clean up
			done();
		}.bind(this));

		// assert
		assert.ok(this.stubbedMark.notCalled, "There should be no card markers before the manifest is set");

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
		assert.ok(this.stubbedMark.notCalled, "There should be no card markers before the card is rendered");

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.strictEqual(this.stubbedMark.withArgs(sinon.match(/-start$/)).callCount, 3, "There should be 3 'start' markers after the card is rendered");
	});

});