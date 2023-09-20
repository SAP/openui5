/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     * @enum {string}
     * @private
     * @since 1.115
     * @alias sap.ui.mdc.enums.ChartItemType
     */
    const ChartItemType = {
        /**
         * Dimension Item
         * @public
         */
        Dimension: "Dimension",
        /**
         * Measure Item
         * @public
         */
        Measure: "Measure"
    };

    return ChartItemType;

}, /* bExport= */ true);