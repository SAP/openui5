/**
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/layout/library"
], function (BaseObject) {
	"use strict";

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

	function isZero(currentValue) {
		return currentValue == 0;
	}

	var VirtualGrid = BaseObject.extend("sap.f.VirtualGrid");

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
	};

	/**
	 *
	 * @param numberOfRows
	 */
	VirtualGrid.prototype.addEmptyRows = function (numberOfRows) {
		var len = this.virtualGridMatrix.length;
		for (var i = len; i < len + numberOfRows; i++) {
			//This creates array with the size of the columns and fills it with 0
			this.virtualGridMatrix[i] = Array.apply(null, Array(this.numberOfCols)).map(Number.prototype.valueOf, 0);
		}
	};
	/**
	 *
	 * @returns {{}|*}
	 */
	VirtualGrid.prototype.getItems = function () {
		return this.items;
	};

	/**
	 *
	 * @returns {any[][]}
	 */
	VirtualGrid.prototype.getMatrix = function () {
		return this.virtualGridMatrix;
	};
	/**
	 *
	 * @returns {*}
	 */
	VirtualGrid.prototype.getHeight = function () {
		var rows = 0;
		for (var row = 0; row < this.virtualGridMatrix.length; row++) {
			if (!this.virtualGridMatrix[row].every(isZero)) {
				rows++;
			}
		}
		return rows * (this.cellHeight + (this.iGapSize - 1));
	};

	/**
	 *
	 */
	VirtualGrid.prototype.calculatePositions = function () {
		for (var row = 0; row < this.virtualGridMatrix.length; row++) {
			for (var col = 0; col < this.virtualGridMatrix[row].length; col++) {

				if (!this.items[parseInt(this.virtualGridMatrix[row][col])].calculatedCoords) {

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
	 *
	 * @param id
	 * @param width
	 * @param height
	 * @param growVertically
	 */
	VirtualGrid.prototype.fitElement = function (id, width, height, growVertically) {
		var palaceFound;
		var that = this;

		this.items[id] = {
			rows: height,
			cols: width,
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
				if (that.virtualGridMatrix[row][col] === 0 && !palaceFound) {
					//Optimize  this because its not efficient
					if (that.shouldElementFit(row, col, width, height)) {
						that.fillElement(row, col, width, height, id);
						palaceFound = true;
					}
				}
			});
		});

		if (!palaceFound && growVertically) {
			this.virtualGridMatrix.forEach(function (element, row) {
				// here we have access to the rows 1, 2, 3
				element.forEach(function (element2d, col) {
					// now we have access to each individual box
					if (that.virtualGridMatrix[row][col] === 0 && !palaceFound) {
						//Optimize  this because its not efficient
						if (that.shouldElementFit(row, col, that.numberOfCols, height)) {
							that.fillElement(row, col, that.numberOfCols, height, id);
							palaceFound = true;
						}
					}
				});
			});
		}

		if (!palaceFound) {
			this.fitElement(id, width, height, true);
		}
	};

	/**
	 * Check if element can fit the place with start position [row][col]
	 * @param row
	 * @param col
	 * @param width
	 * @param height
	 * @returns {boolean}
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
	 * Fills element in the virtualMatrix by passed row col width and height
	 * @param row
	 * @param col
	 * @param width
	 * @param height
	 * @param id
	 */
	VirtualGrid.prototype.fillElement = function (row, col, width, height, id) {
		for (var i = row; i < row + height; i++) {
			for (var j = col; j < col + width; j++) {
				this.virtualGridMatrix[i][j] = id;
			}
		}
	};

	return VirtualGrid;
});
