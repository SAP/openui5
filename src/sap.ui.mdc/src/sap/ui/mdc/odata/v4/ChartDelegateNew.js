/*
 * ! ${copyright}
 */

sap.ui.define([
    "../../ChartDelegateNew",
    "../../util/loadModules",
    "../../library",
    "sap/ui/core/Core"
], function(
    ChartDelegate,
    loadModules,
    library,
    Core
) {
    "use strict";
    /**
     * Delegate class for sap.ui.mdc.ChartNew and ODataV4.
     * Enables additional analytical capabilities.
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized.
     *
     * @author SAP SE
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.88
     * @alias sap.ui.mdc.odata.v4.ChartDelegateNew
     */
    var Delegate = Object.assign({}, ChartDelegate);

    /**
     * Initializes a new table property helper for V4 analytics with the property extensions merged into the property infos.
     *
     * @param {sap.ui.mdc.ChartNew} oMDCChart Instance of the MDC chart.
     * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper. //TODO: Clarify what we really need here for MDC Chart
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    Delegate.initPropertyHelper = function(oMDCChart) {
        // TODO: Do this in the DelegateMixin, or provide a function in the base delegate to merge properties and extensions

            //return new PropertyHelper(aPropertiesWithExtension, oMDCChart);
    };

    /**
     * Fetches the property extensions.
     * TODO: document structure of the extension
     *
     * @param {sap.ui.mdc.ChartNew} oMDCChart Instance of the MDC chart.
     * @param {object[]} aProperties The property infos
     * @returns {Promise<object<string, object>>} Key-value map, where the key is the name of the property, and the value is the extension
     * @protected
     */
    Delegate.fetchPropertyExtensions = function(oMDCChart, aProperties) {
        return Promise.resolve();
    };


    Delegate._getVisibleProperties = function(oInnerChart /*TODO:Clarify*/) {
        var aVisibleProperties = [];

        return aVisibleProperties;
    };

    /**
     * Define a common set of V4 specific functions which also work for other third-party non-viz chart libraries
     *
     * ...
     */

    return Delegate;
});