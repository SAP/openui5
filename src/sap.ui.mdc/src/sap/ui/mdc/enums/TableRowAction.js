/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Defines the actions that can be used in the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableRowAction
     * @since 1.115
     * @public
     */
    const TableRowAction = {
        /**
         * Navigation arrow (chevron) is shown in the table rows/items.
         *
         * @public
         */
        Navigation: "Navigation"
    };

    DataType.registerEnum("sap.ui.mdc.enums.TableRowAction", TableRowAction);

    return TableRowAction;

}, /* bExport= */ true);