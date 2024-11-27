/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/integration/cards/filters/ComboBoxFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Element,
	ComboBoxFilter,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("ComboBox Filter - Base Methods");

	QUnit.test("writeValueToConfiguration", function (assert) {
		// Arrange
		const oCBF = new ComboBoxFilter();
		oCBF.placeAt(DOM_RENDER_LOCATION);
		oCBF.getField().setValue("new value");
		const oConfiguration = {};

		// Act
		oCBF.writeValueToConfiguration(oConfiguration);

		// Assert
		assert.deepEqual(
			oConfiguration,
			{
				value: "new value"
			},
			"Value is written correctly to the configuration"
		);

		// Clean up
		oCBF.destroy();
	});

	QUnit.module("ComboBox Initialization", {
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

	QUnit.test("ComboBox for filter 'category' is rendered", async function (assert) {
		// Arrange
		var aOptions = [
				{
					"title": "Flat Screen Monitors",
					"key": "FSM",
					"additionalText": "FSM"
				},
				{
					"title": "Graphic Cards",
					"key": "GC",
					"additionalText": "GC"
				},
				{
					"title": "Mouses and Keyboards",
					"key": "MK",
					"additionalText": "MK"
				},
				{
					"title": "Motherboards",
					"key": "MB",
					"additionalText": "MB"
				}
			];

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_filter.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		var oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

		var oFirstFilter = oFilterBar._getFilters()[0];
		assert.strictEqual(oFirstFilter._getComboBox().getItems().length, 4, "The filter options are 4.");

		assert.strictEqual(oFirstFilter._getComboBox().getPlaceholder(), "Test Placeholder", "The property placeholder is set");

		oFirstFilter._getComboBox().getItems().forEach(function (oItem, iInd) {
			assert.strictEqual(oItem.getKey(), aOptions[iInd].key, "Option at position " + iInd + " has a valid key.");
			assert.strictEqual(oItem.getText(), aOptions[iInd].title, "Option at position " + iInd + " has a valid title.");
			assert.strictEqual(oItem.getAdditionalText(), aOptions[iInd].additionalText, "Option at position " + iInd + " has a valid additional text.");
		});

		assert.strictEqual(oFirstFilter._getComboBox().getSelectedKey(), aOptions[0].key, "The proper key is selected");
		assert.strictEqual(oFirstFilter._getComboBox().getSelectedItem().getKey(), aOptions[0].key, "The selected item key is correct");
		assert.strictEqual(oFirstFilter._getComboBox().getSelectedItem().getText(), aOptions[0].title, "The selected item title is correct");
		assert.strictEqual(oFirstFilter._getComboBox().getSelectedItem().getAdditionalText(), aOptions[0].additionalText, "The selected item additional text is correct");
	});

	QUnit.test("Loading a filter using a static data", async function (assert) {
		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_filter.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		var oFilter = oFilterBar._getFilters()[0];

		// Assert
		assert.strictEqual(oFilter._getComboBox().getSelectedKey(), "FSM", "property binding works");
		assert.strictEqual(oFilter._getComboBox().getItems()[1].getKey(), "GC", "option has the expected key");
		assert.strictEqual(this.oCard.getCardHeader().getTitle(), oFilter._getComboBox().getItems()[0].getText(), "Filter title is properly resolved");
		assert.strictEqual(this.oCard.getCardHeader().getSubtitle(), oFilter._getComboBox().getItems()[0].getAdditionalText(), "Filter additional text is properly resolved");
		assert.strictEqual(this.oCard.getCardContent()._getList().getItems()[0].getTitle(), oFilter._getComboBox().getItems()[0].getKey(), "Filter key is properly resolved");
		assert.strictEqual(this.oCard.getCardContent()._getList().getItems()[0].getDescription(), oFilter._getComboBox().getValue(), "Filter value is properly resolved");
		assert.strictEqual(this.oCard.getCardHeader().getSubtitle(), "FSM", "The additional text is correct");
	});

	QUnit.test("ComboBox filter with dynamic data", function (assert) {
		// Arrange
		assert.expect(7);
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
			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify(oFakeData));
		});

		this.oCard.attachEventOnce("_ready", function () {

			var oFilterBar = this.oCard.getAggregation("_filterBar");

			// Assert
			assert.ok(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Initial filter model data contains 'selectedItem'");

			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar._getFilters()[0];

			assert.strictEqual(oFilter._getComboBox().getSelectedKey(), "1", "property binding works");
			assert.strictEqual(oFilter._getComboBox().getItems()[0].getKey(), "1", "option has the expected key");

			assert.strictEqual(
				this.oCard.getModel("filters").getProperty("/shipper/selectedItem/title"),
				oFakeData[0].CompanyName,
				"Filter model title data should be updated after data is loaded"
			);
			assert.strictEqual(
				this.oCard.getModel("filters").getProperty("/shipper/selectedItem/key"),
				"1",
				"Filter model key data should be updated after data is loaded"
			);
			assert.strictEqual(
				this.oCard.getModel("filters").getProperty("/shipper/selectedItem/key"),
				this.oCard.getAggregation("_filterBar")._getFilters()[0]._getComboBox().getSelectedKey(),
				"Filter model key and combo box selected key are equal"
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
							"selectedKey": 1,
							"type": "ComboBox",
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
					"title": "Orders by Shipper {filters>/shipper/selectedItem/title}",
					"subTitle": "Orders by Shipper {filters>/shipper/selectedItem/key}"
				},
				"content": {
					"groups": []
				}
			}
		});
	});

	QUnit.test("Specified selectedIndex value for filter", function (assert) {
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
			assert.strictEqual(oXhr.requestHeaders.shippername, "Speedy Express", "The request header is correct");

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
							"selectedIndex": 0,
							"type": "ComboBox",
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
							"ShipperName": "{filters>/shipper/value}"
						}
					},
					"path": "/value"
				}
			}
		});
	});

	QUnit.module("ComboBoxFilter Properties", {
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

	QUnit.test("Label", function (assert) {
		// Arrange
		var oConfig = {
			label: "Some label"
		};
		var oCBF = new ComboBoxFilter({
			config: oConfig
		});
		var oLabel = Element.getElementById(oCBF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oCBF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

	QUnit.test("Combo box filter items can be grouped", async function (assert) {
		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_grouping.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const aItems = this.oCard.getAggregation("_filterBar")._getFilters()[0]._getComboBox().getItems();

		// Assert
		assert.strictEqual(aItems.length, 6, "There are 4 items and 2 group titles in the combo box.");
		assert.ok(aItems[0].isA("sap.ui.core.SeparatorItem"), "The first item is a group separator");
		assert.strictEqual(aItems[0].getText(), "Group 1", "The first group title text is correct");
		assert.ok(aItems[3].isA("sap.ui.core.SeparatorItem"), "The fourth item is a group separator");
		assert.strictEqual(aItems[3].getText(), "Group 2", "The fourth group title text is correct");
	});

});