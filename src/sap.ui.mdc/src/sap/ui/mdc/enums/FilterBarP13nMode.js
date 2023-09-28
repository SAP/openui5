/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     *
     * Defines the personalization mode of the filter bar.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.FilterBarP13nMode
     * @since 1.115
     * @public
     */
    const FilterBarP13nMode = {
        /**
         * Filter item personalization is enabled.
         *
         * @public
         */
        Item: "Item",
        /**
         * Condition personalization is enabled.
         *
         * @public
         */
        Value: "Value"
    };

    DataType.registerEnum("sap.ui.mdc.enums.FilterBarP13nMode", FilterBarP13nMode);

    return FilterBarP13nMode;

}, /* bExport= */ true);