/*global QUnit */

sap.ui.define([
	"sap/ui/layout/cssgrid/VirtualGrid"
],
function (
	VirtualGrid
) {
	"use strict";

	function initVirtualGrid(virtualGrid, width, rtl) {
		var config = {
			numberOfCols: 6,
			cellWidth: 100,
			cellHeight: 80,
			unitOfMeasure: "px",
			gapSize: 10,
			topOffset: 0,
			leftOffset: 0,
			allowDenseFill: false,
			width: width,
			rtl: rtl
		};

		virtualGrid.init(config);

		virtualGrid.fitElement('a', 2, 3);
		virtualGrid.fitElement('b', 3, 2);
		virtualGrid.fitElement('c', 4, 2);

		virtualGrid.calculatePositions();
	}

	QUnit.module("Calculations", {
		beforeEach: function () {
			this.virtualGrid = new VirtualGrid();
		},
		afterEach: function () {
			this.virtualGrid = null;
		}
	});

	QUnit.test("calc positions", function (assert) {

		initVirtualGrid(this.virtualGrid, 800, false);

		var items = this.virtualGrid.items;

		assert.strictEqual(items.a.left, '0px', 'left is correct');
		assert.strictEqual(items.a.top, '0px', 'top is correct');

		assert.strictEqual(items.b.left, '220px', 'left is correct');
		assert.strictEqual(items.b.top, '0px', 'top is correct');

		assert.strictEqual(items.c.left, '220px', 'left is correct');
		assert.strictEqual(items.c.top, '180px', 'top is correct');
	});

	QUnit.test("calc positions - rtl", function (assert) {

		initVirtualGrid(this.virtualGrid, 800, true);

		this.virtualGrid.calculatePositions();

		var items = this.virtualGrid.items;

		assert.strictEqual(items.a.left, '630px', 'left is correct');
		assert.strictEqual(items.a.top, '0px', 'top is correct');

		assert.strictEqual(items.b.left, '320px', 'left is correct');
		assert.strictEqual(items.b.top, '0px', 'top is correct');

		assert.strictEqual(items.c.left, '230px', 'left is correct');
		assert.strictEqual(items.c.top, '180px', 'top is correct');
	});
});