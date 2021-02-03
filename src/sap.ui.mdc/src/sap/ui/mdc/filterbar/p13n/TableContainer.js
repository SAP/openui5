/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer','sap/m/Table', 'sap/m/Column', 'sap/m/Text'
], function(IFilterContainer, Table, Column, Text) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/TableContainer.
     * Used for a simple FilterBar table like view, should be used in combination with <code>FilterCellLayout</code>
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The TableContainer is a IFilterContainer implementation for <code>sap.m.Table</code>
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @private
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.TableContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableContainer = IFilterContainer.extend("sap.ui.mdc.filterbar.p13n.TableContainer");

	TableContainer.prototype.init = function() {
		IFilterContainer.prototype.init.apply(this, arguments);
		var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		this.oLayout = new Table({
			sticky: ["ColumnHeaders"],
			growing: true,
			columns: [
				new Column({
					header: new Text({
						text: oRB.getText("filter.AdaptationFilterBar_FIELD_COLUMN")
					})
				}),
				new Column({
					header: new Text({
						text: oRB.getText("filter.AdaptationFilterBar_FIELD_VALUE_COLUMN")
					})
				})
			]
		});
	};

	TableContainer.prototype.insertFilterField = function(oControl, iIndex) {
		this.oLayout.insertItem(oControl, iIndex);
	};

	TableContainer.prototype.removeFilterField = function(oControl) {
		this.oLayout.removeItem(oControl);
	};

	TableContainer.prototype.getFilterFields = function() {
		return this.oLayout.getItems();
	};

	TableContainer.prototype.update = function() {
		//Called when the UI model is being set - trigger update logic here
	};

	return TableContainer;
});