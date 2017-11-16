/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * Bar renderer.
	 * @namespace
	 */
	var TileContainerRenderer = {
	};

	/*The default amount of tiles this renderer will render if the max tiles per page is not calculated yet.*/
	TileContainerRenderer.DEFAULT_TILES_TO_RENDER = 1;


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TileContainerRenderer.render = function(rm, oControl) {
		var id =  oControl.getId();

		rm.write("<div tabindex=\"-1\"");
		rm.writeControlData(oControl);
		rm.addStyle("height",oControl.getHeight());
		rm.addStyle("width",oControl.getWidth());
		rm.writeStyles();
		rm.addClass("sapMTC");
		rm.writeClasses();

		/* WAI ARIA region */
		rm.writeAccessibilityState(oControl, {
			role: "listbox",
			multiSelectable: false,
			activeDescendant: oControl.getTiles().length > 0 ? oControl.getTiles()[0].getId() : ""
		});

		rm.write(" >");
		rm.write("<div id=\"" + id + "-scrl\" class=\"sapMTCScrl\" style=\"height:0px;");
		if (!oControl.bRtl) {
			rm.write(" overflow: hidden;");
		}
		rm.write("\">");
		rm.write("<div id=\"" + id + "-blind\" class=\"sapMTCBlind\"></div>");
		rm.write("<div id=\"" + id + "-cnt\" class=\"sapMTCCnt sapMTCAnim\" style=\"height:0px; width:0px;\" role=\"group\">");

		this.renderTiles(oControl, rm);

		rm.write("</div>");
		rm.write("</div>");
		rm.write("<div id=\"" + id + "-pager\" class=\"sapMTCPager\">");
		rm.write("</div>");
		rm.write("<div id=\"" + id + "-leftedge\" class=\"sapMTCEdgeLeft\"></div>");
		rm.write("<div id=\"" + id + "-rightedge\" class=\"sapMTCEdgeRight\"></div>");
		rm.write("<div id=\"" + id + "-leftscroller\" class=\"sapMTCScroller sapMTCLeft\" tabindex=\"-1\"><div class=\"sapMTCInner\" ></div></div>");
		rm.write("<div id=\"" + id + "-rightscroller\" class=\"sapMTCScroller sapMTCRight\" tabindex=\"-1\"><div class=\"sapMTCInner\" ></div></div>");
		rm.write("</div>");
	};

	/**
	 * Render tiles depending on the page size and tiles count.
	 * @param {sap.m.TileContainer} oTC the tile container
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @private
	 * @returns {void}
	 */
	TileContainerRenderer.renderTiles = function(oTC, oRm){
		var aTiles = oTC.getTiles(),
			i = 0,
			iRenderedTiles = 0,
			iMaxTilesToRender;

		if (!aTiles.length) {
			return;
		}

		iMaxTilesToRender = this._getCountOfTilesToRender(oTC, aTiles);
		if (iMaxTilesToRender === TileContainerRenderer.DEFAULT_TILES_TO_RENDER) {
			// We cannot determine how many tiles to render on the 1st page, because we don't have a DOM yet.
			// That's why we render just one (to use it for reference tile's size detection,
			// @see TileDimensionCalculator.prototype.calc) and force the TileContainer.onAfterRendering
			// to render all tiles in the 1st page.
			oTC._bRenderFirstPage = true;
		}

		//render total of iMaxTilesToRender visible tiles
		do {
			if (aTiles[i] && aTiles[i].getVisible()) {
				aTiles[i]._setVisible(false);
				oRm.renderControl(aTiles[i]);
				iRenderedTiles++;
			}
			i++;
		} while (iRenderedTiles !== iMaxTilesToRender && (i < aTiles.length));
	};

	/**
	 * Determines the amount fo tiles to be rendered.
	 * This depends on information about tiles per page (if available) and/or the count of visible tiles.
	 * @param {sap.m.TileContainer} oTC the tile container
	 * @param {Array.<sap.m.Tile>} aTiles list of visible tiles in order to avoid filtering them again.
	 * @returns {*}
	 * @private
	 */
	TileContainerRenderer._getCountOfTilesToRender = function(oTC, aTiles) {
		if (oTC._iMaxTiles) {
			return oTC._iMaxTiles;
		}
		if (aTiles.length > TileContainerRenderer.DEFAULT_TILES_TO_RENDER) {
			return TileContainerRenderer.DEFAULT_TILES_TO_RENDER;
		}
		return aTiles.length;
	};

	return TileContainerRenderer;

}, /* bExport= */ true);
