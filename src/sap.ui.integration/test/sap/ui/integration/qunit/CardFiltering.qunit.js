/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Filtering", {
		beforeEach: function () {
			this.oCard = new Card();
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
			assert.strictEqual(oFilterBar.getItems().length, 1, "The filter bar has 1 filter");

			var oFirstFilter = oFilterBar.getItems()[0];
			assert.strictEqual(oFirstFilter._getSelect().getItems().length, 2, "The filter options are 2.");

			oFirstFilter._getSelect().getItems().forEach(function (oItem, iInd) {
				assert.strictEqual(oItem.getKey(), aOptions[iInd].key, "Option at position " + iInd + " has a valid key.");
				assert.strictEqual(oItem.getText(), aOptions[iInd].title, "Option at position " + iInd + " has a valid title.");
			});

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.module("Dynamic filters", {
		beforeEach: function () {
			this.oCard = new Card();
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});
});