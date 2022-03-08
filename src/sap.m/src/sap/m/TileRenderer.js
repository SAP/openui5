/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Text
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * Text renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var TileRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Tile} oControl An object representation of the control that should be rendered
	 */
	TileRenderer.render = function(rm, oControl) {
		var oTileContainer,
			aVisibleTiles;

		rm.openStart("div", oControl);
		rm.attr("tabindex", "0");
		rm.class("sapMTile");
		rm.class("sapMPointer");
		if (oControl._invisible) {
			rm.style("visibility", "hidden");
		}
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}

		/* WAI ARIA if in TileContainer context */
		if (oControl.getParent() && oControl.getParent().isA("sap.m.TileContainer")) {
			oTileContainer = oControl.getParent();
			aVisibleTiles = oTileContainer._getVisibleTiles();

			rm.accessibilityState(oControl, {
				role: "option",
				posinset: oTileContainer._indexOfVisibleTile(oControl, aVisibleTiles) + 1,
				setsize: aVisibleTiles.length
			});
		}

		rm.openEnd();
		rm.openStart("div", oControl.getId() + "-remove");
		rm.class(oControl.getRemovable() ? "sapMTCRemove" : "sapMTCNoRemove");
		rm.openEnd().close("div");
		rm.openStart("div").class("sapMTileContent").openEnd();
		this._renderContent(rm, oControl);
		rm.close("div").close("div");
	};

	TileRenderer._renderContent = function(rm, oControl) {};

	return TileRenderer;

}, /* bExport= */ true);
