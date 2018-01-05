/*
 * ${copyright}
 */

sap.ui.define(['sap/ui/Device'],
	function (Device) {
		"use strict";

		/**
		 * ColorPalette renderer.
		 * @namespace
		 */
		var ColorPaletteRenderer = {};


		// reference to the message bundle
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ColorPalette} oColorPalette A palette instance
		 */
		ColorPaletteRenderer.render = function (oRm, oColorPalette) {
			oRm.write("<div");
			oRm.writeControlData(oColorPalette);
			oRm.addClass("sapMColorPalette");
			oRm.writeClasses();
			oRm.writeAttribute("tabIndex", "0");
			oRm.write(">");

			//render default button
			if (oColorPalette._getShowDefaultColorButton()) {
				this.renderDefaultColorButton(oRm, oColorPalette);
				this.renderSeparator(oRm);
			}

			//render squares
			this.renderSwatches(oRm, oColorPalette);


			//render more colors button
			if (oColorPalette._getShowMoreColorsButton()) {
				this.renderSeparator(oRm);
				this.renderMoreColorsButton(oRm, oColorPalette);
				if (Device.system.phone) { // for phones there should be one additional separator after More Colors
					this.renderSeparator(oRm);
				}
			}
			oRm.write("</div>"); //close palette container
		};

		/**
		 * Renders the palette color boxes.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ColorPalette} oColorPalette A palette instance
		 */
		ColorPaletteRenderer.renderSwatches = function (oRm, oColorPalette) {
			var sColors = oColorPalette.getColors();

			oRm.write("<div");
			oRm.addClass("sapMColorPaletteContent");
			oRm.writeClasses();
			oRm.writeAccessibilityState(oColorPalette, {
				"role": "region",
				"label": oLibraryResourceBundle.getText("COLOR_PALETTE_SWATCH_CONTAINER_TITLE")
			});
			oRm.write(">");

			sColors.forEach(function (sColor, iIndex) {
				this.renderSquare(oRm, oColorPalette, sColor, iIndex);
			}, this);

			oRm.write("</div>"); //close palette squares container
		};

		/**
		 * Renders one palette color box.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ColorPalette} oColorPalette A palette instance
		 * @param {sap.ui.core.CSSColor} sColor A color used as background
		 * @param {number} iIndex the index of the color amongst its siblings
		 */
		ColorPaletteRenderer.renderSquare = function (oRm, oColorPalette, sColor, iIndex) {
			var sNamedColor = oColorPalette._ColorsHelper.getNamedColor(sColor),
				sColorNameAria = oLibraryResourceBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [iIndex + 1,
					sNamedColor || oLibraryResourceBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR_CUSTOM")]);

			oRm.write("<div");
			oRm.addClass("sapMColorPaletteSquare");
			oRm.writeClasses();
			oRm.writeAttribute("data-sap-ui-color", sColor);
			oRm.writeAttribute("tabindex", "-1");

			oRm.writeAttribute("title", sColorNameAria);
			oRm.writeAccessibilityState(oColorPalette, {
				"role": "button",
				"label": sColorNameAria
			});
			oRm.write(">");

			//swatch inner content
			oRm.write("<div");
			oRm.addStyle("background-color", sColor);
			oRm.writeStyles();
			oRm.write("></div>");

			oRm.write("</div>"); //close palette swatch
		};

		ColorPaletteRenderer.renderSeparator = function (oRm) {
			oRm.write("<div");
			oRm.addClass("sapMColorPaletteSeparator");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<hr/>");
			oRm.write("</div>");
		};

		/**
		 * Renders the default color button.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ColorPalette} oColorPalette A palette instance
		 */
		ColorPaletteRenderer.renderDefaultColorButton = function (oRm, oColorPalette) {
			oRm.renderControl(oColorPalette._getDefaultColorButton());
		};

		/**
		 * Renders the more colors button.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ColorPalette} oColorPalette A palette instance
		 */
		ColorPaletteRenderer.renderMoreColorsButton = function (oRm, oColorPalette) {
			oRm.renderControl(oColorPalette._getMoreColorsButton());
		};

		return ColorPaletteRenderer;

	}, /* bExport= */ true);
