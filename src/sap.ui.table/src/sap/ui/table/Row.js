/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Row.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './library'],
	function(jQuery, Element, library) {
	"use strict";


	
	/**
	 * Constructor for a new Row.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The row.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Row
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Row = Element.extend("sap.ui.table.Row", /** @lends sap.ui.table.Row.prototype */ { metadata : {
	
		library : "sap.ui.table",
		defaultAggregation : "cells",
		aggregations : {
	
			/**
			 * The controls for the cells.
			 */
			cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell"}
		}
	}});
	
	
	/**
	 * Returns the index of the row in the table or -1 if not added to a table. This
	 * function considers the scroll position of the table and also takes fixed rows and
	 * fixed bottom rows into account.
	 *
	 * @return {int} index of the row (considers scroll position and fixed rows)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Row.prototype.getIndex = function() {
		var oTable = this.getParent();
		if (oTable) {
			// get the index of the row in the aggregation
			var iRowIndex = oTable.indexOfRow(this);

			// check for fixed rows. In this case the index of the context is the same like the index of the row in the aggregation
			var iNumberOfFixedRows = oTable.getFixedRowCount();
			if (iNumberOfFixedRows > 0 && iRowIndex < iNumberOfFixedRows) {
				return iRowIndex;
			}

			// check for fixed bottom rows
			var iNumberOfFixedBottomRows = oTable.getFixedBottomRowCount();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			if (iNumberOfFixedBottomRows > 0 && iRowIndex >= iVisibleRowCount - iNumberOfFixedBottomRows) {
				var oBinding = oTable.getBinding("rows");
				if (oBinding && oBinding.getLength() >= iVisibleRowCount) {
					return oBinding.getLength() - (iVisibleRowCount - iRowIndex);
				} else {
					return iRowIndex;
				}
			}

			var iFirstRow = oTable.getFirstVisibleRow();
			return iFirstRow + iRowIndex;
		}
		return -1;
	};

	return Row;

}, /* bExport= */ true);
