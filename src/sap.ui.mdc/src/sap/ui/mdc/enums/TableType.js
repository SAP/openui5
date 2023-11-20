/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Defines the type of table used in the MDC table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableType
     * @since 1.115
     * @public
     */
    const TableType = {
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

    DataType.registerEnum("sap.ui.mdc.enums.TableType", TableType);

    return TableType;

}, /* bExport= */ true);