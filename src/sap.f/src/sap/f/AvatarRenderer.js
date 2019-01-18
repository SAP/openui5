/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Avatar
sap.ui.define(["sap/f/library", "sap/base/security/encodeXML"],
	function (library, encodeXML) {
		"use strict";

		// shortcut for sap.f.AvatarSize
		var AvatarSize = library.AvatarSize;

		// shortcut for sap.f.AvatarType
		var AvatarType = library.AvatarType;

		/**
		 * <code>Avatar</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
		var AvatarRenderer = {};

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
				sSrc = oAvatar._getEscapedSrc(),
				sAvatarClass = "sapFAvatar",
				sTooltip = oAvatar.getTooltip_AsString(),
				sDefaultTooltip = oAvatar._getDefaultTooltip(),
				aLabelledBy = oAvatar.getAriaLabelledBy(),
				aDescribedBy = oAvatar.getAriaDescribedBy(),
				sAriaLabelTooltip = sTooltip && sInitials ? sDefaultTooltip + " " + sTooltip : sDefaultTooltip,
				sAriLabelInitials = sInitials ? sDefaultTooltip + " " + sInitials : sDefaultTooltip;

			oRm.write("<span");
			oRm.writeControlData(oAvatar);
			oRm.addClass(sAvatarClass);
			oRm.addClass(sAvatarClass + sDisplaySize);
			oRm.addClass(sAvatarClass + sActualDisplayType);
			oRm.addClass(sAvatarClass + sDisplayShape);
			if (oAvatar.hasListeners("press")) {
				oRm.addClass("sapMPointer");
				oRm.addClass("sapFAvatarFocusable");
				oRm.writeAttribute("role", "button");
				oRm.writeAttribute("tabIndex", 0);
			} else {
				oRm.writeAttribute("role", "img");
			}
			if (sDisplaySize === AvatarSize.Custom) {
				oRm.addStyle("width", sCustomDisplaySize);
				oRm.addStyle("height", sCustomDisplaySize);
				oRm.addStyle("font-size", sCustomFontSize);
			}
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
				oRm.writeAttributeEscaped("aria-label", sAriaLabelTooltip);
			} else {
				oRm.writeAttributeEscaped("aria-label", sAriLabelInitials);
			}
			// aria-labelledby references
			if (aLabelledBy && aLabelledBy.length > 0) {
				oRm.writeAttributeEscaped("aria-labelledby", aLabelledBy.join(" "));
			}
			// aria-describedby references
			if (aDescribedBy && aDescribedBy.length > 0) {
				oRm.writeAttributeEscaped("aria-describedby", aDescribedBy.join(" "));
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			if (sActualDisplayType === AvatarType.Icon || sImageFallbackType === AvatarType.Icon) {
				oRm.renderControl(oAvatar._getIcon());
			} else if (sActualDisplayType === AvatarType.Initials || sImageFallbackType === AvatarType.Initials){
				oRm.write("<span");
				oRm.addClass(sAvatarClass + "InitialsHolder");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sInitials);
				oRm.write("</span>");
			}
			if (sActualDisplayType === AvatarType.Image) {
				oRm.write("<span");
				oRm.addClass("sapFAvatarImageHolder");
				oRm.addClass(sAvatarClass + sActualDisplayType + sImageFitType);
				oRm.addStyle("background-image", "url('" + encodeXML(sSrc) + "')");
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");
				oRm.write("</span>");
			}
			// HTML element for the LightBox magnifying glass icon
			if (oAvatar._fnLightBoxOpen) {
				oRm.write("<span class=\"sapFAvatarMagnifyingGlass\"></span>");
			}
			oRm.write("</span>");
		};

		return AvatarRenderer;
	}, /* bExport= */ true);