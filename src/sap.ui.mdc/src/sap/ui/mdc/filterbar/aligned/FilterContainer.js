/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer', 'sap/ui/layout/AlignedFlowLayout'
], function(IFilterContainer, AlignedFlowLayout) {
	"use strict";
	/**
	 * Constructor for a new filterBar/aligned/FilterContainer.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The <code>FilterContainer</code> is an {@link sap.ui.layout.IFilterContainer IFilterContainer} implementation for {@link sap.ui.layout.AlignedFlowLayout AlignedFlowLayout}.
	 * It is used by the {@link sap.ui.mdc.FilterBar FilterBar} to display the filter items.
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.aligned.FilterContainer
	 */
	var FilterContainer = IFilterContainer.extend("sap.ui.mdc.filterbar.aligned.FilterContainer");

	FilterContainer.prototype.init = function() {
		IFilterContainer.prototype.init.apply(this, arguments);
		this.oLayout = new AlignedFlowLayout();
	};

	FilterContainer.prototype.addButton = function(oControl) {
		this.oLayout.addEndContent(oControl);
	};

	FilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
		this.oLayout.insertContent(oControl, iIndex);
	};

	FilterContainer.prototype.removeFilterField = function(oControl) {
		this.oLayout.removeContent(oControl);
	};

	FilterContainer.prototype.getFilterFields = function() {
		return this.oLayout.getContent();
	};

	return FilterContainer;
});
