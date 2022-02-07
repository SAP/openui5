/*!
 * ${copyright}
 */

sap.ui.define(['./TileRenderer', 'sap/ui/core/ValueStateSupport', 'sap/ui/core/Renderer', 'sap/m/library', 'sap/ui/core/library'],
	function(TileRenderer, ValueStateSupport, Renderer, library, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.StandardTileType
	var StandardTileType = library.StandardTileType;

	/**
	 * CustomTile renderer.
	 * @namespace
	 */
	var StandardTileRenderer = Renderer.extend(TileRenderer);

	StandardTileRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.StandardTile} oTile An object representation of the control that should be rendered
	 */
	StandardTileRenderer._renderContent = function(rm, oTile) {
		var infoState = oTile.getInfoState();

		rm.openStart("div"); // Start top row
		rm.class("sapMStdTileTopRow");
		rm.openEnd();
		if (oTile.getIcon()) {
			rm.openStart("div");
			rm.class("sapMStdTileIconDiv");

			switch (oTile.getType()) {
				case StandardTileType.Monitor:
					rm.class("sapMStdIconMonitor");
					break;
				case StandardTileType.Create:
					rm.class("sapMStdIconCreate");
					break;
			}
			rm.openEnd();
			rm.renderControl(oTile._getImage());
			rm.close("div");
		}


		if (oTile.getNumber()) {

			rm.openStart("div");
			rm.class("sapMStdTileNumDiv");
			rm.openEnd();

			rm.openStart("div", oTile.getId() + "-number");

			var numberLength = oTile.getNumber().length;
			if (numberLength < 5) {
				rm.class("sapMStdTileNum");
			} else if (numberLength < 8) {
				rm.class("sapMStdTileNumM");
			} else {
				rm.class("sapMStdTileNumS");
			}

			rm.openEnd();
			rm.text(oTile.getNumber());
			rm.close("div");

			if (oTile.getNumberUnit()) {
				rm.openStart("div", oTile.getId() + "-numberUnit");
				rm.class("sapMStdTileNumUnit");
				rm.openEnd();
				rm.text(oTile.getNumberUnit());
				rm.close("div");
			}
			rm.close("div"); // End number div
		}
		rm.close("div"); // End top row div


		rm.openStart("div"); // Start monitoring tile styling
		rm.class("sapMStdTileBottomRow");
		if (oTile.getType() === StandardTileType.Monitor) {
			rm.class("sapMStdTileMonitorType");
		}
		rm.openEnd();

		rm.openStart("div", oTile.getId() + "-title");  // Start title div
		rm.class("sapMStdTileTitle");
		rm.openEnd();
		if (oTile.getTitle()) {
			rm.text(oTile.getTitle());
		}
		rm.close("div"); // End title div

		if (oTile.getInfo()) {
			rm.openStart("div", oTile.getId() + "-info"); // Start info
			rm.class("sapMStdTileInfo");
			rm.class("sapMStdTileInfo" + infoState);

			/* WAI ARIA for infoState */
			if (infoState != ValueState.None) {
				rm.accessibilityState(oTile, {
					ariaDescribedBy: {
						value: oTile.getId() + "-sapSRH",
						append: true
					}
				});
			}

			rm.openEnd();
			if (oTile.getInfo()) {
				rm.text(oTile.getInfo());
			}
			rm.close("div"); // End info
		}

		/* WAI ARIA adding hidden element for infoStatus */
		if (infoState != ValueState.None) {
			rm.openStart("span", oTile.getId() + "-sapSRH");
			rm.class("sapUiInvisibleText");
			rm.accessibilityState({
				hidden: false
			});
			rm.openEnd();
			rm.text(ValueStateSupport.getAdditionalText(infoState));
			rm.close("span");
		}

		rm.close("div"); // End bottom row type tile styling

	};


	return StandardTileRenderer;

}, /* bExport= */ true);
