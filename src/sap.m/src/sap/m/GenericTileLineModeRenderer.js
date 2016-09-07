/*!
 * ${copyright}
 */

sap.ui.define([ "sap/m/GenericTileRenderer", "sap/m/LoadState" ],
	function(TileRenderer, LoadState) {
	"use strict";

	/**
	 * GenericTileLineMode renderer.
	 * @namespace
	 */
	var GenericTileLineModeRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileLineModeRenderer.render = function(oRm, oControl) {
		var sTooltipText = oControl._getTooltipText();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMGT");
		oRm.addClass("sapMGTLineMode");

		if (oControl.getState() !== LoadState.Disabled) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		} else {
			oRm.addClass("sapMGTDisabled");
		}

		oRm.writeClasses();
		oRm.write(">");

		if (oControl.getState() !== LoadState.Loaded) {
			TileRenderer._renderStateOverlay(oRm, oControl, sTooltipText);
		} else {
			TileRenderer._renderHoverOverlay(oRm, oControl);
		}
		TileRenderer._renderFocusDiv(oRm, oControl);

		oRm.write("<div");
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl._oTitle.getText());
		oRm.write("</div>"); //.sapMGTHdrTxt

		oRm.write("<div");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());
		oRm.write("</div>"); //.sapMGTSubHdrTxt

		oRm.write("</div>"); //.sapMGT
	};

	return GenericTileLineModeRenderer;

}, /* bExport= */true);
