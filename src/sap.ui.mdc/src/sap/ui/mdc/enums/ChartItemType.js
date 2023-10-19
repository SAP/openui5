/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
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

    DataType.registerEnum("sap.ui.mdc.enums.ChartItemType", ChartItemType);

    return ChartItemType;

}, /* bExport= */ true);