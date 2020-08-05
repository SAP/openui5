/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	var IFilterContainer = Element.extend("sap.ui.mdc.filterbar.IFilterContainer");

	/**
	 * Creates the inner layout for the IFilterContainer.
	 * @protected
	 */
	IFilterContainer.prototype.init = function() {
		this.oLayout = null;
	};

	/**
	 * Getter for the inner layout item.
	 * @returns {Control} Control instance of the inner layout item.
	 * @protected
	 */
	IFilterContainer.prototype.getInner = function(){
		return this.oLayout;
	};

	/**
	 * Insert the inner content to the layout item.
	 * @protected
	 */
	IFilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
		//insert the content to the inner layout this.oLayout
	};

	/**
	 * Remove the inner content from the layout item.
	 * @protected
	 */
	IFilterContainer.prototype.removeFilterField = function(oControl) {
		//remove the content from the inner layout this.oLayout
	};

	/**
	 * Insert the inner content to the layout item.
	 * @returns {Array} Array of all inner controls in the layout item.
	 * @protected
	 */
	IFilterContainer.prototype.getFilterFields = function() {
		//return the inner controls as array
	};

	/**
	 * Overwrite the default 'exit' to cleanup the created layout properly
	 *
	 * @protected
	 */
	IFilterContainer.prototype.exit = function() {
		Element.prototype.exit.apply(this, arguments);
		if (this.oLayout){
			this.oLayout.destroy();
			this.oLayout = null;
		}
	};

	return IFilterContainer;
});
