/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer','sap/ui/mdc/p13n/panels/GroupPanelBase'
], function(IFilterContainer, GroupPanelBase) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/GroupContainer.
     * Used for a complex groupable FilterBar UI, should be used in combination with <code>FilterColumnLayout</code>
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

		this.mFilterItems = {
		};
		this.mFilterFields = {
		};

		this.oLayout = new GroupPanelBase({
			expandFirstGroup: true
		});

		this.oLayout.setItemFactory(function(sId, oBindingContext){
			var sKey = this.oLayout.getModel().getProperty(oBindingContext.sPath).name;
			var oFilterItemClone, oFilterItem = this.mFilterItems[sKey];

			oFilterItemClone = oFilterItem.bIsDestroyed ? oFilterItem.clone() : oFilterItem;

			oFilterItemClone.bindProperty("selected", {
				path: "selected"
			});

			var oFilterField = this.mFilterFields[sKey];

			oFilterItemClone.setFilterField(oFilterField);

			this.mFilterItems[sKey] = oFilterItemClone;
			return oFilterItemClone;
		}.bind(this));
	};

	GroupContainer.prototype.insertFilterField = function(oControl, iIndex) {
		this.mFilterItems[oControl._getFieldPath()] = oControl;
		this.mFilterFields[oControl._getFieldPath()] = oControl._oFilterField;
	};

	GroupContainer.prototype.removeFilterField = function(oControl) {
		this.oLayout.removeItem(oControl);
	};

	GroupContainer.prototype.getFilterFields = function() {
		var aFilterItems = [];
		var aOuterItems = this.oLayout._oListControl.getItems();
		aOuterItems.forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			var aInnerItems = oPanel.getContent()[0].getItems();
			aInnerItems.forEach(function(oInnerItem){
				aFilterItems.push(oInnerItem);
			});
		});

		return aFilterItems;
	};

	GroupContainer.prototype.exit = function() {
		this.mFilterItems = null;
		this.mFilterFields = null;
	};

	return GroupContainer;
});