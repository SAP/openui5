/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "./ListItemBaseRenderer"],
	function(coreLibrary, Renderer, ListItemBaseRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * DisplayListItem renderer.
	 * @namespace
	 */
	var DisplayListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	DisplayListItemRenderer.apiVersion = 2;

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
	DisplayListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMDLI");
	};

	DisplayListItemRenderer.renderLIContent = function(rm, oLI) {

		// List item label
		var sLabel = oLI.getLabel();
		if (sLabel) {
			rm.openStart("label");
			rm.attr("for", oLI.getId() + "-value");
			rm.class("sapMDLILabel");
			rm.openEnd();
			rm.text(sLabel);
			rm.close("label");
		}

		// List item value
		var sValue = oLI.getValue();
		if (sValue) {
			rm.openStart("div", oLI.getId() + "-value");
			rm.class("sapMDLIValue");

			var sValueTextDir = oLI.getValueTextDirection();
			if (sValueTextDir != TextDirection.Inherit) {
				rm.attr("dir", sValueTextDir.toLowerCase());
			}

			rm.openEnd();
			rm.text(sValue);
			rm.close("div");
		}
	};


	return DisplayListItemRenderer;

}, /* bExport= */ true);
