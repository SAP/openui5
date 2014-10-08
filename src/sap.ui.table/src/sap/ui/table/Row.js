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
	 * @name sap.ui.table.Row
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
	 * Returns the index of the row in the table or -1 if not added to a table.
	 *
	 * @name sap.ui.table.Row#getIndex
	 * @function
	 * @type int
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	Row.prototype.getIndex = function() {
		var oTable = this.getParent();
		if (oTable) {
			var iFirstRow = oTable.getFirstVisibleRow();
			var iRowIndex = oTable.indexOfRow(this);
			return iFirstRow + iRowIndex;
		}
		return -1;
	};

	return Row;

}, /* bExport= */ true);
