/* global QUnit sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/core/Core"
], function (
	Card,
	RequestDataProvider,
	Host,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Filters in Card", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Filter items by category", function (assert) {
		// Arrange
		var done = assert.async(),
			sCategory = "notebooks",
			sStatus = "2 of 3";

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oHeader = this.oCard.getAggregation("_header"),
				oContentList = this.oCard.getCardContent().getInnerList(),
				oListItems = oContentList.getItems();

			// Assert
			assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is ok.");
			assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");
			assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");

			// Act - change the category to flat_screens
			sCategory = "flat_screens";
			sStatus = "2 of 4";

			this.oCard.getModel("filters").setProperty("/category/value", "flat_screens");
			Core.applyChanges();

			setTimeout(function () {
				assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is ok.");
				assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");
				assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");
				done();
			}, 500);

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("No data available for particular filter", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getModel("filters").setProperty("/shipper/value", "43");

			Core.applyChanges();

			setTimeout(function () {
				assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, 0, "an empty list is displayed");
				done();
			}.bind(this), 500);

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardFilteringNoDataForFilter/manifest.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("configurationChange event is fired", function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host(),
			oFireConfigurationChangeSpy = sinon.spy(this.oCard, "fireConfigurationChange"),
			oFireCardConfigurationChangeHostSpy = sinon.spy(oHost, "fireCardConfigurationChange");

		this.oCard.setHost(oHost);

		this.oCard.attachEvent("_ready", function () {
			// Act
			var oFilterBar = this.oCard.getAggregation("_filterBar"),
				oSelect = oFilterBar.getItems()[0]._getSelect(),
				mArguments;

			oSelect.onSelectionChange({
				getParameter: function () {
					return oSelect.getItems()[0];
				}
			});
			Core.applyChanges();

			assert.ok(oFireConfigurationChangeSpy.called, "configurationChange event is fired");
			assert.ok(oFireCardConfigurationChangeHostSpy.called, "cardConfigurationChange event of the Host is fired");

			mArguments = oFireConfigurationChangeSpy.args[0][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");

			mArguments = oFireCardConfigurationChangeHostSpy.args[0][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");
			assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

			oFireConfigurationChangeSpy.reset();
			oFireCardConfigurationChangeHostSpy.reset();
			oHost.destroy();

			done();

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Dynamic filters", {
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

	QUnit.test("Loading a filter using a data request", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar.getItems().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar.getItems()[0];
			assert.strictEqual(oFilter._getSelect().getSelectedKey(), "available", "property binding works");
			assert.strictEqual(oFilter._getSelect().getItems()[1].getKey(), "out_of_stock", "option has the expected key");

			done();
		}, this);

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_dynamic_filter.json");
	});

	QUnit.test("Unable to load the filter", function (assert) {
		// Arrange
		var done = assert.async();
		this.stub(RequestDataProvider.prototype, "getData").rejects("Fake data load error");

		this.oCard.attachEvent("_ready", function () {
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			var sErrorText = oFilterBar.getItems()[0]._getErrorMessage().getItems()[1].getText();
			var sExpectedErrorText = Core.getLibraryResourceBundle("sap.ui.integration").getText("CARD_FILTER_DATA_LOAD_ERROR");

			// Assert
			assert.strictEqual(sErrorText, sExpectedErrorText, "Error message is correct");

			done();
		}, this);

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.errorMessage",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Select",
							"data": {
								"request": {
									"url": "/some/url"
								}
							},
							"item": {
								"template": {
									"title": "{OptionName}",
									"key": "{OptionKey}"
								}
							}
						}
					}
				},
				"type": "Object",
				"content": {
					"groups": []
				}
			}
		});
	});

});