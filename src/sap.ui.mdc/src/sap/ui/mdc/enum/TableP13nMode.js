/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the personalization mode of the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enum.TableP13nMode
     * @since 1.115
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     */
    var TableP13nMode = {
        /**
         * Column personalization is enabled.
         *
         * @public
         */
        Column: "Column",
        /**
         * Sort personalization is enabled.
         *
         * @public
         */
        Sort: "Sort",
        /**
         * Filter personalization is enabled.
         *
         * @public
         */
        Filter: "Filter",
        /**
         * Group personalization is enabled.
         *
         * @public
         */
        Group: "Group",
        /**
         * Aggregation personalization is enabled.
         *
         * @public
         */
        Aggregate: "Aggregate"
    };

    return TableP13nMode;

}, /* bExport= */ true);