/**
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/layout/library"
], function (BaseObject) {
	"use strict";

	/**
	 * Add empty rows at bottom of the virtual grid.
	 */
	function expandVertically() {
		var growWith = 0;
		for (var i = 0; i < this.virtualGridMatrix.length; i++) {
			if (this.virtualGridMatrix[i][0] !== 0) {
				growWith++;
			}
		}
		if (growWith > 0) {
			this.addEmptyRows(growWith);
		}
	}

	/**
	 * Is the given value equal ('==') to 0.
	 * @param {any} currentValue The value to check
	 * @returns {boolean} If it is zero
	 */
	function isZero(currentValue) {
		return currentValue === 0;
	}

	/**
	 * Constructor for a new <code>sap.f.VirtualGrid</code>.
	 *
	 * Use to calculate item positions in a way that they mimic a CSS grid.
	 * This class is a part of polyfill of CSS grid for IE and Edge (version < 16).
	 *
	 * @class
	 * @private
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.f.VirtualGrid
	 * @extends sap.ui.base.Object
	 */
	var VirtualGrid = BaseObject.extend("sap.f.VirtualGrid");

	/**
	 * Prepares a virtual grid matrix which will be used to fit items.
	 * @param {map} settings Initial settings
	 * @param {int} settings.numberOfCols How many columns
	 * @param {int} settings.cellWidth Column size
	 * @param {int} settings.cellHeight Row size
	 * @param {string} settings.unitOfMeasure In what unit of measurement are the rest of the settings
	 * @param {int} settings.gapSize Gap between rows and columns
	 * @param {int} settings.topOffset Top corner of the grid
	 * @param {int} settings.leftOffset Left corner of the grid
	 * @param {boolean} settings.allowDenseFill Similar to "row dense" for css grid
	 * @param {boolean} settings.rtl Right to left mode
	 * @param {int} settings.width The total width of the grid
	 * @param {boolean} settings.rowsAutoHeight Define if the grid row's height is dynamically
	 * determined by the height of the highest grid element on this row
	 */
	VirtualGrid.prototype.init = function (settings) {

		// TODO: Parse Grid Settings
		// settings
		// 	gridTemplateColumns: "grid-template-columns",
		// 	gridTemplateRows: "grid-template-rows",
		// 	gridGap: "grid-gap",
		// 	gridColumnGap: "grid-column-gap",
		// 	gridRowGap: "grid-row-gap",
		// 	gridAutoRows: "grid-auto-rows",
		// 	gridAutoColumns: "grid-auto-columns",
		// 	gridAutoFlow: "grid-auto-flow"
		//---------------------------------------

		this.virtualGridMatrix = [[]];
		this.numberOfCols = settings.numberOfCols ? settings.numberOfCols : 1;
		this.numberOfRows = settings.numberOfRows ? settings.numberOfRows : 1;
		this.cellWidth = settings.cellWidth ? settings.cellWidth : 5;
		this.cellHeight = settings.cellHeight ? settings.cellHeight : 5;
		this.unitOfMeasure = settings.unitOfMeasure ? settings.unitOfMeasure : "rem";
		this.iGapSize = settings.gapSize ? settings.gapSize : 1;
		this.bAllowDenseFill = settings.allowDenseFill ? settings.allowDenseFill : false;
		this.items = {};
		this.rtl = settings.rtl;
		this.width = settings.width;
		this.rowsAutoHeight = settings.rowsAutoHeight;

		//This can be taken from parent element padding or configured
		// this.topOffset = 0.625;
		// this.leftOffset = 1;
		this.topOffset = settings.topOffset ? settings.topOffset : 0;
		this.leftOffset = settings.topOffset ? settings.leftOffset : 0;

		//Create initial virtual Grid Matrix
		for (var row = 0; row < this.numberOfRows; row++) {
			for (var col = 0; col < this.numberOfCols; col++) {
				this.virtualGridMatrix[row][col] = 0;
			}
		}

		this.lastItemPosition = {top: -1, left: -1};
	};

	/**
	 * Adds the specified number of empty rows at the bottom of the grid.
	 * @param {int} numberOfRows How many rows to add
	 */
	VirtualGrid.prototype.addEmptyRows = function (numberOfRows) {
		var len = this.virtualGridMatrix.length;
		for (var i = len; i < len + numberOfRows; i++) {
			//This creates array with the size of the columns and fills it with 0
			this.virtualGridMatrix[i] = Array.apply(null, Array(this.numberOfCols)).map(Number.prototype.valueOf, 0);
		}
	};

	/**
	 * The items currently positioned inside the virtual grid.
	 * Their exact position may not yet be calculated.
	 * @returns {map} All items with their calculated css positions.
	 */
	VirtualGrid.prototype.getItems = function () {
		return this.items;
	};

	/**
	 * The virtual matrix with the items inside.
	 * @returns {array} A matrix with all cells and rows, containing the fitted items ids
	 */
	VirtualGrid.prototype.getMatrix = function () {
		return this.virtualGridMatrix;
	};

	/**
	 * The total width of the grid in the configured unit of measure.
	 * @returns {int} Total width in the configured unit of measure
	 */
	VirtualGrid.prototype.getWidth = function () {
		if (!this.virtualGridMatrix[0]) {
			return 0;
		}

		var columns = this.virtualGridMatrix[0].length;
		return columns * this.cellWidth + (columns - 1) * this.iGapSize;
	};

	/**
	 * The total height of the grid in the configured unit of measure.
	 * @returns {int} Total height in the configured unit of measure
	 */
	VirtualGrid.prototype.getHeight = function () {
		var height = -this.iGapSize,
			rows = 0,
			row;

		if (this.rowsAutoHeight) {
			this.rowsHeights.forEach(function (item) {
				height += item + this.iGapSize;
			}.bind(this));

			return height;
		}

		for (row = 0; row < this.virtualGridMatrix.length; row++) {
			if (!this.virtualGridMatrix[row].every(isZero)) {
				rows++;
			}
		}

		return rows * this.cellHeight + (rows - 1) * this.iGapSize;
	};

	/**
	 * Calculate CSS positions (top, left, width and height) for the items which are fitted inside the virtual grid.
	 * The configured unit of measure will be used.
	 *
	 * Use <code>VirtualGrid.getItems()</code> after that to retrieve the calculated positions.
	 */
	VirtualGrid.prototype.calculatePositions = function () {

		if (this.rowsAutoHeight) {
			this.calculateRowsHeights();
		}

		var rowIndex,
			columnIndex,
			row,
			column,
			item,
			itemLeft,
			itemWidth;

		for (rowIndex = 0; rowIndex < this.virtualGridMatrix.length; rowIndex++) {

			row = this.virtualGridMatrix[rowIndex];

			for (columnIndex = 0; columnIndex < row.length; columnIndex++) {

				column = row[columnIndex];

				if (!column) {
					continue;
				}

				item = this.items[column];

				if (item.calculatedCoords) {
					continue;
				}

				itemLeft = columnIndex * (this.cellWidth + this.iGapSize) + this.leftOffset;
				itemWidth = item.cols * (this.cellWidth + this.iGapSize) - this.iGapSize;

				if (this.rtl) {
					itemLeft = this.width - itemLeft - itemWidth;
				}

				this.setItemTopAndHeight(item);

				item.left = itemLeft + this.unitOfMeasure;
				item.width = itemWidth + this.unitOfMeasure;
				item.calculatedCoords = true;
			}
		}
	};

	/**
	 * Find a place for a single item inside the virtual grid.
	 *
	 * Use <code>VirtualGrid.getMatrix()</code> to see the virtual position of all items.
	 *
	 * Use <code>VirtualGrid.calculatePositions()</code> and then <code>VirtualGrid.getItems()</code> to retrieve the calculated CSS positions for all items.
	 *
	 * @param {string} id The id of the element
	 * @param {int} columns Number of columns it needs
	 * @param {int} rows Number of rows it needs
	 * @param {int} height The height of the item
	 * @param {boolean} growVertically Should the grid grow vertically if there is not enough space
	 * @param {boolean} secondTry Flag to prevent infinite recursion
	 */
	VirtualGrid.prototype.fitElement = function (id, columns, rows, height, growVertically, secondTry) {
		var placeFound,
			item,
			that = this,
			columnsToFit = Math.min(columns, this.numberOfCols), // handles the case if item columns > total columns
			lastTop = that.lastItemPosition.top,
			lastLeft = that.lastItemPosition.left;

		this.items[id] = item = {
			rows: rows,
			height: height,
			cols: columnsToFit,
			calculatedCoords: false
		};

		if (rows > this.virtualGridMatrix.length) {
			this.addEmptyRows(rows - this.virtualGridMatrix.length);
		}

		//Check if there is enough free cells
		if (growVertically) {
			expandVertically.call(this);
		}

		this.virtualGridMatrix.forEach(function (element, row, array) {

			// here we have access to the rows 1, 2, 3
			element.forEach(function (element2d, col, array2d) {
				// now we have access to each individual box
				var isOrderGood = that.bAllowDenseFill || row > lastTop || (row === lastTop && col > lastLeft);
				if (isOrderGood && that.virtualGridMatrix[row][col] === 0 && !placeFound) {
					//Optimize  this because its not efficient
					if (that.shouldElementFit(row, col, columnsToFit, rows)) {
						that.fillElement(row, col, columnsToFit, rows, id);

						item.rowIndex = row;
						placeFound = true;
					}
				}
			});
		});

		if (!placeFound && !secondTry) {
			this.fitElement(id, columns, rows, height, true, true);
		}
	};

	/**
	 * Check if element can fit the place with start position [row][col]
	 * @param {int} row The starting row (top corner)
	 * @param {int} col The starting column (left corner)
	 * @param {int} columns How many columns to take
	 * @param {int} rows How many rows to take
	 * @returns {boolean} True if it fits
	 */
	VirtualGrid.prototype.shouldElementFit = function (row, col, columns, rows) {
		var targetHeight = row + rows;
		var targetWidth = col + columns;
		var matrix = this.virtualGridMatrix;

		for (var i = row; i < targetHeight; i++) {
			for (var j = col; j < targetWidth; j++) {
				if ((matrix[i][j] !== 0) || (matrix.length < targetHeight) || (matrix[i].length < col + columns)) {
					return false;
				}
			}
		}

		return true;
	};

	/**
	 * Fills element in the virtual matrix by passed row col columns and rows
	 * @param {int} row The starting row (top corner)
	 * @param {int} col The starting column (left corner)
	 * @param {int} columns How many columns to take
	 * @param {int} rows How many rows to take
	 * @param {string} id The id of the element
	 */
	VirtualGrid.prototype.fillElement = function (row, col, columns, rows, id) {
		for (var i = row; i < row + rows; i++) {
			for (var j = col; j < col + columns; j++) {
				this.virtualGridMatrix[i][j] = id;
			}
		}

		this.lastItemPosition = {top: row, left: col};
	};

	VirtualGrid.prototype.calculateRowsHeights = function () {
		var i,
			rowIndex,
			items = this.items,
			arrItems = [],
			currentTotalHeight,
			key,
			diff,
			rowsLength = this.virtualGridMatrix.length,
			rowsHeights = [];

		for (i = 0; i < rowsLength; i++) {
			rowsHeights.push(0);
		}

		for (key in items) {
			if (!items.hasOwnProperty(key)) {
				continue;
			}

			arrItems.push(items[key]);
		}

		arrItems.sort(function (a, b) {
			return a.rows - b.rows;
		});

		arrItems.forEach(function (item) {
			currentTotalHeight = -this.iGapSize;

			for (rowIndex = 0; rowIndex < item.rows; rowIndex++) {
				currentTotalHeight += rowsHeights[rowIndex + item.rowIndex] + this.iGapSize;
			}

			if (item.height > currentTotalHeight) {

				diff = (item.height - currentTotalHeight) / item.rows;

				for (rowIndex = 0; rowIndex < item.rows; rowIndex++) {
					rowsHeights[rowIndex + item.rowIndex] += diff;
				}
			}
		}.bind(this));

		this.rowsHeights = rowsHeights;
	};

	VirtualGrid.prototype.setItemTopAndHeight = function (item) {
		var itemRowStart = item.rowIndex;

		if (!this.rowsAutoHeight) {
			item.top = itemRowStart * (this.cellHeight + this.iGapSize) + this.topOffset + this.unitOfMeasure;
			item.height = (item.rows * (this.cellHeight + this.iGapSize) - this.iGapSize) + this.unitOfMeasure;
			return;
		}

		var rowIndex,
			top = 0,
			height = -this.iGapSize,
			rowsHeights = this.rowsHeights;

		for (rowIndex = 0; rowIndex < itemRowStart; rowIndex++) {
			top += rowsHeights[rowIndex] + this.iGapSize;
		}

		for (rowIndex = itemRowStart; rowIndex < itemRowStart + item.rows; rowIndex++) {
			height += rowsHeights[rowIndex] + this.iGapSize;
		}

		item.top = top + this.unitOfMeasure;
		item.height = height + this.unitOfMeasure;
	};

	return VirtualGrid;
});
