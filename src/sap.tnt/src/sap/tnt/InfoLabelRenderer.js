/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.InfoLabel
sap.ui.define(["./library", "sap/ui/core/Renderer", "sap/ui/core/library", "sap/base/Log", "sap/ui/core/IconPool"],
	function(library, Renderer, coreLibrary, Log, IconPool) {
		"use strict";

		var RenderMode = library.RenderMode;
		var TextDirection = coreLibrary.TextDirection;

		/**
		 * <code>InfoLabel</code> renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var InfoLabelRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The <code>RenderManager</code> that can be used for writing to the renderer output buffer
		 * @param {sap.tnt.InfoLabel} oControl An object representation of the control that should be rendered
		 */
		InfoLabelRenderer.render = function (oRm, oControl) {
			var iColorVariant = oControl.getColorScheme(),
				sRenderMode = oControl.getRenderMode(),
				sText = oControl.getText(),
				sTextDir = oControl.getTextDirection(),
				sWidth = oControl.getWidth(),
				sTooltip = oControl.getTooltip(),
				bDisplayOnly = oControl.getDisplayOnly(),
				oIcon = oControl.getIcon();

			if (iColorVariant < 1 || iColorVariant > 10) {
				iColorVariant = 7;
				Log.warning("sap.tnt.InfoLabel: colorScheme value is set to the default value of 7. Provided value should be between 1 and 10");
			}

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapTntInfoLabel");

			if (sRenderMode === RenderMode.Narrow) {
				oRm.addClass("sapTntInfoLabelRenderModeNarrow");
			}

			if (bDisplayOnly) {
				oRm.addClass("sapTntInfoLabelDisplayOnly");
			}

			if (sText === "") {
				oRm.addClass("sapTntInfoLabelNoText");
			}

			if (sWidth) {
				oRm.addStyle("width", sWidth);
			}

			if (oIcon) {
				oRm.addClass("sapTntInfoLabelWithIcon");
			}

			// add tooltip if available
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			oRm.addClass("backgroundColor" + iColorVariant );
			oRm.writeClasses();
			oRm.writeStyles();

			oRm.write(">");

			oRm.write("<span");
			oRm.addClass("sapTntInfoLabelInner");
			oRm.writeClasses();

			if (sTextDir !== TextDirection.Inherit){
				oRm.writeAttribute("dir", sTextDir.toLowerCase());
			}

			oRm.write(">");

			// write the icon
			if (oIcon) {
				if (sText && oIcon) { // if there are icon and text the icon shouldn't have a tooltip
					oRm.writeIcon(oIcon, [], {title: ""});
				} else {
					oRm.writeIcon(oIcon);
				}
			}

			// write the text
			oRm.write("<span");
			oRm.addClass("sapTntInfoLabelText");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sText);
			oRm.write("</span>");

			//close sapTntInfoLabelInner
			oRm.write("</span>");

			if (InfoLabelRenderer._sAriaText) {

				oRm.write("<span class='sapUiPseudoInvisibleText'>");

				if (sText) {
					// there is text content
					oRm.writeEscaped(InfoLabelRenderer._sAriaText);
				} else if (!oIcon) {
					// no text and no icon
					oRm.writeEscaped(InfoLabelRenderer._sAriaTextEmpty);
				} else {
					// icon only - write the provided tooltip or icon text or name as fallback
					if (sTooltip) {
						oRm.writeEscaped(sTooltip + " " + InfoLabelRenderer._sAriaText);
					} else if (IconPool.getIconInfo(oControl.getIcon()).text) {
						oRm.writeEscaped(IconPool.getIconInfo(oControl.getIcon()).text + " " + InfoLabelRenderer._sAriaText);
					} else {
						oRm.writeEscaped(IconPool.getIconInfo(oControl.getIcon()).name + " " + InfoLabelRenderer._sAriaText);
					}
				}

				oRm.write("</span>");
			}

			oRm.write("</div>");
		};

		return InfoLabelRenderer;

	}, /* bExport= */ true);