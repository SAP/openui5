/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', './library'],
	function(jQuery, library) {
	"use strict";

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = library.GenericTileScope;

	/**
	 * SlideTile renderer.
	 * @namespace
	 */
	var SlideTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	SlideTileRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString(),
			sScope = oControl.getScope(),
			sScopeClass = jQuery.sap.encodeCSS("sapMSTScope" + sScope),
			iLength;

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMST");
		oRm.addClass(sScopeClass);
		if (!this._bAnimationPause) {
			oRm.addClass("sapMSTPauseIcon");
		}
		oRm.writeClasses();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("tabindex", "0");
		oRm.writeAttribute("role", "presentation");
		oRm.write(">");
		iLength = oControl.getTiles().length;
		if (iLength > 1 && sScope === GenericTileScope.Display) {
			this._renderPausePlayIcon(oRm, oControl);
			this._renderTilesIndicator(oRm, oControl);
		}
		this._renderTiles(oRm, oControl, iLength);
		if (sScope === GenericTileScope.Actions) {
			this._renderActionsScope(oRm, oControl);
		}
		oRm.write("<div");
		oRm.addClass("sapMSTFocusDiv");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-focus");
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");
	};

	SlideTileRenderer._renderTiles = function(oRm, oControl, iLength) {
		oRm.write("<div");
		oRm.addClass("sapMSTOverflowHidden");
		oRm.writeClasses();
		oRm.write(">");
		for (var i = 0; i < iLength; i++) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-wrapper-" + i);
			oRm.addClass("sapMSTWrapper");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getTiles()[i]);
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	SlideTileRenderer._renderTilesIndicator = function(oRm, oControl) {
		var iPageCount = oControl.getTiles().length;

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-tilesIndicator");
		oRm.addClass("sapMSTBulleted");
		oRm.writeClasses();
		oRm.write(">");
		for ( var i = 0; i < iPageCount; i++) {
			oRm.write("<span");
			oRm.writeAttribute("id", oControl.getId() + "-tileIndicator-" + i);
			oRm.write(">");
			oRm.write("</span>");
		}
		oRm.write("</div>");
	};

	SlideTileRenderer._renderPausePlayIcon = function(oRm, oControl) {
		if (oControl.getTiles().length > 1) {
			oRm.write("<div");
			oRm.addClass("sapMSTIconClickTapArea");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
			oRm.write("<div");
			oRm.addClass("sapMSTIconDisplayArea");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
			oRm.write("<div");
			oRm.addClass("sapMSTIconNestedArea");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_pausePlayIcon"));
			oRm.write("</div>");
		}
	};

	SlideTileRenderer._renderActionsScope = function(oRm, oControl) {
		oRm.renderControl(oControl._oRemoveButton);
		oRm.renderControl(oControl._oMoreIcon);
	};

	return SlideTileRenderer;

}, /* bExport= */ true);
