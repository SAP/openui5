/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "./ListItemBaseRenderer"],
	function(coreLibrary, Renderer, ListItemBaseRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * InputListItem renderer.
	 * @namespace
	 */
	var InputListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	InputListItemRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRenderManager the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be
	 *          rendered
	 */
	InputListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMILI");
	};

	InputListItemRenderer.renderLIContent = function(rm, oLI) {

		// List item label
		var sLabel = oLI.getLabel();
		if (sLabel) {
			rm.openStart("span", oLI.getId() + "-label");
			rm.class("sapMILILabel");

			var sLabelDir = oLI.getLabelTextDirection();
			if (sLabelDir !== TextDirection.Inherit) {
				rm.attr("dir", sLabelDir.toLowerCase());
			}

			rm.openEnd();
			rm.text(sLabel);
			rm.close("span");
		}

		rm.openStart("div").class("sapMILIDiv").class("sapMILI-CTX").openEnd();
		oLI.getContent().forEach(rm.renderControl, rm);
		rm.close("div");
	};


	return InputListItemRenderer;

}, /* bExport= */ true);
