/*!
 * ${copyright}
 */

 sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library'],
	function(Renderer, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * Link renderer
	 * @namespace
	 */
	var LinkRenderer = {
			apiVersion: 2
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
			bShouldHaveOwnLabelledBy = oControl._determineSelfReferencePresence(),
			sHref = oControl.getHref(),
			oAccAttributes =  {
				labelledby: bShouldHaveOwnLabelledBy ? {value: oControl.getId(), append: true } : undefined
			},
			bIsValid = sHref && oControl._isHrefValid(sHref),
			bEnabled = oControl.getEnabled(),
			sTypeSemanticInfo = "";

		// Link is rendered as a "<a>" element
		oRm.openStart("a", oControl);

		oRm.class("sapMLnk");
		if (oControl.getSubtle()) {
			oRm.class("sapMLnkSubtle");
			sTypeSemanticInfo += oControl._sAriaLinkSubtleId;
		}

		if (oControl.getEmphasized()) {
			oRm.class("sapMLnkEmphasized");
			sTypeSemanticInfo += " " + oControl._sAriaLinkEmphasizedId;
		}

		oAccAttributes.describedby = sTypeSemanticInfo ? {value: sTypeSemanticInfo.trim(), append: true} : undefined;

		if (!bEnabled) {
			oRm.class("sapMLnkDsbl");
			oRm.attr("aria-disabled", "true");
		}
		oRm.attr("tabindex", oControl._getTabindex());

		if (oControl.getWrapping()) {
			oRm.class("sapMLnkWrapping");
		}

		if (oControl.getTooltip_AsString()) {
			oRm.attr("title", oControl.getTooltip_AsString());
		}

		/* set href only if link is enabled - BCP incident 1570020625 */
		if (bIsValid && bEnabled) {
			oRm.attr("href", sHref);
		} else if (oControl.getText()) {
			// Add href only if there's text. Otherwise virtual cursor would stop on the empty link. BCP 2070055617
			oRm.attr("href", "");
		}

		if (oControl.getTarget()) {
			oRm.attr("target", oControl.getTarget());
		}

		if (oControl.getWidth()) {
			oRm.style("width", oControl.getWidth());
		} else {
			oRm.class("sapMLnkMaxWidth");
		}

		if (sTextAlign) {
			oRm.style("text-align", sTextAlign);
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		oControl.getDragDropConfig().forEach(function (oDNDConfig) {
			if (!oDNDConfig.getEnabled()) {
				oRm.attr("draggable", false);
			}
		});

		oRm.accessibilityState(oControl, oAccAttributes);
		// opening <a> tag
		oRm.openEnd();

		if (this.writeText) {
			this.writeText(oRm, oControl);
		} else {
			this.renderText(oRm, oControl);
		}

		oRm.close("a");
	};

	/**
	 * Renders the normalized text property.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Link} oControl An object representation of the control that should be rendered.
	 */
	LinkRenderer.renderText = function(oRm, oControl) {
		oRm.text(oControl.getText());
	};

	return LinkRenderer;

 }, /* bExport= */ true);
