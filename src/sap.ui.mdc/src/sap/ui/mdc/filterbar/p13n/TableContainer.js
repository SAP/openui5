/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/Text',
	'sap/m/VBox',
	'sap/ui/mdc/p13n/panels/FilterPanel',
	"sap/ui/core/Lib"
], function(IFilterContainer, Table, Column, Text, VBox, FilterPanel, Lib) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/TableContainer.
     * Used for a simple FilterBar table like view, should be used in combination with <code>FilterGroupLayout</code>
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The TableContainer is a IFilterContainer implementation for <code>sap.m.Table</code>
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @private
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.TableContainer
	 */
	const TableContainer = IFilterContainer.extend("sap.ui.mdc.filterbar.p13n.TableContainer");

	TableContainer.prototype.init = function() {
		IFilterContainer.prototype.init.apply(this, arguments);
		const oRB = Lib.getResourceBundleFor("sap.ui.mdc");
		this._oTable = new Table({
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

		this.oLayout = new FilterPanel({
			enableReorder: false,
			itemFactory: function(oItem){
				const sKey = oItem.name;
				const oFilterItem = this.mFilterItems[sKey];
				return oFilterItem;
			}.bind(this)
		});

		this.mFilterItems = {};

	};

	TableContainer.prototype.insertFilterField = function(oControl, iIndex) {
		const oFilterBar = oControl._oFilterField.getParent();
		const oProperty = oFilterBar._getPropertyByName(oControl._getFieldPath());
		if (oProperty) {
			this.mFilterItems[oProperty.name] = oControl;
		}
	};

	TableContainer.prototype.setP13nData = function(oAdaptationData) {
		this.oLayout.setP13nData(oAdaptationData.items);
	};

	TableContainer.prototype.removeFilterField = function(oControl) {
		this._oTable.removeItem(oControl);
	};

	TableContainer.prototype.setMessageStrip = function(oStrip) {
		this.oLayout.setMessageStrip(oStrip);
	};

	TableContainer.prototype.getFilterFields = function() {
		return this._oTable.getItems();
	};

	TableContainer.prototype.update = function(oP13nModel) {
		//Called when the UI model is being set - trigger update logic here
	};

	TableContainer.prototype.exit = function() {
		this._oTable = null;
	};

	TableContainer.prototype.getInitialFocusedControl = function() {
		return this.oLayout.getInitialFocusedControl && this.oLayout.getInitialFocusedControl();
	};

	return TableContainer;
});