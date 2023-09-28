/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Defines the personalization mode of the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableP13nMode
     * @since 1.115
     * @public
     */
    const TableP13nMode = {
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

    DataType.registerEnum("sap.ui.mdc.enums.TableP13nMode", TableP13nMode);

    return TableP13nMode;

}, /* bExport= */ true);