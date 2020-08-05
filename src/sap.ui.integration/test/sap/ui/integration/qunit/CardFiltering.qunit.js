/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
],
function (
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
					"value": "flat_screens"
				},
				{
					"title": "Notebooks",
					"value": "notebooks"
				}
			];

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oFilterBar = this.oCard.getAggregation("_filterBar"),
				aFirstSelect;

			// Assert
			assert.strictEqual(oFilterBar.getItems().length, 1, "The filter has 1 select");

			aFirstSelect = oFilterBar.getItems()[0];

			assert.strictEqual(aFirstSelect.getItems().length, 2, "The select options are 2.");

			aFirstSelect.getItems().forEach(function (oItem, iInd) {
				assert.strictEqual(oItem.getKey(), aOptions[iInd].value, "Option at position " + iInd + " has a valid key.");
				assert.strictEqual(oItem.getText(), aOptions[iInd].title, "Option at position " + iInd + " has a valid title.");
			});

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering.json");
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
				oListItems = this.oCard.getCardContent().getInnerList().getItems();

			// Assert
			assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is ok.");
			assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");

			assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");

			if (sCategory === "flat_screens") {
				done();
				return;
			}

			// Act - change the category to flat_screens
			sCategory = "flat_screens";
			sStatus = "2 of 4";
			this.oCard._setFilterValue("category", "flat_screens");
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

});