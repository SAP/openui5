/*!
 * ${copyright}
 */

sap.ui.define([],
    function() {
        "use strict";

        /**
         * Chart renderer.
         * @namespace
         */
        const ChartRenderer = {
            apiVersion: 2
        };

        /**
         * CSS class to be applied to the HTML root element of the control.
         *
         * @readonly
         * @const {string}
         */
        ChartRenderer.CSS_CLASS = "sapUiMDCChart";

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
         * @param {sap.ui.mdc.chart.ChartImplementationContainer} oChartImplContainer An object representation of the control that should be rendered
         */
        ChartRenderer.render = function(oRm, oChartImplContainer) {
                oRm.openStart("div", oChartImplContainer);
                //oRm.class(ChartRenderer.CSS_CLASS);
                //oRm.class("sapUiFixFlex");
                //oRm.style("overflow", "hidden");
                oRm.style("height", "100%");
                oRm.style("width", "100%");
                oRm.style("min-height", "200px");
                oRm.openEnd();
                oRm.renderControl(oChartImplContainer.getContent());
                oRm.renderControl(oChartImplContainer.getNoDataContent());
                oRm.renderControl(oChartImplContainer._getChartNoDataForRenderer());
                oRm.close("div");
        };

        return ChartRenderer;
    }, true);
