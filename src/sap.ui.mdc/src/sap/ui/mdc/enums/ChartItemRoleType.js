/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
    "use strict";

    /**
     * @enum {string}
     * @private
     * @since 1.115
     * @alias sap.ui.mdc.enums.ChartItemRoleType
     */
    const ChartItemRoleType = {
        /**
         * All dimensions with role "category" are assigned to the feed uid "categoryAxis".
         *
         * <b>NOTE:</b> If the chart type requires at least one dimension on the feed "categoryAxis" (true for all chart types except pie and donut), but no dimension has the role "category" or "category2", then the first visible dimension is assigned to the "categoryAxis".
         *
         * @public
         */
        category: "category",
        /**
         * All dimensions with role "series" are assigned to the feed uid "color".
         * @public
         */
        series: "series",
        /**
         * If a chart type does not use the feed uid "categoryAxis2", then all dimensions with role "category2" are treated as dimension with role "category" (appended).
         * @public
         */
        category2: "category2",
        /**
         * General Rules for all chart types
         * <ol>
         *   <li>All measures with role "axis1" are assigned to feed uid "valueaxis". All measures with role "axis2" are assigned to feed uid "valueaxis2". All measures with role "axis3" are assigned to feed uid "bubbleWidth".</li>
         *   <li>If a chart type does not use the feed uid "valueaxis2", then all measures with role "axis2" are treated as measures with role "axis1".</li>
         *   <li>If a chart type requires at least 1 measure on the feed uid "valueaxis" (true for all non-"dual" chart types), but there is no measure with role "axis1", then the first measure with role "axis2" is assigned to feed uid "valueaxis"</li>
         *   <li>If the chart type requires at least one measure on the feed uid "valueaxis2" (true for all "dual" chart types"), but there is no measure with role "axis2", then the first measure with role "axis3" or "axis4" or (if not exists) the last measure with role "axis1" is assigned to feed uid "valueaxis2".</li>
         * </ol>
         * @public
         */
        axis1: "axis1",
        /**
         * Measures with role "axis2" are assigned to feed uid "valueaxis2" if used.
         * If a chart type does not use the feed uid "bubbleWidth" (true for all chart types except bubble and radar), then all measures with role "axis3" or "axis4" are treated as measures with role "axis2".
         * @public
         */
        axis2: "axis2",
        /**
         * Measures with role "axis3" are assigned to feed uid "bubbleWidth" if used.
         * @public
         */
        axis3: "axis3"
    };

    DataType.registerEnum("sap.ui.mdc.enums.ChartItemRoleType", ChartItemRoleType);

    return ChartItemRoleType;

}, /* bExport= */ true);