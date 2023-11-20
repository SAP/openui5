/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.InfoLabel
sap.ui.define([
	"./library",
	"sap/ui/core/library",
	"sap/base/Log",
	"sap/ui/core/IconPool"
], function (library, coreLibrary, Log, IconPool) {
	"use strict";

	var RenderMode = library.RenderMode;
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * <code>InfoLabel</code> renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var InfoLabelRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The <code>RenderManager</code> that can be used for writing to the renderer output buffer
	 * @param {sap.tnt.InfoLabel} oControl An object representation of the control that should be rendered
	 */
	InfoLabelRenderer.render = function (oRM, oControl) {
		var iColorVariant = oControl.getColorScheme(),
			sText = oControl.getText(),
			sTextDir = oControl.getTextDirection(),
			sWidth = oControl.getWidth(),
			sTooltip = oControl.getTooltip(),
			oIcon = oControl.getIcon();

		if (iColorVariant < 1 || iColorVariant > 10) {
			iColorVariant = 7;
			Log.warning("sap.tnt.InfoLabel: colorScheme value is set to the default value of 7. Provided value should be between 1 and 10");
		}

		oRM.openStart("div", oControl).class("sapTntInfoLabel");

		if (oControl.getRenderMode() === RenderMode.Narrow) {
			oRM.class("sapTntInfoLabelRenderModeNarrow");
		}

		if (oControl.getDisplayOnly()) {
			oRM.class("sapTntInfoLabelDisplayOnly");
		}

		if (sText === "") {
			oRM.class("sapTntInfoLabelNoText");
		}

		if (sWidth) {
			oRM.style("width", sWidth);
		}

		if (oIcon) {
			oRM.class("sapTntInfoLabelWithIcon");
		}

		// add tooltip if available
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		oRM.class("backgroundColor" + iColorVariant)
			.openEnd();

		oRM.openStart("span").class("sapTntInfoLabelInner");

		if (sTextDir !== TextDirection.Inherit){
			oRM.attr("dir", sTextDir.toLowerCase());
		}

		oRM.openEnd();

		// write the icon
		if (oIcon) {
			if (sText && oIcon) { // if there is an icon and text, the icon shouldn't have a tooltip
				oRM.icon(oIcon, [], { title: "" });
			} else {
				oRM.icon(oIcon);
			}
		}

		// write the text
		oRM.openStart("span").class("sapTntInfoLabelText").openEnd();
		oRM.text(sText);
		oRM.close("span");

		//close sapTntInfoLabelInner
		oRM.close("span");

		if (InfoLabelRenderer._sAriaText) {
			oRM.openStart("span").class("sapUiPseudoInvisibleText").openEnd();

			if (sText) {
				// there is text content
				oRM.text(InfoLabelRenderer._sAriaText);
			} else if (!oIcon) {
				// no text and no icon
				oRM.text(InfoLabelRenderer._sAriaTextEmpty);
			} else {
				// icon only - write the provided tooltip or icon text or name as fallback
				if (sTooltip) {
					oRM.text(sTooltip + " " + InfoLabelRenderer._sAriaText);
				} else if (IconPool.getIconInfo(oControl.getIcon()).text) {
					oRM.text(IconPool.getIconInfo(oControl.getIcon()).text + " " + InfoLabelRenderer._sAriaText);
				} else {
					oRM.text(IconPool.getIconInfo(oControl.getIcon()).name + " " + InfoLabelRenderer._sAriaText);
				}
			}

			oRM.close("span");
		}

		oRM.close("div");
	};

	return InfoLabelRenderer;
}, /* bExport= */ true);