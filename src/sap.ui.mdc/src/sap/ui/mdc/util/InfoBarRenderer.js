/*!
 * ${copyright}
 */

sap.ui.define(['../library'],
    function(library) {
        "use strict";

        /**
         * Chart renderer.
         * @namespace
         */
        const InfoBarRenderer = {
            apiVersion: 2
        };

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} oRm The RenderManager that is used for writing into the render output buffer
         * @param {sap.ui.mdc.util.InfoBar} oMDCInfoBar An object representation of the control that is rendered
         */
         InfoBarRenderer.render = function(oRm, oMDCInfoBar) {
                oRm.openStart("div", oMDCInfoBar);
                oRm.attr("id", oMDCInfoBar.getId());
                oRm.openEnd();
                oRm.renderControl(oMDCInfoBar.getAggregation("_toolbar"));
                oRm.close("div");
        };


        return InfoBarRenderer;
    }, true);
