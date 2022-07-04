/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/core/Control",
    "./ChartImplementationContainerRenderer"
],
function (Control, Renderer
) {
    "use strict";

    /**
     * Constructor for a new Chart.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control
     * @class The Chart control creates a chart based on metadata and the configuration specified.
     * @extends sap.ui.core.Control
     * @author SAP SE
     * @version ${version}
     * @constructor
     * @experimental As of version 1.104
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.104
     * @alias sap.ui.mdc.chart.ChartImplementationContainer
     */
    var Chart = Control.extend("sap.ui.mdc.chart.ChartImplementationContainer", /** @lends sap.ui.mdc.chart.ChartImplementationContainer.prototype */ {
        metadata: {
            library: "sap.ui.mdc",
            interfaces: [
            ],
            properties: {
            },
            aggregations: {
                /**
                 * This property describes the measures and dimensions visible in the chart.
                 * Changes in the personalization are also reflected here.
                 */
                content: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            associations: {
            },
            events: {
            }
        },

        renderer: Renderer
    });

    /**
     * Initialises the MDC Chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    Chart.prototype.init = function () {
        //TODO;
    };

    return Chart;
});