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
         * @param {sap.ui.mdc.Chart} oChart An object representation of the control that should be rendered
         */
        ChartRenderer.render = function(oRm, oChart) {
                oRm.openStart("div", oChart);
                oRm.class(ChartRenderer.CSS_CLASS);
                //oRm.class("sapUiFixFlex");
                //oRm.style("overflow", "hidden");
                oRm.style("height", oChart.getHeight());
                oRm.style("width", oChart.getWidth());
                oRm.style("min-height", oChart.getMinHeight());
                oRm.style("min-width", oChart.getMinWidth());
                oRm.openEnd();
                    oRm.openStart("div");
                    oRm.openEnd();
                    this.renderToolbar(oRm, oChart.getAggregation("_toolbar"));
                    this.renderInfoToolbar(oRm, oChart.getAggregation("_infoToolbar"));
                    oRm.close("div");
                this.renderBreadcrumbs(oRm, oChart.getAggregation("_breadcrumbs"));
                this.renderInnerStructure(oRm, oChart.getAggregation("_innerChart"));
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

        ChartRenderer.renderInfoToolbar = function(oRm, oInfoToolbar) {
            if (oInfoToolbar) {
                oRm.renderControl(oInfoToolbar);
            }
        };

        ChartRenderer.renderInnerStructure = function (oRm, oInnerStructure){
            oRm.renderControl(oInnerStructure);
        };

        return ChartRenderer;
    }, true);
