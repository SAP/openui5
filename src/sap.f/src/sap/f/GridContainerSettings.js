/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dom/units/Rem",
	"sap/base/Log"
], function (
	ManagedObject,
	Rem,
	Log
) {
	"use strict";

	/**
	 * Converts the given css size to its corresponding 'px' value.
	 * @private
	 * @param {string} sCssSize The css size to parse. For example '5rem'.
	 * @returns {int} The size in 'px'. The result is rounded up with Math.ceil(). Returns NaN if the size can not be parsed.
	 */
	function cssSizeToPx(sCssSize) {
		if (sCssSize === 0 || sCssSize === "0") {
			return 0;
		}

		var aMatch = sCssSize.match(/^(\d+(\.\d+)?)(px|rem)$/),
			iValue;
		if (aMatch) {
			if (aMatch[3] === "px") {
				iValue = parseFloat(aMatch[1]);
			} else {
				iValue = Rem.toPx(parseFloat(aMatch[1]));
			}
		} else {
			Log.error("Css size '" + sCssSize + "' is not supported for some features in GridContainer. Only 'px' and 'rem' are supported.");
			iValue = NaN;
		}

		return Math.ceil(iValue);
	}

	/**
	 * Constructor for a new <code>sap.f.GridContainerSettings</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Holds a set of settings that define the dimensions of <code>sap.f.GridContainer</code>.
	 *
	 * Can be used to define the sizes of columns and rows for different screen sizes, by using the <code>layout</code> aggregations of <code>sap.f.GridContainer</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental Since 1.65 This class is experimental. The API may change.
	 * @since 1.65
	 * @public
	 * @constructor
	 * @alias sap.f.GridContainerSettings
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerSettings = ManagedObject.extend("sap.f.GridContainerSettings", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * How many columns to have on a row.
				 *
				 * If not defined, <code>sap.f.GridContainer</code> will position as many columns as they can fit in the container.
				 */
				columns: { type: "int" },

				/**
				 * The width of the columns.
				 *
				 * <b>Note:</b> Values different than single size in 'px' or 'rem' are not supported for the polyfill for IE.
				 */
				columnSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				/**
				 * Sets the minimum width of the columns. Setting this together with <code>maxColumnSize</code> will allow the columns to breath between those two values.
				 *
				 * <b>Note:</b> Will not work in combination with <code>columnSize</code>.
				 *
				 * <b>Note:</b> Not supported for the polyfill for IE.
				 */
				minColumnSize: { type: "sap.ui.core.CSSSize" },

				/**
				 * Sets the maximum width of the columns. Setting this together with <code>minColumnSize</code> will allow the columns to breath between those two values.
				 *
				 * <b>Note:</b> Will not work in combination with <code>columnSize</code>.
				 *
				 * <b>Note:</b> Not supported for the polyfill for IE.
				 */
				maxColumnSize: { type: "sap.ui.core.CSSSize" },

				/**
				 * The height of the rows.
				 *
				 * <b>Note:</b> Use only 'px' or 'rem'. Some features may not work as expected otherwise.
				 */
				rowSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				/**
				 * The size of the gap between columns and rows.
				 *
				 * <b>Note:</b> Use only 'px' or 'rem'. Some features may not work as expected otherwise.
				 */
				gap: { type: "sap.ui.core.CSSSize", defaultValue: "16px" }
			}
		}
	});

	/**
	 * Gets the column size, converted to its 'px' value.
	 * @returns {int} The 'px' value. NaN if 'px' value can not be calculated.
	 */
	GridContainerSettings.prototype.getColumnSizeInPx = function () {
		return cssSizeToPx(this.getColumnSize());
	};

	/**
	 * Gets the row size, converted to its 'px' value.
	 * @returns {int} The 'px' value. NaN if 'px' value can not be calculated.
	 */
	GridContainerSettings.prototype.getRowSizeInPx = function () {
		return cssSizeToPx(this.getRowSize());
	};

	/**
	 * Gets the gap size, converted to its 'px' value.
	 * @returns {int} The 'px' value. NaN if 'px' value can not be calculated.
	 */
	GridContainerSettings.prototype.getGapInPx = function () {
		return cssSizeToPx(this.getGap());
	};

	/**
	 * Calculates how many columns the grid should have, based on gap size and column size.
	 *
	 * If "columns" property is specified, then this is returned directly. No calculations are made.
	 *
	 * @param {int} iGridInnerWidth The inner width of the grid in 'px'.
	 * @returns {int} The number of columns which are defined by "columns" property or which will fit in the given width. NaN if it can not be calculated.
	 */
	GridContainerSettings.prototype.getComputedColumnsCount = function (iGridInnerWidth) {
		if (this.getColumns()) {
			return this.getColumns();
		}

		var iGapSize = this.getGapInPx(),
			iColumnSize = this.getColumnSizeInPx();

		return Math.floor((iGridInnerWidth + iGapSize) / (iColumnSize + iGapSize));
	};

	/**
	 * Calculates how many rows would an item need to fit, based on its height.
	 * @param {int} iItemHeight The height of the item.
	 * @returns {int} The calculated rows for the given height. NaN if it can not be calculated.
	 */
	GridContainerSettings.prototype.calculateRowsForItem = function (iItemHeight) {
		var iGapSize = this.getGapInPx(),
			iRowSize = this.getRowSizeInPx();

		return Math.ceil((iItemHeight + iGapSize) / (iRowSize + iGapSize));
	};

	/**
	 * Calculates how many columns would an item need to fit, based on its width.
	 * @param {int} iItemWidth The width of the item.
	 * @returns {int} The calculated columns for the given width. NaN if it can not be calculated.
	 */
	GridContainerSettings.prototype.calculateColumnsForItem = function (iItemWidth) {
		var iGapSize = this.getGapInPx(),
			iColumnSize = this.getColumnSizeInPx();

		return Math.ceil((iItemWidth + iGapSize) / (iColumnSize + iGapSize));
	};

	return GridContainerSettings;
});