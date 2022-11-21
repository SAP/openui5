/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/filters/SelectFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	SelectFilter,
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Initialization", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Select for filter 'category' is rendered", function (assert) {
		// Arrange
		var done = assert.async(),
			aOptions = [
				{
					"title": "Flat Screen Monitors",
					"key": "flat_screens"
				},
				{
					"title": "Notebooks",
					"key": "notebooks"
				}
			];

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar._getFilters().length, 4, "The filter bar has 4 filters");

			var oFirstFilter = oFilterBar._getFilters()[0];
			assert.strictEqual(oFirstFilter._getSelect().getItems().length, 2, "The filter options are 2.");

			oFirstFilter._getSelect().getItems().forEach(function (oItem, iInd) {
				assert.strictEqual(oItem.getKey(), aOptions[iInd].key, "Option at position " + iInd + " has a valid key.");
				assert.strictEqual(oItem.getText(), aOptions[iInd].title, "Option at position " + iInd + " has a valid title.");
			});

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
	});

	QUnit.test("Initial value for filters model when filter is with dynamic data", function (assert) {
		// Arrange
		assert.expect(3);
		var done = assert.async();
		var oFakeData = [{
			ShipperID: 1,
			CompanyName: "Speedy Express"
		}];
		var oServer = sinon.createFakeServer({
			autoRespond: true,
			respondImmediately: true
		});

		oServer.respondWith("GET", /test-resources\/sap\/ui\/integration\/qunit\/fake-api$/, function (oXhr) {
			oXhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(oFakeData));
		});

		this.oCard.attachEventOnce("_ready", function () {
			// Assert
			assert.notOk(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Initial filter model data doesn't contain 'selectedItem'");
		}.bind(this));

		this.oCard.attachEventOnce("configurationChange", function () {
			// Assert
			assert.ok(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Filter model data should contain 'selectedItem' after data update");
			assert.strictEqual(
				this.oCard.getModel("filters").getProperty("/shipper/selectedItem/title"),
				oFakeData[0].CompanyName,
				"Filter model data should be updated after data is loaded"
			);

			// Clean up
			oServer.restore();
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "tests.card.filters.dynamicFilter"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"shipper": {
							"value": 1,
							"type": "Select",
							"item": {
								"path": "/",
								"template": {
									"key": "{ShipperID}",
									"title": "{CompanyName}"
								}
							},
							"data": {
								"request": {
									"url": "test-resources/sap/ui/integration/qunit/fake-api"
								}
							}
						}
					}
				},
				"type": "Object",
				"header": {
					"title": "Orders by Shipper {filters>/shipper/selectedItem/title}"
				},
				"content": {
					"groups": []
				}
			}
		});
	});

	QUnit.module("SelectFilter Properties");

	QUnit.test("Label", function (assert) {
		// Arrange
		var oConfig = {
			label: "Some label"
		};
		var oSF = new SelectFilter({
			config: oConfig
		});
		var oLabel = Core.byId(oSF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oSF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

});