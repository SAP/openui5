/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * GenericTile renderer.
	 * @namespace
	 */
	var GenericTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileRenderer.render = function(oRm, oControl) {
		// Write the HTML into the render manager.
		var sTooltipText = oControl._getTooltipText();
		var sAriaText = oControl._getAriaText();
		var sHeaderImage = oControl.getHeaderImage();

		oRm.write("<div");

		oRm.writeControlData(oControl);
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}
		oRm.addClass("sapMGT");
		oRm.addClass(oControl.getFrameType());

		if (oControl.hasListeners("press")) {
			oRm.writeAttribute("role", "button");
		} else {
			oRm.writeAttribute("role", "presentation");
		}
		oRm.writeAttributeEscaped("aria-label", sAriaText);

		if (oControl.hasListeners("press") && oControl.getState() != sap.m.LoadState.Disabled) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		}

		if (oControl.getBackgroundImage()) {
			oRm.write(" style='background-image:url(");
			oRm.writeEscaped(oControl.getBackgroundImage());
			oRm.write(");'");
			oRm.addClass("sapMGTBackgroundImage");
		}

		if (oControl.getMode() === sap.m.GenericTileMode.HeaderMode) {
			oRm.addClass("sapMGTHeaderMode");
		}

		oRm.writeClasses();
		oRm.write(">");
		var sState = oControl.getState();
		if (sState != sap.m.LoadState.Loaded) {
			oRm.write("<div");
			oRm.addClass("sapMGTOverlay");
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-overlay");
			if (sTooltipText) {
				oRm.writeAttributeEscaped("title", sTooltipText);
			}
			oRm.write(">");
			switch (sState) {
				case sap.m.LoadState.Disabled :
				case sap.m.LoadState.Loading :
					oControl._oBusy.setBusy(sState == sap.m.LoadState.Loading);
					oRm.renderControl(oControl._oBusy);
					break;
				case sap.m.LoadState.Failed :
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-ftr");
					oRm.addClass("sapMGenericTileFtrFld");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-icon");
					oRm.addClass("sapMGenericTileFtrFldIcn");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl._oWarningIcon);
					oRm.write("</div>");

					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-text");
					oRm.addClass("sapMGenericTileFtrFldTxt");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_failedMessageText"));
					oRm.write("</div>");

					oRm.write("</div>");
					break;
				default :
			}

			oRm.write("</div>");
		}

		oRm.write("<div");
		oRm.addClass("sapMGTHdrContent");
		oRm.addClass(oControl.getFrameType());
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}
		oRm.writeClasses();
		oRm.write(">");
		if (sHeaderImage) {
			oRm.renderControl(oControl._oImage);
		}

		this._renderHeader(oRm, oControl);
		if (oControl.getSubheader()) {
			this._renderSubheader(oRm, oControl);
		}

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMGTContent");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.write(">");
		var aTileContent = oControl.getTileContent();
		var iLength = aTileContent.length;
		for (var i = 0; i < iLength; i++) {
			if (oControl.getMode() === sap.m.GenericTileMode.HeaderMode) {
				aTileContent[i].removeAllAggregation("content", true);
			}
			oRm.renderControl(aTileContent[i]);
		}
		oRm.write("</div>");
		oRm.write("<div");
		oRm.addClass("sapMGTFocusDiv");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-focus");
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the header of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 */
	GenericTileRenderer._renderHeader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.renderControl(oControl._oTitle);
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the subheader of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose description should be rendered
	 */
	GenericTileRenderer._renderSubheader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());
		oRm.write("</div>");
	};

	return GenericTileRenderer;

}, /* bExport= */true);
