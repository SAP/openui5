/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.BlockLayoutCellData.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LayoutData', './library'],
	function(jQuery, LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new BlockLayoutCellData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the BlockLayoutCells contents.
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.layout.BlockLayoutCellData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time metamodel
	 */
	var BlockLayoutCellData = LayoutData.extend("sap.ui.layout.BlockLayoutCellData", { metadata : {
		library : "sap.ui.layout",
		properties : {
			/**
			 * Sets the width of the cell for M size of the BlockLayout.
			 * <b>Note:</b> The accepted values are only in percents!
			 */
			sSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for M size of the BlockLayout.
			 * <b>Note:</b> The accepted values are only in percents!
			 */
			mSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for M size of the BlockLayout.
			 * <b>Note:</b> The accepted values are only in percents!
			 */
			lSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for M size of the BlockLayout.
			 * <b>Note:</b> The accepted values are only in percents!
			 */
			xlSize: { type: "int", group: "Appearance", defaultValue: 1 }
		}
	}});

	/***
	 * These properties defines the default behaviour for moving current cell on new row in different sizes
	 * @private
	 * @type {boolean}
	 */
	BlockLayoutCellData.prototype.breakRowOnSSize = true;
	BlockLayoutCellData.prototype.breakRowOnMSize = false;
	BlockLayoutCellData.prototype.breakRowOnLSize = false;
	BlockLayoutCellData.prototype.breakRowOnXlSize = false;

	/***
	 * Sets width of the cell to all sizes if the width is specified.
	 * @param iValue
	 * @returns {sap.ui.layout.BlockLayoutCellData}
	 */
	BlockLayoutCellData.prototype.setSize = function (iValue) {
		this.setProperty("mSize", iValue);
		this.setProperty("lSize", iValue);
		this.setProperty("xlSize", iValue);

		var oRow = this.getParent();
		if (oRow && oRow.getParent()) {
			oRow.getParent().invalidate();
		}

		return this;
	};

	return BlockLayoutCellData;

}, /* bExport= */ true);
