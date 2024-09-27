/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/integration/cards/filters/SelectFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Element,
	SelectFilter,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Select Filter - Base Methods");

	QUnit.test("writeValueToConfiguration", async function (assert) {
		// Arrange
		const oSF = new SelectFilter({
			configuration: {
				value: "all",
				items: [
					{
						key: "all"
					},
					{
						key: "notebooks"
					}
				]
			}
		});
		oSF.getField().setSelectedKey("notebooks");
		await nextUIUpdate();
		const oConfiguration = {};

		// Act
		oSF.writeValueToConfiguration(oConfiguration);

		// Assert
		assert.deepEqual(
			oConfiguration,
			{
				value: "notebooks"
			},
			"Value is written correctly to the configuration"
		);

		// Clean up
		oSF.destroy();
	});

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

	QUnit.test("Select for filter 'category' is rendered", async function (assert) {
		// Arrange
		var aOptions = [
				{
					"title": "Flat Screen Monitors",
					"key": "flat_screens"
				},
				{
					"title": "Notebooks",
					"key": "notebooks"
				}
			];

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		var oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.strictEqual(oFilterBar._getFilters().length, 5, "The filter bar has 5 filters");

		var oFirstFilter = oFilterBar._getFilters()[0];
		assert.strictEqual(oFirstFilter._getSelect().getItems().length, 2, "The filter options are 2.");

		oFirstFilter._getSelect().getItems().forEach(function (oItem, iInd) {
			assert.strictEqual(oItem.getKey(), aOptions[iInd].key, "Option at position " + iInd + " has a valid key.");
			assert.strictEqual(oItem.getText(), aOptions[iInd].title, "Option at position " + iInd + " has a valid title.");
		});
	});

	QUnit.test("Initial value for filters model when filter is with dynamic data", function (assert) {
		// Arrange
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
			assert.ok(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Initial filter model data contains 'selectedItem'");

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

	QUnit.test("Not specified initial value for filter", function (assert) {
		// Arrange
		var done = assert.async();
		var oFakeData = [{
			ShipperID: 14,
			CompanyName: "Speedy Express"
		}];
		var oServer = sinon.createFakeServer({
			autoRespond: true,
			respondImmediately: true
		});

		oServer.respondWith("GET", /test-resources\/sap\/ui\/integration\/qunit\/fake-api$/, function (oXhr) {
			oXhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(oFakeData));
		});

		oServer.respondWith("GET", /test-resources\/sap\/ui\/integration\/qunit\/fake-api-content$/, function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders.shipperid, "14", "The request header is correct");

			oXhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify([]));
		});

		this.oCard.attachEventOnce("_ready", function () {
			// Assert
			assert.ok(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Initial filter model data contains 'selectedItem'");
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
				"data": {
					"request": {
						"method": "GET",
						"url": "test-resources/sap/ui/integration/qunit/fake-api-content",
						"headers": {
							"ShipperId": "{filters>/shipper/value}"
						}
					},
					"path": "/value"
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
		var oLabel = Element.getElementById(oSF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oSF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

});