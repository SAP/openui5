/*!
 * ${copyright}
 */

sap.ui.define([
	"../../ListDelegate"
], (
	ListDelegate
) => {
	"use strict";

	/**
	 * Base delegate for {@link sap.ui.mdc.List} and <code>ODataV4</code>. Extend this object in your project to use all functionalities of the
	 * list. For more information, please see {@link module:sap/ui/mdc/ListDelegate}.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/ListDelegate
	 * @extends module:sap/ui/mdc/ListDelegate
	 * @since 1.154
	 * @public
	 */
	const Delegate = Object.assign({}, ListDelegate);

	/**
	 * @inheritdoc
	 */
	Delegate.updateBinding = function(oList, oBindingInfo, oBinding, mSettings) {
		// Use the compact selection counter when selections are cleared on filter, as they can never exceed the visible count.
		oList._oTableTitle?.setShowExtendedView(!oBindingInfo.parameters?.$$clearSelectionOnFilter);

		ListDelegate.updateBinding.apply(this, arguments);
	};

	return Delegate;
});
