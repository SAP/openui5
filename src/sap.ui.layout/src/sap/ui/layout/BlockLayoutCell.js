/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
		"use strict";

		/**
		 * Constructor for a new BlockLayoutCell.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayoutCell is used as an aggregation of the BlockLayoutRow. It contains Controls.
		 * The BlockLayoutCell should be used only as aggregation of the BlockLayoutRow.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayoutCell
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayoutCell = Control.extend("sap.ui.layout.BlockLayoutCell", { metadata : {

			library : "sap.ui.layout",
			properties : {

				/**
				 * Defines the title of the cell
				 */
				title: { type: "string", group: "Appearance", defaultValue: null },

				/**
				 * Defines the alignment of the cell title
				 */
				titleAlignment: { type: "sap.ui.core.HorizontalAlign", group: "Appearance", defaultValue: "Begin" },

				/**
				 * Defines the aria level of the title
				 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
				 */
				titleLevel: { type: "sap.ui.core.TitleLevel", group: "Appearance", defaultValue: "Auto"},

				/**
				 * Defines the width of the cell. Depending on the context of the cell - whether it's in scrollable,
				 * or non scrollable row, this property is interpreted in two different ways.
				 * If the cell is placed inside a scrollable row - this property defines the width of the cell in
				 * percentages. If no value is provided - the default is 40%.
				 * If the cell is placed inside a non scrollable row - this property defines the grow factor of the cell
				 * compared to the whole row.
				 * <b>For example:</b> If you have 2 cells, each with width of 1, this means that they should be of equal size,
				 * and they need to fill the whole row. This results in 50% width for each cell. If you have 2 cells,
				 * one with width of 1, the other with width of 3, this means that the whole row width is 4, so the first
				 * cell will have a width of 25%, the second - 75%.
				 * According to the visual guidelines, it is suggested that you only use 25%, 50%, 75% or 100% cells in
				 * you applications. For example, 12,5% width is not desirable (1 cell with width 1, and another with width 7)
				 */
				width: { type: "int", group: "Appearance", defaultValue: 0 }

			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * The content to be included inside the cell
				 */
				content: {type : "sap.ui.core.Control", multiple : true, singularName : "content"}

			}
		}});

		/**
		 * When the width is set, the cell needs to notify the parent row if it's in scrollable mode
		 * to update the other cells as well.
		 * @param The width of the cell
		 * @returns {BlockLayoutCell}
		 */
		BlockLayoutCell.prototype.setWidth = function (width) {
			this.setProperty("width", width);
			if (!this._getParentRowScrollable()) {
				var parent = this.getParent();
				if (parent) {
					parent._checkGuidelinesAndUpdateCells();
				}
			}
			return this;
		};

		/**
		 * This method is called from the BlockLayoutRow, when a new cell is added, removed, or when a given cell in the row
		 * changes its width. Then the whole row gets updated again.
		 * @private
		 */
		BlockLayoutCell.prototype._clearState = function () {
			this._parentRowScrollable = false;
			this._differentSBreakpointSize = false;
		};

		BlockLayoutCell.prototype._setDifferentSBreakpointSize = function (different, ratio) {
			this._differentSBreakpointSize = different;
			this._widthToRowWidthRatio = ratio;
		};

		BlockLayoutCell.prototype._getDifferentSBreakpointSize = function () {
			return this._differentSBreakpointSize;
		};

		BlockLayoutCell.prototype._getWidthToRowWidthRatio = function () {
			return this._widthToRowWidthRatio;
		};

		BlockLayoutCell.prototype._setParentRowScrollable = function (scrollable) {
			this._parentRowScrollable = scrollable;
		};

		BlockLayoutCell.prototype._getParentRowScrollable = function () {
			return this._parentRowScrollable;
		};

		return BlockLayoutCell;

	}, /* bExport= */ true);
