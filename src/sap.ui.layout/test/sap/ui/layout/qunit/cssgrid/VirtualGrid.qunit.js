/*global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/layout/cssgrid/VirtualGrid"
],
function (
	jQuery,
	VirtualGrid
) {
	"use strict";

	function initVirtualGrid(virtualGrid, options) {
		var config = {
			width: 800,
			numberOfCols: 6,
			cellWidth: 100,
			cellHeight: 80,
			unitOfMeasure: "px",
			gapSize: 10,
			topOffset: 0,
			leftOffset: 0,
			allowDenseFill: false
		};

		jQuery.extend(config, options || {});
		virtualGrid.init(config);
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

		initVirtualGrid(this.virtualGrid);

		this.virtualGrid.fitElement('a', 2, 3);
		this.virtualGrid.fitElement('b', 3, 2);
		this.virtualGrid.fitElement('c', 4, 2);

		this.virtualGrid.calculatePositions();

		var items = this.virtualGrid.items;

		assert.strictEqual(items.a.left, '0px', 'left is correct');
		assert.strictEqual(items.a.top, '0px', 'top is correct');

		assert.strictEqual(items.b.left, '220px', 'left is correct');
		assert.strictEqual(items.b.top, '0px', 'top is correct');

		assert.strictEqual(items.c.left, '220px', 'left is correct');
		assert.strictEqual(items.c.top, '180px', 'top is correct');
	});

	QUnit.test("calc positions - rtl", function (assert) {

		initVirtualGrid(this.virtualGrid, {
			rtl: true
		});

		this.virtualGrid.fitElement('a', 2, 3);
		this.virtualGrid.fitElement('b', 3, 2);
		this.virtualGrid.fitElement('c', 4, 2);

		this.virtualGrid.calculatePositions();

		var items = this.virtualGrid.items;

		assert.strictEqual(items.a.left, '590px', 'left is correct');
		assert.strictEqual(items.a.top, '0px', 'top is correct');

		assert.strictEqual(items.b.left, '260px', 'left is correct');
		assert.strictEqual(items.b.top, '0px', 'top is correct');

		assert.strictEqual(items.c.left, '150px', 'left is correct');
		assert.strictEqual(items.c.top, '180px', 'top is correct');

		assert.strictEqual(this.virtualGrid.getHeight(), 350, 'total height is correct');
	});

	QUnit.test("calc positions - rows auto height", function (assert) {

		initVirtualGrid(this.virtualGrid, {
			rowsAutoHeight: true
		});

		this.virtualGrid.fitElement('a', 2, 4, 200);
		this.virtualGrid.fitElement('b', 3, 2, 400);
		this.virtualGrid.fitElement('c', 4, 2, 300);
		this.virtualGrid.fitElement('d', 3, 2, 400);
		this.virtualGrid.fitElement('e', 3, 2, 300);

		this.virtualGrid.calculatePositions();

		var items = this.virtualGrid.items;

		assert.strictEqual(items.a.left, '0px', 'left is correct');
		assert.strictEqual(items.a.top, '0px', 'top is correct');
		assert.strictEqual(items.a.height, '710px', 'height is correct');

		assert.strictEqual(items.b.left, '220px', 'left is correct');
		assert.strictEqual(items.b.top, '0px', 'top is correct');
		assert.strictEqual(items.b.height, '400px', 'height is correct');

		assert.strictEqual(items.c.left, '220px', 'left is correct');
		assert.strictEqual(items.c.top, '410px', 'top is correct');
		assert.strictEqual(items.c.height, '300px', 'height is correct');

		assert.strictEqual(items.d.left, '0px', 'left is correct');
		assert.strictEqual(items.d.top, '720px', 'top is correct');
		assert.strictEqual(items.d.height, '400px', 'height is correct');

		assert.strictEqual(items.e.left, '330px', 'left is correct');
		assert.strictEqual(items.e.top, '720px', 'top is correct');
		assert.strictEqual(items.e.height, '400px', 'height is correct');

		assert.strictEqual(this.virtualGrid.getHeight(), 1140, 'total height is correct');
	});
});