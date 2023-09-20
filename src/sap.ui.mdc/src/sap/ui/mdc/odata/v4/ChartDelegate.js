/*!
 * ${copyright}
 */

sap.ui.define([
    "../../ChartDelegate",
	'sap/ui/mdc/odata/v4/TypeMap'
], function (
    ChartDelegate,
    ODataV4TypeMap
) {
    "use strict";
    /**
	 * @class Delegate class for {@link sap.ui.mdc.Chart Chart} and ODataV4.<br>
	 * This class provides method calls, which are called by the <code>Chart</code> at specific operations and allows to overwrite an internal behaviour.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/ChartDelegate
	 * @extends module:sap/ui/mdc/ChartDelegate
	 * @since 1.88
     *
	 * @public
     *
     */
    const Delegate = Object.assign({}, ChartDelegate);

    Delegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

    return Delegate;
});