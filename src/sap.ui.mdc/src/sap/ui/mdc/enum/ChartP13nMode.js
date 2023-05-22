/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the personalization mode of the chart.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enum.ChartP13nMode
     * @since 1.115
     * @private
     * @ui5-restricted sap.ui.mdc
     * @MDC_PUBLIC_CANDIDATE
     */
    var ChartP13nMode = {
        /**
         * Item personalization is enabled.
         *
         * @public
         */
        Item: "Item",
        /**
         * Sort personalization is enabled.
         *
         * @public
         */
        Sort: "Sort",
        /**
         * Chart type personalization is enabled.
         *
         * @public
         */
        Type: "Type",
        /**
         * Filter personalization is enabled.
         *
         * @public
         */
        Filter: "Filter"
    };

    return ChartP13nMode;

}, /* bExport= */ true);