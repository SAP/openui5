/*global QUnit */

sap.ui.define([
	"sap/f/GridNavigationMatrix",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Configuration"
],
function (
	GridNavigationMatrix,
	createAndAppendDiv,
	Configuration
) {
	"use strict";

	const DOM_RENDER_LOCATION = "grid-area";
	createAndAppendDiv(DOM_RENDER_LOCATION);
	const EMPTY_CELL = GridNavigationMatrix.EMPTY_CELL;

	function createGridItem(itemText, itemStyles = {}) {
		const item = document.createElement("div");

		item.appendChild(document.createTextNode(itemText));

		for (const [name, value] of Object.entries(itemStyles)) {
			item.style.setProperty(name, value);
		}

		return item;
	}

	function createGrid(gridConfig) {
		const grid = document.createElement("div");
		const gridStyles = {
			display: "grid",
			...gridConfig.styles
		};

		gridConfig.items.forEach(grid.appendChild.bind(grid));

		for (const [name, value] of Object.entries(gridStyles)) {
			grid.style.setProperty(name, value);
		}

		return grid;
	}

	function testMatrix(config, assert) {
		document.getElementById(DOM_RENDER_LOCATION).appendChild(config.grid);

		let matrix = GridNavigationMatrix.create(config.grid, Array.from(config.grid.children));

		assert.deepEqual(matrix, config.expectedMatrix, "Navigation matrix should be correct");

		Configuration.setRTL(true);
		matrix = GridNavigationMatrix.create(config.grid, Array.from(config.grid.children));

		assert.deepEqual(matrix, config.expectedRTLMatrix, "Navigation matrix should be correct in RTL");

		Configuration.setRTL(false);
		config.grid.remove();
	}

	QUnit.module("Creating navigation matrix - different configurations");

	QUnit.test("1 row / 1 column per item", function (assert) {
		const item1 = createGridItem("item 1");
		const item2 = createGridItem("item 2");
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");
		const item6 = createGridItem("item 6");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5, item6],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "0px"
				}
			}),
			expectedMatrix: [
				[item1, item2, item3],
				[item4, item5, item6]
			],
			expectedRTLMatrix: [
				[item3, item2, item1],
				[item6, item5, item4]
			]
		}, assert);
	});

	QUnit.test("Item with 2 rows / 2 cols", function (assert) {
		const item1 = createGridItem("item 1");
		const item2 = createGridItem("item 2", {
			"grid-row": "span 2",
			"grid-column": "span 2"
		});
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "8px"
				}
			}),
			expectedMatrix: [
				[item1, item2, item2],
				[item3, item2, item2],
				[item4, item5, EMPTY_CELL]
			],
			expectedRTLMatrix: [
				[item2, item2, item1],
				[item2, item2, item3],
				[EMPTY_CELL, item5, item4]
			]
		}, assert);
	});

	QUnit.test("1 row / 1 column per item, grid with padding", function (assert) {
		const item1 = createGridItem("item 1");
		const item2 = createGridItem("item 2");
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");
		const item6 = createGridItem("item 6");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5, item6],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "8px",
					padding: "1.5rem 1rem"
				}
			}),
			expectedMatrix: [
				[item1, item2, item3],
				[item4, item5, item6]
			],
			expectedRTLMatrix: [
				[item3, item2, item1],
				[item6, item5, item4]
			]
		}, assert);
	});

	QUnit.test("Item starting and ending on specific row (no grid-auto-flow)", function (assert) {
		const item1 = createGridItem("item 1", {
			"grid-row": "2 / 3"
		});
		const item2 = createGridItem("item 2");
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "8px"
				}
			}),
			expectedMatrix: [
				[item2, item3, item4],
				[item1, item5, EMPTY_CELL]
			],
			expectedRTLMatrix: [
				[item4, item3, item2],
				[EMPTY_CELL, item5, item1]
			]
		}, assert);
	});

	QUnit.test("Item starting and ending on specific column (no grid-auto-flow)", function (assert) {
		const item1 = createGridItem("item 1", {
			"grid-column": "2 / 3"
		});
		const item2 = createGridItem("item 2");
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "8px"
				}
			}),
			expectedMatrix: [
				[EMPTY_CELL, item1, item2],
				[item3, item4, item5]
			],
			expectedRTLMatrix: [
				[item2, item1, EMPTY_CELL],
				[item5, item4, item3]
			]
		}, assert);
	});

	QUnit.test("1 row / 1 column per item with 0px gap", function (assert) {
		const item1 = createGridItem("item 1");
		const item2 = createGridItem("item 2");
		const item3 = createGridItem("item 3");
		const item4 = createGridItem("item 4");
		const item5 = createGridItem("item 5");
		const item6 = createGridItem("item 6");

		testMatrix({
			grid: createGrid({
				items: [item1, item2, item3, item4, item5, item6],
				styles: {
					"grid-template-columns": "repeat(3, 8rem)",
					gap: "0px"
				}
			}),
			expectedMatrix: [
				[item1, item2, item3],
				[item4, item5, item6]
			],
			expectedRTLMatrix: [
				[item3, item2, item1],
				[item6, item5, item4]
			]
		}, assert);
	});
});
