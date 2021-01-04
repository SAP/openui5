/*global QUnit */

sap.ui.define([
	"sap/f/GridNavigationMatrix",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
],
function (
	GridNavigationMatrix,
	createAndAppendDiv,
	Device,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "grid-area";
	createAndAppendDiv(DOM_RENDER_LOCATION);

	QUnit.module("Creating navigation matrix - different configurations", {
		createGrid: function (sCont) {
			this.$grid = jQuery(sCont);
			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.$grid.detach();
		}
	});

	QUnit.test("1 row / 1 column per item", function (assert) {
		// Arrange
		if (Device.browser.msie) {
			this.createGrid(
				"<div style='width: 250px;'>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 1</div>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 2</div>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 3</div>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 4</div>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 5</div>" +
					"<div style='width: 72px; height: 72px; display: inline-block; padding-right: 8px; padding-bottom: 8px;'>item 6</div>" +
				"</div>"
			);
		} else {
			this.createGrid(
				"<div style='display: grid; grid-template-columns: repeat(3, 8rem); grid-gap: 8px;'>" +
					"<div>item 1</div>" +
					"<div>item 2</div>" +
					"<div>item 3</div>" +
					"<div>item 4</div>" +
					"<div>item 5</div>" +
					"<div>item 6</div>" +
				"</div>"
			);
		}
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
			gap: 8,
			columns: Device.browser.msie ? ["72px", "72px", "72px"] : this.$grid.css("gridTemplateColumns").split(/\s+/),
			rows: Device.browser.msie ? ["72px", "72px"] : this.$grid.css("gridTemplateRows").split(/\s+/)
		});

		// Assert
		assert.strictEqual(aMatrix.length, 2, "There are 2 rows");
		assert.strictEqual(aMatrix[0].length, 3, "There are 3 columns");
		assert.strictEqual(this.$grid.children().get(0), aMatrix[0][0], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(1), aMatrix[0][1], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(2), aMatrix[0][2], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(3), aMatrix[1][0], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(4), aMatrix[1][1], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(5), aMatrix[1][2], "Item position is correct");
	});

	if (!Device.browser.msie) {
		QUnit.test("Item with 2 rows / 2 cols", function (assert) {
			// Arrange
			this.createGrid(
				"<div style='display: grid; grid-template-columns: repeat(3, 8rem); grid-gap: 8px;'>" +
					"<div>item 1</div>" +
					"<div style='grid-row: span 2; grid-column: span 2;'>item 2</div>" +
					"<div>item 3</div>" +
					"<div>item 4</div>" +
					"<div>item 5</div>" +
				"</div>"
			);
			var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
				gap: 8,
				columns: this.$grid.css("gridTemplateColumns").split(/\s+/),
				rows: this.$grid.css("gridTemplateRows").split(/\s+/)
			});

			// Assert - 2 rows / 2 columns item position
			assert.strictEqual(this.$grid.children().get(1), aMatrix[0][1], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(1), aMatrix[0][2], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(1), aMatrix[1][1], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(1), aMatrix[1][2], "Item position is correct");

			// Assert - rest of the items
			assert.strictEqual(this.$grid.children().get(0), aMatrix[0][0], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(2), aMatrix[1][0], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(3), aMatrix[2][0], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(4), aMatrix[2][1], "Item position is correct");
		});

		QUnit.test("Item starting and ending on specific row (no grid-auto-flow)", function (assert) {
			// Arrange
			this.createGrid(
				"<div style='display: grid; grid-template-columns: repeat(3, 8rem); grid-gap: 8px;'>" +
					"<div style='grid-row: 2 / 3;'>item 1</div>" +
					"<div>item 2</div>" +
					"<div>item 3</div>" +
					"<div>item 4</div>" +
					"<div>item 5</div>" +
				"</div>"
			);
			var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
				gap: 8,
				columns: this.$grid.css("gridTemplateColumns").split(/\s+/),
				rows: this.$grid.css("gridTemplateRows").split(/\s+/)
			});

			// Assert - specific row item
			assert.strictEqual(this.$grid.children().get(0), aMatrix[1][0], "Item position is correct");

			// Assert - rest of the items
			assert.strictEqual(this.$grid.children().get(1), aMatrix[0][0], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(2), aMatrix[0][1], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(3), aMatrix[0][2], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(4), aMatrix[1][1], "Item position is correct");
		});

		QUnit.test("Item starting and ending on specific column (no grid-auto-flow)", function (assert) {
			// Arrange
			this.createGrid(
				"<div style='display: grid; grid-template-columns: repeat(3, 8rem); grid-gap: 8px;'>" +
					"<div style='grid-column: 2 / 3;'>item 1</div>" +
					"<div>item 2</div>" +
					"<div>item 3</div>" +
					"<div>item 4</div>" +
					"<div>item 5</div>" +
				"</div>"
			);
			var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
				gap: 8,
				columns: this.$grid.css("gridTemplateColumns").split(/\s+/),
				rows: this.$grid.css("gridTemplateRows").split(/\s+/)
			});

			// Assert - specific column item
			assert.strictEqual(this.$grid.children().get(0), aMatrix[0][1], "Item position is correct");

			// Assert - rest of the items
			assert.strictEqual(this.$grid.children().get(1), aMatrix[0][2], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(2), aMatrix[1][0], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(3), aMatrix[1][1], "Item position is correct");
			assert.strictEqual(this.$grid.children().get(4), aMatrix[1][2], "Item position is correct");
		});
	}
});
