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
	 * The total height of the grid in the configured unit of measure.
	 * @returns {*} Total height in the configured unit of measure
	 */
	VirtualGrid.prototype.getHeight = function () {
		var rows = 0;
		for (var row = 0; row < this.virtualGridMatrix.length; row++) {
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
		for (var row = 0; row < this.virtualGridMatrix.length; row++) {
			for (var col = 0; col < this.virtualGridMatrix[row].length; col++) {

				if (!this.virtualGridMatrix[row][col]) {
					continue;
				}

				if (!this.items[this.virtualGridMatrix[row][col]].calculatedCoords) {

					var item = this.items[this.virtualGridMatrix[row][col]];

					item.top = row * (this.cellHeight + this.iGapSize) + this.topOffset + this.unitOfMeasure;
					item.left = col * (this.cellWidth + this.iGapSize) + this.leftOffset + this.unitOfMeasure;
					item.width = (item.cols * (this.cellHeight + this.iGapSize) - this.iGapSize) + this.unitOfMeasure;
					item.height = (item.rows * (this.cellWidth + this.iGapSize) - this.iGapSize) + this.unitOfMeasure;
					item.calculatedCoords = true;
				}
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
	 * @param {int} width Number of columns it needs
	 * @param {int} height Number of rows it needs
	 * @param {boolean} growVertically Should the grid grow vertically if there is not enough space
	 * @param {boolean} secondTry Flag to prevent infinite recursion
	 */
	VirtualGrid.prototype.fitElement = function (id, width, height, growVertically, secondTry) {
		var placeFound,
			that = this,
			widthToFit = Math.min(width, this.numberOfCols), // handles the case if item columns > total columns
			lastTop = that.lastItemPosition.top,
			lastLeft = that.lastItemPosition.left;

		this.items[id] = {
			rows: height,
			cols: widthToFit,
			calculatedCoords: false
		};

		if (height > this.virtualGridMatrix.length) {
			this.addEmptyRows(height - this.virtualGridMatrix.length);
		}

		//Check if there is enough free cells
		if (growVertically) {
			expandVertically.call(this);
		}

		this.virtualGridMatrix.forEach(function (element, row, array) {
			// here we have access to the rows 1, 2, 3
			element.forEach(function (element2d, col, array2d) {
				// now we have access to each individual box
				var isOrderGood = that.bAllowDenseFill || row > lastTop || (row == lastTop && col > lastLeft);
				if (isOrderGood && that.virtualGridMatrix[row][col] === 0 && !placeFound) {
					//Optimize  this because its not efficient
					if (that.shouldElementFit(row, col, widthToFit, height)) {
						that.fillElement(row, col, widthToFit, height, id);
						placeFound = true;
					}
				}
			});
		});

		if (!placeFound && !secondTry) {
			this.fitElement(id, width, height, true, true);
		}
	};

	/**
	 * Check if element can fit the place with start position [row][col]
	 * @param {int} row The starting row (top corner)
	 * @param {int} col The starting column (left corner)
	 * @param {int} width How many columns to take
	 * @param {int} height How many rows to take
	 * @returns {boolean} True if it fits
	 */
	VirtualGrid.prototype.shouldElementFit = function (row, col, width, height) {
		var targetHeight = row + height;
		var targetWidth = col + width;
		var matrix = this.virtualGridMatrix;

		for (var i = row; i < targetHeight; i++) {
			for (var j = col; j < targetWidth; j++) {
				if ((matrix[i][j] !== 0) || (matrix.length < targetHeight) || (matrix[i].length < col + width)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Fills element in the virtual matrix by passed row col width and height
	 * @param {int} row The starting row (top corner)
	 * @param {int} col The starting column (left corner)
	 * @param {int} width How many columns to take
	 * @param {int} height How many rows to take
	 * @param {string} id The id of the element
	 */
	VirtualGrid.prototype.fillElement = function (row, col, width, height, id) {
		for (var i = row; i < row + height; i++) {
			for (var j = col; j < col + width; j++) {
				this.virtualGridMatrix[i][j] = id;
			}
		}

		this.lastItemPosition = {top: row, left: col};
	};

	return VirtualGrid;
});
