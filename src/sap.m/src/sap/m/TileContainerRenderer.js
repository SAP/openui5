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
		apiVersion: 2
	};

	/*The default amount of tiles this renderer will render if the max tiles per page is not calculated yet.*/
	TileContainerRenderer.DEFAULT_TILES_TO_RENDER = 1;


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.TileContainer} oControl an object representation of the control that should be rendered
	 */
	TileContainerRenderer.render = function(rm, oControl) {
		var id =  oControl.getId();

		rm.openStart("div", oControl)
			.attr("tabindex", "-1")
			.style("height", oControl.getHeight())
			.style("width", oControl.getWidth())
			.class("sapMTC");

		/* WAI ARIA region */
		rm.accessibilityState(oControl, {
			role: "listbox",
			multiSelectable: false,
			activeDescendant: oControl.getTiles().length > 0 ? oControl.getTiles()[0].getId() : ""
		});

		rm.openEnd();
			rm.openStart("div", id + "-scrl").class("sapMTCScrl").style("height", "0");
			if (!oControl.bRtl) {
				rm.style("overflow", "hidden");
			}
			rm.openEnd();
				rm.openStart("div", id + "-blind").class("sapMTCBlind").openEnd().close("div");
				rm.openStart("div", id + "-cnt")
					.class("sapMTCCnt")
					.class("sapMTCAnim")
					.style("height","0")
					.style("width", "0")
					.attr("role", "group")
					.openEnd();

				this.renderTiles(oControl, rm);

				rm.close("div");
			rm.close("div");
			rm.openStart("div", id + "-pager").class("sapMTCPager").openEnd().close("div");
			rm.openStart("div", id + "-leftedge").class("sapMTCEdgeLeft").openEnd().close("div");
			rm.openStart("div", id + "-rightedge").class("sapMTCEdgeRight").openEnd().close("div");
			rm.openStart("div", id + "-leftscroller").class("sapMTCScroller").class("sapMTCLeft").attr("tabindex", "-1").openEnd();
				rm.openStart("div").class("sapMTCInner").openEnd().close("div");
			rm.close("div");
			rm.openStart("div", id + "-rightscroller").class("sapMTCScroller").class("sapMTCRight").attr("tabindex", "-1").openEnd();
				rm.openStart("div").class("sapMTCInner").openEnd().close("div");
			rm.close("div");
		rm.close("div");
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
