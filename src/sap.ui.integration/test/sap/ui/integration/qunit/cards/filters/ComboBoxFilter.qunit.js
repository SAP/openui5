/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/filters/ComboBoxFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	ComboBoxFilter,
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

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

	QUnit.test("ComboBox for filter 'category' is rendered", function (assert) {
		// Arrange
		var done = assert.async(),
			aOptions = [
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

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

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

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_filter.json");
	});

	QUnit.test("Loading a filter using a static data", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");

			var oFilter = oFilterBar._getFilters()[0];
			assert.strictEqual(oFilter._getComboBox().getSelectedKey(), "FSM", "property binding works");
			assert.strictEqual(oFilter._getComboBox().getItems()[1].getKey(), "GC", "option has the expected key");
			assert.strictEqual(this.oCard.getCardHeader().getTitle(), oFilter._getComboBox().getItems()[0].getText(), "Filter title is properly resolved");
			assert.strictEqual(this.oCard.getCardHeader().getSubtitle(), oFilter._getComboBox().getItems()[0].getAdditionalText(), "Filter additional text is properly resolved");
			assert.strictEqual(this.oCard.getCardContent()._getList().getItems()[0].getTitle(), oFilter._getComboBox().getItems()[0].getKey(), "Filter key is properly resolved");
			assert.strictEqual(this.oCard.getCardContent()._getList().getItems()[0].getDescription(), oFilter._getComboBox().getValue(), "Filter value is properly resolved");
			assert.strictEqual(this.oCard.getCardHeader().getSubtitle(), "FSM", "The additional text is correct");
			done();
		}, this);

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_filter.json");
	});

	QUnit.test("ComboBox filter with dynamic data", function (assert) {
		// Arrange
		assert.expect(8);
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
			assert.notOk(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Initial filter model data doesn't contain 'selectedItem'");

			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar._getFilters()[0];

			assert.strictEqual(oFilter._getComboBox().getSelectedKey(), "1", "property binding works");
			assert.strictEqual(oFilter._getComboBox().getItems()[0].getKey(), "1", "option has the expected key");
		}.bind(this));

		this.oCard.attachEventOnce("configurationChange", function () {
			// Assert
			assert.ok(this.oCard.getModel("filters").getProperty("/shipper").hasOwnProperty("selectedItem"), "Filter model data should contain 'selectedItem' after data update");
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

	QUnit.module("ComboBoxFilter Properties");

	QUnit.test("Label", function (assert) {
		// Arrange
		var oConfig = {
			label: "Some label"
		};
		var oCBF = new ComboBoxFilter({
			config: oConfig
		});
		var oLabel = Core.byId(oCBF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oCBF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

});