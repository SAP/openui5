/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the type of table used in the MDC table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enum.TableType
     * @since 1.115
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     */
    var TableType = {
        /**
         * Grid table ({@link sap.ui.table.Table} control) is used (default)
         *
         * @public
         */
        Table: "Table",
        /**
         * Tree table ({@link sap.ui.table.TreeTable} control) is used.
         *
         * @private
         * @experimental
         */
        TreeTable: "TreeTable",
        /**
         * Responsive table ({@link sap.m.Table} control) is used.
         *
         * @public
         */
        ResponsiveTable: "ResponsiveTable"
    };

    return TableType;

}, /* bExport= */ true);