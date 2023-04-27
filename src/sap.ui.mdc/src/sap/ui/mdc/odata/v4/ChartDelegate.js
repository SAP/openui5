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
     * Delegate class for sap.ui.mdc.Chart and ODataV4.
     * Enables additional analytical capabilities.
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized.
     *
     * @author SAP SE
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.88
     * @alias sap.ui.mdc.odata.v4.ChartDelegate
     */
    var Delegate = Object.assign({}, ChartDelegate);

    Delegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

    return Delegate;
});