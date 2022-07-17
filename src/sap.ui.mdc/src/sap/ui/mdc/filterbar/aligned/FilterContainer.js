/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.aligned.FilterItemLayout.
sap.ui.define([
	'sap/ui/mdc/filterbar/IFilterContainer', 'sap/ui/layout/AlignedFlowLayout'
], function(IFilterContainer, AlignedFlowLayout) {
	"use strict";
	/**
	 * Constructor for a new filterBar/aligned/FilterContainer.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The FilterContainer is a IFilterContainer implementation for <code>AlignedFlowLayout</code>
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.aligned.FilterContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
