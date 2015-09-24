/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function(jQuery, Control) {
		"use strict";

		/**
		 * Constructor for a new BlockLayoutRow.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayoutRow is used as an aggregation to the BlockLayout. It aggregates Block Layout  cells.
		 * The BlockLayoutRow has 2 rendering modes - scrollable and non scrollable.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayoutRow
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayoutRow = Control.extend("sap.ui.layout.BlockLayoutRow", { metadata : {

			library : "sap.ui.layout",

			properties : {

				/**
				 * Sets the rendering mode of the BlockLayoutRow to scrollable. In scrollable mode, the cells get
				 * aligned side by side, with horizontal scroll bar for the row.
				 */
				scrollable: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation : "content",
			aggregations: {
				/**
				 * The content cells to be included in the row.
				 */
				content: {type : "sap.ui.layout.BlockLayoutCell", multiple : true, singularName : "content"}

			}
		}});

		BlockLayoutRow.CONSTANTS = {
			maxScrollableCellsPerRow : 10,
			minScrollableCellsPerRow: 3,
			guidelineRatios: [0.25, 0.5, 0.75, 1.0]
		};

		/**
		 * Performs guidelines check
		 */
		BlockLayoutRow.prototype.onBeforeRendering = function () {
			this._checkGuidelinesAndUpdateCells();
		};

		BlockLayoutRow.prototype._checkGuidelinesAndUpdateCells = function () {
			var that = this,
				cells = this.getContent(),
				cellRatios = this._calcCellRatios(),
				differentSBreakpoint = this._checkDifferentSBreakpointCase(),
				guidelinesFollowed = this._guidelinesCheck();

			cells.forEach(function (cell, index) {
				cell._clearState();
				if (that.getScrollable()) {
					cell._setParentRowScrollable(true);
				} else if (differentSBreakpoint && guidelinesFollowed) {
					cell._setDifferentSBreakpointSize(true, cellRatios[index]);
				}
			});

			if (!this.getScrollable() && differentSBreakpoint && guidelinesFollowed) {
				this._rowSCase = true;
				this.addStyleClass("sapUiBlockRowSCase", true);
			} else {
				this._rowSCase = false;
				this.removeStyleClass("sapUiBlockRowSCase", true);
			}
		};

		/**
		 * Depending on the scrolling mode, chooses which guidelines check to execute
		 * @private
		 */
		BlockLayoutRow.prototype._guidelinesCheck = function () {
			if (this.getScrollable()) {
				return this._checkScrollableCellsCount();
			} else {
				return this._checkNonScrollableGuidelines();
			}
		};

		/**
		 * Calculates the cell ratio of each cell compared to the total width of the Row
		 * @returns {Array}
		 * @private
		 */
		BlockLayoutRow.prototype._calcCellRatios = function () {
			var cellRatios = [],
				totalRowWidth = 0,
				content = this.getContent();

			content.forEach(function (cell) {
				var cellWidth = (cell.getWidth() == 0 ) ? 1 : cell.getWidth();
				totalRowWidth += cellWidth;
			});

			content.forEach(function (cell) {
				var cellWidth = (cell.getWidth() == 0 ) ? 1 : cell.getWidth(),
					cellRatio = cellWidth / totalRowWidth;

				cellRatios.push(cellRatio);
			});

			return cellRatios;
		};

		/**
		 * For the non scrollable Row - 4 types of cells are allowed - cells with 25% 50% 75% and 100% width
		 * @private
		 */
		BlockLayoutRow.prototype._checkNonScrollableGuidelines = function () {
			var that = this,
				cellRatios = this._calcCellRatios(),
				guidelinesFollowed = true;

			cellRatios.forEach(function (cellRatio) {
				if (!that._isCellRatioIncluded(cellRatio)) {
					guidelinesFollowed = false;
				}
			});

			if (!guidelinesFollowed) {
				jQuery.sap.log.error("In your BlockLayoutRow " + this.getId() + " you are using cell ratios that are " +
				"not recommended in the guidelines. Cells can be with width of 25% 50% 75% or 100% according to the guidelines.");
			}

			return guidelinesFollowed;
		};

		/**
		 * If the row contains (25% 25% 50%) (50% 25% 25%) or (25% 25% 25% 25%) cells
		 * there is special behavior for the S Breakpoint defined, that transforms the row
		 * into two rows: (50% 50% 100%) (100% 50% 50%) or (50% 50% 50% 50%)
		 * @private
		 */
		BlockLayoutRow.prototype._checkDifferentSBreakpointCase = function () {
			var cellRatios = this._calcCellRatios(),
				cells = this.getContent();

			if (cells.length == 4 || (cells.length == 3 && cellRatios[1] != 0.5)) {
				return true;
			}

			return false;
		};

		/**
		 * Checks whether a given cell ratio is included in the guidelines ratios
		 * @param ratio
		 * @returns {boolean}
		 * @private
		 */
		BlockLayoutRow.prototype._isCellRatioIncluded = function (ratio) {
			var guidelineRatios = BlockLayoutRow.CONSTANTS.guidelineRatios;
			for (var i = 0 ; i < guidelineRatios.length; i++) {
				if (guidelineRatios[i] === ratio) {
					return true;
				}
			}

			return false;
		};

		/**
		 * Checks the total cell count of the row when in scrollable mode.
		 * The row should contain between 3 and 10 cells.
		 * @private
		 */
		BlockLayoutRow.prototype._checkScrollableCellsCount = function () {
			if (this.getContent().length > BlockLayoutRow.CONSTANTS.maxScrollableCellsPerRow) {
				jQuery.sap.log.error("You are using too much cells in your scrollable row: " + this.getId() + "." +
				"This is violating the BlockLayout guidelines, please consider changing your implementation. Max cells allowed: 10.");
				return false;
			}

			if (this.getContent().length < BlockLayoutRow.CONSTANTS.minScrollableCellsPerRow) {
				jQuery.sap.log.error("You are using not enough cells in your scrollable row: " + this.getId() + "." +
				"This is violating the BlockLayout guidelines, please consider changing your implementation. Min cells allowed: 3.");
				return false;
			}

			return true;
		};

		return BlockLayoutRow;

	}, /* bExport= */ true);
