/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";

		/**
		 * OnePersonHeader renderer.
		 * @namespace
		 */
		var OnePersonHeaderRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.OnePersonHeader} oHeader An object representation of the <code>OnePersonHeaderRenderer</code> control that should be rendered.
		 */
		OnePersonHeaderRenderer.render = function(oRm, oHeader){
			oRm.write("<div");
			oRm.writeControlData(oHeader);
			oRm.addClass("sapMOnePerHead");
			oRm.writeClasses();
			oRm.write(">");

			var oActionsToolbar = oHeader.getAggregation("actionsToolbar");
			if (oActionsToolbar) {
				oRm.renderControl(oActionsToolbar);
			}

			var oNavigationToolbar = oHeader.getAggregation("navigationToolbar");
			if (oNavigationToolbar) {
				oRm.renderControl(oNavigationToolbar);
			}

			oRm.write("</div>");
		};

		return OnePersonHeaderRenderer;

	}, /* bExport= */ true);