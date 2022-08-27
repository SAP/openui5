/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
    function(library) {
        "use strict";

        /**
         * Chart renderer.
         * @namespace
         */
        var ChartRenderer = {
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
         * @param {sap.ui.mdc.Chart} oMDCChart An object representation of the control that should be rendered
         */
        ChartRenderer.render = function(oRm, oMDCChart) {
                oRm.openStart("div", oMDCChart);
                //TODO: Clarify why providing the control in openStart doesn't work on rerender
                oRm.attr("id", oMDCChart.getId());
                oRm.class(ChartRenderer.CSS_CLASS);
                //oRm.class("sapUiFixFlex");
                //oRm.style("overflow", "hidden");
                oRm.style("height", oMDCChart.getHeight());
                oRm.style("width", oMDCChart.getWidth());
                oRm.style("min-height", oMDCChart.getMinHeight());
                oRm.style("min-width", oMDCChart.getMinWidth());
                oRm.openEnd();
                this.renderToolbar(oRm, oMDCChart.getAggregation("_toolbar"));
                this.renderBreadcrumbs(oRm, oMDCChart.getAggregation("_breadcrumbs"));
                //this.renderInnerChart(oRm, oMDCChart._getInnerChart());
                this.renderInnerStructure(oRm, oMDCChart.getAggregation("_innerChart"));
                oRm.close("div");
        };

        ChartRenderer.renderNoDataStruct = function(oRm, oNoDataStruct) {
            if (oNoDataStruct) {
               /*oRm.openStart("div");
                oRm.class("sapUiFixFlexFlexibleContainer");
                oRm.openEnd();
                oRm.renderControl(oNoDataStruct);
                oRm.close("div");*/
            }
        };

        ChartRenderer.renderToolbar = function(oRm, oToolbar) {

            if (oToolbar) {
                oRm.openStart("div");
                //oRm.class("sapUiFixFlexFixed");
                oRm.openEnd();
                oRm.renderControl(oToolbar);
                oRm.close("div");
            }
        };

        ChartRenderer.renderBreadcrumbs = function(oRm, oDrillBreadcrumbs) {

            if (oDrillBreadcrumbs) {
                oRm.renderControl(oDrillBreadcrumbs);
            }
        };

        ChartRenderer.renderInnerChart = function(oRm, oInnerChart) {

            if (oInnerChart) {
                oRm.renderControl(oInnerChart);
            }
        };
        ChartRenderer.renderInnerStructure = function (oRm, oInnerStructure){
            oRm.renderControl(oInnerStructure);
        };

        return ChartRenderer;
    }, true);
