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
		oRm.write("<span");
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

		//rendering helper
		oRm.write("<div");
		oRm.addClass("sapMGTSizeHelper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<span");
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl._oTitle.getText());
		oRm.write("</span>"); //.sapMGTHdrTxt

		oRm.write("<span");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());
		oRm.write("</span>"); //.sapMGTSubHdrTxt

		//hover and press style helper
		oRm.write("<svg");
		oRm.addClass("sapMGTStyleHelper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</svg>");

		oRm.write("</span>"); //.sapMGT
	};

	return GenericTileLineModeRenderer;

}, /* bExport= */true);
