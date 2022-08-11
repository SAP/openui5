/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Image
sap.ui.define(['sap/m/library', "sap/base/security/encodeCSS", "sap/ui/core/library"],
	function(library, encodeCSS, coreLibrary) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = library.ImageMode;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

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
	 * @param {sap.m.Image} oImage The control that should be rendered
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
			aDetails = oImage.getAriaDetails(),
			bIsImageMode = sMode === ImageMode.Image,
			bIsSvgMode = sMode === ImageMode.InlineSvg,
			bIsBackGroundMode = sMode === ImageMode.Background,
			bLazyLoading = oImage.getLazyLoading(),
			sAriaHasPopup = oImage.getAriaHasPopup();

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
			if (bLazyLoading) {
				oRm.attr("loading", "lazy");
			}

		} else  if (bIsSvgMode) {
			oRm.openStart("div", oImage);
		} else {
			oRm.openStart("span", !oLightBox ? oImage : oImage.getId() + "-inner");
		}

		if (!oImage.getDecorative()) {
			// aria-labelledby references
			if (aLabelledBy && aLabelledBy.length > 0) {
				oRm.attr("aria-labelledby", aLabelledBy.join(" "));
			}

			// aria-describedby references
			if (aDescribedBy && aDescribedBy.length > 0) {
				oRm.attr("aria-describedby", aDescribedBy.join(" "));
			}

			// aria-details references
			if (aDetails && aDetails.length > 0) {
				oRm.attr("aria-details", aDetails.join(" "));
			}
		}

		if (bIsImageMode) {
			oRm.attr("src", oImage._getDensityAwareSrc());
		} else if (bIsBackGroundMode) {
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

		if (sAriaHasPopup !== AriaHasPopup.None) {
			oRm.attr("aria-haspopup", sAriaHasPopup.toLowerCase());
		}

		if (bHasPressHandlers) {
			oRm.attr("role", "button");
			oRm.attr("tabindex", 0);
		}

		oRm.style("width", oImage.getWidth());
		oRm.style("height", oImage.getHeight());

		if (bIsImageMode) {
			oRm.voidEnd();
		} else if (bIsSvgMode) {
			oRm.openEnd();
			this._renderSvg(oRm, oImage);
			oRm.close("div");
		} else {
			oRm.openEnd().close("span");
		}

		if (oLightBox) {
			oRm.close("span");
		}
	};

	ImageRenderer._renderSvg = function(oRm, oImage) {
		var oSvg = oImage._getSvgCachedData(),
			oChildren;

		if (!oSvg) {
			return;
		}

		oChildren = oSvg.children;
		this._renderSvgChildren(oRm, oChildren, oImage);
	};

	ImageRenderer._renderSvgAttributes = function (oRm, aAttributes, oImage) {
		for (var i = 0; i < aAttributes.length; i++) {
			var oAttr = aAttributes[i],
				iNamespaceIndex = oAttr.name.indexOf(":"),
				sAttributeName = iNamespaceIndex < 0 ? oAttr.name : oAttr.name.slice(iNamespaceIndex + 1);

			if (sAttributeName === "href" && !oImage._isHrefValid(oAttr.value)) {
				continue;
			}

			oRm.attr(sAttributeName, oAttr.value);
		}
	};

	ImageRenderer._renderSvgChildren = function (oRm, oChildren, oImage) {
		var aChildren = [].slice.call(oChildren).filter(function (oChild) {
			return (oChild.nodeType !== Node.TEXT_NODE)
				// Do not return empty textContent -> line spaces/endings
				|| (oChild.nodeType === Node.TEXT_NODE && oChild.textContent.trim() !== "");
		});

		aChildren.forEach(function (oChild) {
			var sTagName = oChild.tagName,
				aAttributes = oChild.attributes,
				oChildren = oChild.childNodes;

			if (oChild.nodeType !== Node.TEXT_NODE) {
				oRm.openStart(sTagName);
				this._renderSvgAttributes(oRm, aAttributes, oImage);
				oRm.openEnd();

				oChildren.length && this._renderSvgChildren(oRm, oChildren, oImage);
				oRm.close(sTagName);

			} else {
				oChild.textContent.length && oRm.text(oChild.textContent.trim());
			}
		}, this);
	};

	return ImageRenderer;
}, /* bExport= */ true);