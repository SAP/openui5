/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Image
sap.ui.define(['sap/m/library', "sap/base/security/encodeCSS"],
	function(library, encodeCSS) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = library.ImageMode;

	/**
	 * Image renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ImageRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oImage The control that should be rendered
	 */
	ImageRenderer.render = function(oRm, oImage) {
		var sMode = oImage.getMode(),
			alt = oImage.getAlt(),
			tooltip = oImage.getTooltip_AsString(),
			bHasPressHandlers = oImage.hasListeners("press"),
			oLightBox = oImage.getDetailBox(),
			sUseMap = oImage.getUseMap(),
			aLabelledBy = oImage.getAriaLabelledBy(),
			aDescribedBy = oImage.getAriaDescribedBy(),
			bIsImageMode = sMode === ImageMode.Image;

		// Additional element for Image with LightBox
		if (oLightBox) {
			oRm.openStart("span", oImage);
			oRm.class("sapMLightBoxImage");
			oRm.openEnd();
			oRm.openStart("span").class("sapMLightBoxMagnifyingGlass").openEnd().close("span");
		}

		// Open the DOM element tag. The 'img' tag is used for mode sap.m.ImageMode.Image and 'span' tag is used for sap.m.ImageMode.Background

		if (bIsImageMode) {
			oRm.voidStart("img", !oLightBox ? oImage : oImage.getId() + "-inner");
		} else {
			oRm.openStart("span", !oLightBox ? oImage : oImage.getId() + "-inner");
		}

		// aria-labelledby references
		if (!oImage.getDecorative() && aLabelledBy && aLabelledBy.length > 0) {
			oRm.attr("aria-labelledby", aLabelledBy.join(" "));
		}

		// aria-describedby references
		if (!oImage.getDecorative() && aDescribedBy && aDescribedBy.length > 0) {
			oRm.attr("aria-describedby", aDescribedBy.join(" "));
		}

		if (bIsImageMode) {
			oRm.attr("src", oImage._getDensityAwareSrc());
		} else {
			// preload the image with a window.Image instance. The source uri is set to the output DOM node via CSS style 'background-image' after the source image is loaded (in onload function)
			oImage._preLoadImage(oImage._getDensityAwareSrc());
			if (oImage._isValidBackgroundSizeValue(oImage.getBackgroundSize())) {
				oRm.style("background-size", oImage.getBackgroundSize());
			}
			if (oImage._isValidBackgroundPositionValue(oImage.getBackgroundPosition())) {
				oRm.style("background-position", oImage.getBackgroundPosition());
			}
			oRm.style("background-repeat", encodeCSS(oImage.getBackgroundRepeat()));
		}

		oRm.class("sapMImg");
		if (oImage.hasListeners("press") || oImage.hasListeners("tap")) {
			oRm.class("sapMPointer");
		}

		if (sUseMap || !oImage.getDecorative() || bHasPressHandlers) {
			oRm.class("sapMImgFocusable");
		}

		//TODO implement the ImageMap control
		if (sUseMap) {
			if (!(sUseMap.startsWith("#"))) {
				sUseMap = "#" + sUseMap;
			}
			oRm.attr("usemap", sUseMap);
		}

		if (oImage.getDecorative() && !sUseMap && !bHasPressHandlers) {
			oRm.attr("role", "presentation");
			oRm.attr("aria-hidden", "true");
			oRm.attr("alt", ""); // accessibility requirement: write always empty alt attribute for decorative images
		} else if (alt || tooltip) {
			oRm.attr("alt", alt || tooltip);
		}

		if (alt || tooltip) {
			oRm.attr("aria-label", alt || tooltip);
		}

		if (tooltip) {
			oRm.attr("title", tooltip);
		}

		if (bHasPressHandlers) {
			oRm.attr("role", "button");
			oRm.attr("tabindex", 0);
		}

		oRm.style("width", oImage.getWidth());
		oRm.style("height", oImage.getHeight());

		bIsImageMode ? oRm.voidEnd() : oRm.openEnd().close("span"); // close the <img>/<span> element

		if (oLightBox) {
			oRm.close("span");
		}
	};

	return ImageRenderer;
}, /* bExport= */ true);