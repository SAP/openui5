/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Enumeration of the <code>multiSelectMode</code> in <code>ListBase</code>.
     * @enum {string}
     * @private
     * @alias sap.ui.mdc.enums.TableMultiSelectMode
     * @since 1.115
     * @ui5-restricted sap.ui.mdc
     */
    const TableMultiSelectMode = {
        /**
         * Renders the <code>selectAll</code> checkbox (default behavior).
         * @public
         */
        Default: "Default",

        /**
         * Renders the <code>clearAll</code> icon.
         * @public
         */
        ClearAll: "ClearAll"
    };

    DataType.registerEnum("sap.ui.mdc.enums.TableMultiSelectMode", TableMultiSelectMode);

    return TableMultiSelectMode;

}, /* bExport= */ true);