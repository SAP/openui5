/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the row count mode of the GridTable.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableRowCountMode
     * @since 1.115
     * @public
     */
    const TableRowCountMode = {
        /**
         * The table automatically fills the height of the surrounding container.
         *
         * @public
         */
        Auto: "Auto",
        /**
         * The table always has as many rows as defined in the <code>rowCount</code> property of <code>GridTableType</code>.
         *
         * @public
         */
        Fixed: "Fixed"
    };

    return TableRowCountMode;

}, /* bExport= */ true);