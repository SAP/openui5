/*!
 * ${copyright}
 */

 sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";


	/**
	 * Link renderer
	 * @namespace
	 */
	var LinkRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	LinkRenderer.render = function(oRm, oControl) {
		var sTextDir = oControl.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oControl.getTextAlign(), sTextDir),
			oAccAttributes =  {
				role: 'link',
				haspopup: !oControl.getHref()
			};

		// Link is rendered as a "<a>" element
		oRm.write("<a");
		oRm.writeControlData(oControl);

		oRm.addClass("sapMLnk");
		if (oControl.getSubtle()) {
			oRm.addClass("sapMLnkSubtle");

			//Add aria-describedby for the SUBTLE announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkSubtleId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkSubtleId;
			}
		}

		if (oControl.getEmphasized()) {
			oRm.addClass("sapMLnkEmphasized");

			//Add aria-describedby for the EMPHASIZED announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkEmphasizedId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkEmphasizedId;
			}
		}

		if (!oControl.getEnabled()) {
			oRm.addClass("sapMLnkDsbl");
			oRm.writeAttribute("disabled", "true");
			oRm.writeAttribute("tabIndex", "-1"); // still focusable by mouse click, but not in the tab chain
		} else {
			oRm.writeAttribute("tabIndex", "0");
		}
		if (oControl.getWrapping()) {
			oRm.addClass("sapMLnkWrapping");
		}

		if (oControl.getTooltip_AsString()) {
			oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		}

		/* set href only if link is enabled - BCP incident 1570020625 */
		if (oControl.getHref() && oControl.getEnabled()) {
			oRm.writeAttributeEscaped("href", oControl.getHref());
		} else {
			/*eslint-disable no-script-url */
			oRm.writeAttribute("href", "javascript:void(0);");
			/*eslint-enable no-script-url */
		}

		if (oControl.getTarget()) {
			oRm.writeAttributeEscaped("target", oControl.getTarget());
		}

		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		} else {
			oRm.addClass("sapMLnkMaxWidth");
		}

		if (sTextAlign) {
			oRm.addStyle("text-align", sTextAlign);
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
			oRm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		oRm.writeAccessibilityState(oControl, oAccAttributes);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // opening <a> tag

		this.renderText(oRm, oControl);

		oRm.write("</a>");
	};

	/**
	 * Renders the normalized text property.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Link} oControl An object representation of the control that should be rendered.
	 */
	LinkRenderer.renderText = function(oRm, oControl) {
		oRm.writeEscaped(oControl.getText());
	};


	return LinkRenderer;

 }, /* bExport= */ true);
