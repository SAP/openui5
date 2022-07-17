/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer','sap/ui/mdc/p13n/panels/AdaptFiltersPanel'
], function(IFilterContainer, AdaptFiltersPanel) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/GroupContainer.
     * Used for a complex groupable FilterBar UI, should be used in combination with <code>FilterGroupLayout</code>
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The GroupContainer is a IFilterContainer implementation for <code>sap.m.Table</code>
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @private
	 * @since 1.82.0
	 * @alias sap.ui.mdc.filterbar.p13n.GroupContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupContainer = IFilterContainer.extend("sap.ui.mdc.filterbar.p13n.GroupContainer");

	GroupContainer.prototype.init = function() {

		IFilterContainer.prototype.init.apply(this, arguments);

		this.mFilterItems = {
		};

		this.oLayout = new AdaptFiltersPanel();

		this.oLayout.setItemFactory(function(oBindingContext){
			var sKey = oBindingContext.getProperty(oBindingContext.sPath).name;
			var oFilterItem = this.mFilterItems[sKey];
			return oFilterItem;
		}.bind(this));
	};

	GroupContainer.prototype.setMessageStrip = function (oStrip) {
		this.oLayout.getCurrentViewContent().setMessageStrip(oStrip);
	};

	GroupContainer.prototype.insertFilterField = function(oControl, iIndex) {
		this.mFilterItems[oControl._getFieldPath()] = oControl;
	};

	GroupContainer.prototype.removeFilterField = function(oControl) {
		this.oLayout.removeItem(oControl);
	};

	GroupContainer.prototype.getFilterFields = function() {
		var aFilterItems = [];

		Object.keys(this.mFilterItems).forEach(function(sKey){
			aFilterItems.push(this.mFilterItems[sKey]);
		}.bind(this));

		return aFilterItems;
	};

	GroupContainer.prototype.update = function(oP13nData) {
		this.oLayout.restoreDefaults();
	};

	GroupContainer.prototype.setP13nData = function(oAdaptationData) {
		this.oLayout.setP13nData(oAdaptationData);
	};

	GroupContainer.prototype.exit = function() {
		this.mFilterItems = null;
		this.mFilterFields = null;
		IFilterContainer.prototype.exit.apply(this, arguments);
	};

	return GroupContainer;
});