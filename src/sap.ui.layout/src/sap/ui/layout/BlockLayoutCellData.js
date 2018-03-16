/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.BlockLayoutCellData.
sap.ui.define(['sap/ui/core/LayoutData', './library'],
	function(LayoutData, library) {
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
	 * @since 1.50.0
	 * @alias sap.ui.layout.BlockLayoutCellData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time metamodel
	 */
	var BlockLayoutCellData = LayoutData.extend("sap.ui.layout.BlockLayoutCellData", { metadata : {
		library : "sap.ui.layout",
		properties : {
			/**
			 * Sets the width of the cell for S size of the BlockLayout.
			 */
			sSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for M size of the BlockLayout.
			 */
			mSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for L size of the BlockLayout.
			 */
			lSize: { type: "int", group: "Appearance", defaultValue: 1 },
			/**
			 * Sets the width of the cell for XL size of the BlockLayout.
			 */
			xlSize: { type: "int", group: "Appearance", defaultValue: 1 }
		}
	}});

	/**
	 * Defines the default behavior for moving current cell in S size on a new row
	 * @private
	 * @type {boolean}
	 */
	BlockLayoutCellData.prototype.breakRowOnSSize = true;

	/**
	 * Defines the default behavior for moving current cell in M size on a new row
	 * @private
	 * @type {boolean}
	 */
	BlockLayoutCellData.prototype.breakRowOnMSize = false;

	/**
	 * Defines the default behavior for moving current cell in L size on a new row
	 * @private
	 * @type {boolean}
	 */
	BlockLayoutCellData.prototype.breakRowOnLSize = false;

	/**
	 * Defines the default behavior for moving current cell in XL size on a new row
	 * @private
	 * @type {boolean}
	 */
	BlockLayoutCellData.prototype.breakRowOnXlSize = false;

	/**
	 * Sets width of the cell to all sizes if the width is specified.
	 * @param iValue
	 * @public
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

});
