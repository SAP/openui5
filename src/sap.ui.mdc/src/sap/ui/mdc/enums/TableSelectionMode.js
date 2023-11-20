/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Defines the mode of the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableSelectionMode
     * @since 1.115
     * @public
     */
    const TableSelectionMode = {
        /**
         * No rows/items can be selected (default).
         * @public
         */
        None: "None",
        /**
         * Only one row/item can be selected at a time.
         * @public
         */
        Single: "Single",
        /**
         * Only one row/item can be selected at a time. Should be used for navigation scenarios to indicate the navigated row/item. If this selection
         * mode is used, no <code>rowPress</code> event is fired.
         * @public
         */
        SingleMaster: "SingleMaster",
        /**
         * Multiple rows/items can be selected at a time.
         * @public
         */
        Multi: "Multi"
    };

    DataType.registerEnum("sap.ui.mdc.enums.TableSelectionMode", TableSelectionMode);

    return TableSelectionMode;

}, /* bExport= */ true);