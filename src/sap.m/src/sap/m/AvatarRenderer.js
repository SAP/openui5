/*!
 * ${copyright}
 */

// Provides default renderer for controlsap.m.Avatar
sap.ui.define(["sap/m/library", "sap/base/security/encodeCSS"],
	function (library, encodeCSS) {
		"use strict";

		// shortcut for sap.m.AvatarSize
		var AvatarSize = library.AvatarSize;

		// shortcut for sap.m.AvatarType
		var AvatarType = library.AvatarType;

		/**
		 * <code>Avatar</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
		var AvatarRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oAvatar an object representation of the control that should be rendered
		 */
		AvatarRenderer.render = function (oRm, oAvatar) {
			var sInitials = oAvatar.getInitials(),
				sActualDisplayType = oAvatar._getActualDisplayType(),
				sImageFallbackType = oAvatar._getImageFallbackType(),
				sDisplaySize = oAvatar.getDisplaySize(),
				sDisplayShape = oAvatar.getDisplayShape(),
				sImageFitType = oAvatar.getImageFitType(),
				sCustomDisplaySize = oAvatar.getCustomDisplaySize(),
				sCustomFontSize = oAvatar.getCustomFontSize(),
				sSrc = oAvatar.getSrc(),
				sAvatarClass = "sapFAvatar",
				sTooltip = oAvatar.getTooltip_AsString(),
				sDefaultTooltip = oAvatar._getDefaultTooltip(),
				aLabelledBy = oAvatar.getAriaLabelledBy(),
				aDescribedBy = oAvatar.getAriaDescribedBy(),
				sAriaLabelTooltip = sTooltip && sInitials ? sDefaultTooltip + " " + sTooltip : sDefaultTooltip,
				sAriaLabelInitials = sInitials ? sDefaultTooltip + " " + sInitials : sDefaultTooltip;

			oRm.openStart("span", oAvatar);
			oRm.class(sAvatarClass);
			oRm.class("sapFAvatarColor" + oAvatar._getActualBackgroundColor());
			oRm.class(sAvatarClass + sDisplaySize);
			oRm.class(sAvatarClass + sActualDisplayType);
			oRm.class(sAvatarClass + sDisplayShape);
			if (oAvatar.hasListeners("press")) {
				oRm.class("sapMPointer");
				oRm.class(sAvatarClass + "Focusable");
				oRm.attr("role", "button");
				oRm.attr("tabindex", 0);
			} else {
				oRm.attr("role", "img");
			}
			if (oAvatar.getShowBorder()) {
				oRm.class("sapFAvatarBorder");
			}
			if (sDisplaySize === AvatarSize.Custom) {
				oRm.style("width", sCustomDisplaySize);
				oRm.style("height", sCustomDisplaySize);
				oRm.style("font-size", sCustomFontSize);
			}
			if (sTooltip) {
				oRm.attr("title", sTooltip);
				oRm.attr("aria-label",sAriaLabelTooltip);
			} else {
				oRm.attr("aria-label",sAriaLabelInitials);
			}
			// aria-labelledby references
			if (aLabelledBy && aLabelledBy.length > 0) {
				oRm.attr("aria-labelledby", aLabelledBy.join(" "));
			}
			// aria-describedby references
			if (aDescribedBy && aDescribedBy.length > 0) {
				oRm.attr("aria-describedby", aDescribedBy.join(" "));
			}
			oRm.openEnd();
			if (sActualDisplayType === AvatarType.Icon || sImageFallbackType === AvatarType.Icon) {
				oRm.renderControl(oAvatar._getIcon());
			} else if (sActualDisplayType === AvatarType.Initials || sImageFallbackType === AvatarType.Initials){
				oRm.openStart("span");
				oRm.class(sAvatarClass + "InitialsHolder");
				oRm.openEnd();
				oRm.text(sInitials);
				oRm.close("span");
			}
			if (sActualDisplayType === AvatarType.Image) {
				oRm.openStart("span");
				oRm.class(sAvatarClass + "ImageHolder");
				oRm.class(sAvatarClass + sActualDisplayType + sImageFitType);
				oRm.style("background-image", "url('" + encodeCSS(sSrc) + "')");
				oRm.openEnd();
				oRm.close("span");
			}
			// HTML element for the LightBox magnifying glass icon
			if (oAvatar._fnLightBoxOpen) {
				oRm.openStart("span").class(sAvatarClass + "MagnifyingGlass").openEnd().close("span");
			}
			oRm.close("span");
		};

		return AvatarRenderer;
	}, /* bExport= */ true);