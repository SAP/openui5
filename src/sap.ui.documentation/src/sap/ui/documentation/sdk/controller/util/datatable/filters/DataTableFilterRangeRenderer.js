/*!
 * ${copyright}
 */

sap.ui.define([],
    function () {
        "use strict";

		/**
		 * <code>DataTableFilterDropDown</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
        var DataTableFilterRangeRenderer = {
            apiVersion: 2
        };

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
        DataTableFilterRangeRenderer.render = function (oRm, oControl) {
            var oFrom = oControl.getAggregation("from"),
                oTo = oControl.getAggregation("to");

            oRm.openStart("div", oControl);
            oRm.openEnd();
            if (oFrom) {
                oRm.renderControl(oFrom);
            }
            if (oTo) {
                oRm.renderControl(oTo);
            }
            oRm.close("div");
        };

        return DataTableFilterRangeRenderer;
    }, /* bExport= */ true);
