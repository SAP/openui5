/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * @class The <code>IFilterContainer</code> is the base container for the visualization of the filter items in the filter bar.
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.61.0
	 * @alias sap.ui.mdc.filterbar.IFilterContainer
	 */
	var IFilterContainer = Element.extend("sap.ui.mdc.filterbar.IFilterContainer");

	/**
	 * Creates the inner layout for the <code>IFilterContainer</code>.
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	IFilterContainer.prototype.init = function() {
		Element.prototype.init.apply(this, arguments);
		this.oLayout = null;
	};

	/**
	 * Getter for the inner layout item.
	 * @returns {sap.ui.core.Control} Control instance of the inner layout item
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	IFilterContainer.prototype.getInner = function(){
		return this.oLayout;
	};

	/**
	 * Inserts the inner content into the layout item.
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @param {sap.ui.mdc.FilterItem} oControl to be inserted
	 * @param {int} iIndex Position where the control is added
	 */
	IFilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
		//insert the content to the inner layout this.oLayout
	};

	/**
	 * Removes the inner content from the layout item.
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @param {sap.ui.mdc.FilterItem} oControl Control that is removed
	 */
	IFilterContainer.prototype.removeFilterField = function(oControl) {
		//remove the content from the inner layout this.oLayout
	};

	/**
	 * Returns the inner controls of the layout item.
	 * @returns {sap.ui.mdc.FilterItem[]} Array of all inner controls in the layout item
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	IFilterContainer.prototype.getFilterFields = function() {
		//return the inner controls as array
	};

	/**
	 * Overwrites the default exit to clean up the created layout properly.
	 *
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
	 * @ui5-restricted sap.ui.mdc, sap.fe
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
