/*!
 * ${copyright}
 */

sap.ui.define([
	"../../ChartDelegate", 'sap/ui/mdc/odata/v4/TypeMap'
], (
	ChartDelegate,
	ODataV4TypeMap
) => {
	"use strict";
	/**
	 * Delegate class for {@link sap.ui.mdc.Chart Chart} and ODataV4.<br>
	 * This class provides method calls, which are called by the <code>Chart</code> at specific operations and allows to overwrite an internal behaviour.
	 *
	 * @namespace
	 * @author SAP SE
	 * @alias module:sap/ui/mdc/odata/v4/ChartDelegate
	 * @extends module:sap/ui/mdc/ChartDelegate
	 * @since 1.88
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 *
	 */
	const Delegate = Object.assign({}, ChartDelegate);

	Delegate.getTypeMap = function(oPayload) {
		return ODataV4TypeMap;
	};

	return Delegate;
});