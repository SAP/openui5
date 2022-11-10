/*global QUnit */

sap.ui.define([
	"sap/f/GridNavigationMatrix",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery"
],
function (
	GridNavigationMatrix,
	createAndAppendDiv,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "grid-area";
	createAndAppendDiv(DOM_RENDER_LOCATION);

	QUnit.module("Creating navigation matrix - different configurations", {
		createGrid: function (sCont) {
			this.$grid = jQuery(sCont).css({
				display: "grid",
				gridTemplateColumns: "repeat(3, 8rem)"
			});
			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			return this.$grid;
		},
		afterEach: function () {
			this.$grid.detach();
		}
	});

	QUnit.test("1 row / 1 column per item", function (assert) {
		this.createGrid(
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
				"<div>item 6</div>" +
			"</div>"
		).css({
			gap: "8px"
		});
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

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

	QUnit.test("Item with 2 rows / 2 cols", function (assert) {
		// Arrange
		this.createGrid(
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
			"</div>"
		).css({
			gap: "8px"
		}).children()[1].style = "grid-row: span 2; grid-column: span 2;";
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

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

	QUnit.test("1 row / 1 column per item, grid with padding", function (assert) {
		this.createGrid(
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
				"<div>item 6</div>" +
			"</div>"
		).css({
			gap: "8px",
			padding: "1.5rem 1rem"
		});

		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

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

	QUnit.test("Item starting and ending on specific row (no grid-auto-flow)", function (assert) {
		// Arrange
		this.createGrid(
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
			"</div>"
		).css({
			gap: "8px"
		}).children()[0].style = "grid-row: 2 / 3";
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

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
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
			"</div>"
		).css({
			gap: "8px"
		}).children()[0].style = "grid-column: 2 / 3;";
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

		// Assert - specific column item
		assert.strictEqual(this.$grid.children().get(0), aMatrix[0][1], "Item position is correct");

		// Assert - rest of the items
		assert.strictEqual(this.$grid.children().get(1), aMatrix[0][2], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(2), aMatrix[1][0], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(3), aMatrix[1][1], "Item position is correct");
		assert.strictEqual(this.$grid.children().get(4), aMatrix[1][2], "Item position is correct");
	});

	QUnit.test("1 row / 1 column per item with 0px gap", function (assert) {
		this.createGrid(
			"<div>" +
				"<div>item 1</div>" +
				"<div>item 2</div>" +
				"<div>item 3</div>" +
				"<div>item 4</div>" +
				"<div>item 5</div>" +
				"<div>item 6</div>" +
			"</div>"
		).css({
			gap: "0px"
		});
		var aMatrix = GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get());

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
});
