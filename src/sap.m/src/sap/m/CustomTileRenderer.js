/*!
 * ${copyright}
 */
sap.ui.define(['./TileRenderer', 'sap/ui/core/Renderer'],
	function(TileRenderer, Renderer) {
	"use strict";

/**
	 * CustomTile renderer.
	 * @namespace
	 */
	var CustomTileRenderer = Renderer.extend(TileRenderer);

	CustomTileRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *                rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.CustomTile}
	 *                oControl An object representation of the control that should be rendered
	 */
	 CustomTileRenderer.render = function(rm, oControl) {
		var oTileContainer,
			aVisibleTiles;

		rm.openStart("div", oControl).attr("tabindex", "0");
		rm.class("sapMCustomTile");
		if (oControl._invisible) {
			rm.style("visibility", "hidden");
		}

		/* WAI ARIA if in TileContainer context */
		if (oControl.getParent() && oControl.getParent().isA("sap.m.TileContainer")) {
			// @ui5-non-local-rendering
			oTileContainer = oControl.getParent();
			aVisibleTiles = oTileContainer._getVisibleTiles();

			rm.accessibilityState(oControl, {
				role: "option",
				posinset: oTileContainer._indexOfVisibleTile(oControl, aVisibleTiles) + 1,
				setsize: aVisibleTiles.length
			});
		}

		rm.openEnd();
		rm.openStart("div", oControl.getId() + "-remove").class("sapMTCRemove").openEnd().close("div");
		rm.openStart("div").class("sapMCustomTileContent").openEnd();
		this._renderContent(rm, oControl);
		rm.close("div").close("div");
	};

	CustomTileRenderer._renderContent = function (rm, oTile) {
		rm.renderControl(oTile.getContent());
	};

	return CustomTileRenderer;

}, /* bExport= */ true);
