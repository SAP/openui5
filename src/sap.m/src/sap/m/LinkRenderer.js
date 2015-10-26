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
	LinkRenderer.render = function(rm, oControl) {
		var sTextDir = oControl.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oControl.getTextAlign(), sTextDir),
			oAccAttributes =  {
				role: 'link',
				haspopup: !oControl.getHref()
			};

		// Link is rendered as a "<a>" element
		rm.write("<a");
		rm.writeControlData(oControl);

		rm.addClass("sapMLnk");
		if (oControl.getSubtle()) {
			rm.addClass("sapMLnkSubtle");

			//Add aria-describedby for the SUBTLE announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkSubtleId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkSubtleId;
			}
		}

		if (oControl.getEmphasized()) {
			rm.addClass("sapMLnkEmphasized");

			//Add aria-describedby for the EMPHASIZED announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkEmphasizedId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkEmphasizedId;
			}
		}

		if (!oControl.getEnabled()) {
			rm.addClass("sapMLnkDsbl");
			rm.writeAttribute("disabled", "true");
			rm.writeAttribute("tabIndex", "-1"); // still focusable by mouse click, but not in the tab chain
		} else {
			rm.writeAttribute("tabIndex", "0");
		}
		if (oControl.getWrapping()) {
			rm.addClass("sapMLnkWrapping");
		}

		if (oControl.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		}

		/* set href only if link is enabled - BCP incident 1570020625 */
		if (oControl.getHref() && oControl.getEnabled()) {
			rm.writeAttributeEscaped("href", oControl.getHref());
		} else {
			/*eslint-disable no-script-url */
			rm.writeAttribute("href", "javascript:void(0);");
			/*eslint-enable no-script-url */
		}

		if (oControl.getTarget()) {
			rm.writeAttributeEscaped("target", oControl.getTarget());
		}

		if (oControl.getWidth()) {
			rm.addStyle("width", oControl.getWidth());
		} else {
			rm.addClass("sapMLnkMaxWidth");
		}

		if (sTextAlign) {
			rm.addStyle("text-align", sTextAlign);
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
			rm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		rm.writeAccessibilityState(oControl, oAccAttributes);
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">"); // opening <a> tag

		if (oControl.getText()) {
			rm.writeEscaped(oControl.getText());
		}

		rm.write("</a>");
	};


	return LinkRenderer;

 }, /* bExport= */ true);
