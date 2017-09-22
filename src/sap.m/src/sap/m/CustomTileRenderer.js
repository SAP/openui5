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

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *                rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *                oControl An object representation of the control that should be rendered
	 */
	 CustomTileRenderer.render = function(rm, oControl) {
		var oTileContainer,
			aVisibleTiles;

		rm.write("<div tabindex=\"0\"");
		rm.writeControlData(oControl);
		rm.addClass("sapMCustomTile");
		rm.writeClasses();
		if (oControl._invisible) {
			rm.addStyle("visibility", "hidden");
			rm.writeStyles();
		}

		/* WAI ARIA if in TileContainer context */
		if (oControl.getParent() instanceof sap.m.TileContainer) {
			oTileContainer = oControl.getParent();
			aVisibleTiles = oTileContainer._getVisibleTiles();

			rm.writeAccessibilityState(oControl, {
				role: "option",
				posinset: oTileContainer._indexOfVisibleTile(oControl, aVisibleTiles) + 1,
				setsize: aVisibleTiles.length
			});
		}

		rm.write(">");
		rm.write("<div id=\"" + oControl.getId() + "-remove\" class=\"sapMTCRemove\"></div>");
		rm.write("<div class=\"sapMCustomTileContent\">");
		this._renderContent(rm,oControl);
		rm.write("</div></div>");
	};

	CustomTileRenderer._renderContent = function (rm, oTile) {
		rm.renderControl(oTile.getContent());
	};

	return CustomTileRenderer;

}, /* bExport= */ true);
