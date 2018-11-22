/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";

		/**
		 * PlanningCalendarHeader renderer.
		 * @namespace
		 */
		var PlanningCalendarHeaderRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.PlanningCalendarHeader} oHeader An object representation of the <code>PlanningCalendarHeaderRenderer</code> control that should be rendered.
		 */
		PlanningCalendarHeaderRenderer.render = function(oRm, oHeader){
			var oActionsToolbar = oHeader.getAggregation("_actionsToolbar"),
				oNavigationToolbar = oHeader.getAggregation("_navigationToolbar");

			oRm.write("<div");
			oRm.writeControlData(oHeader);
			oRm.addClass("sapMPCHead");
			oRm.writeClasses();
			oRm.write(">");

			if (oActionsToolbar) {
				oRm.renderControl(oActionsToolbar);
			}

			if (oNavigationToolbar) {
				oRm.renderControl(oNavigationToolbar);
			}

			oRm.write("</div>");
		};

		return PlanningCalendarHeaderRenderer;

	}, /* bExport= */ true);