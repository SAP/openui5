/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/IconPool',
	'sap/ui/core/ShortcutHintsMixin',
	'sap/m/library',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/AccessKeysEnablement'
],

	function(coreLibrary, IconPool, ShortcutHintsMixin, library, InvisibleText, AccessKeysEnablement) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.ButtonAccessibilityType
	var ButtonAccessibilityType = library.ButtonAccessibilityType;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.BadgeState
	var BadgeState = library.BadgeState;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

	/**
	 * Button renderer.
	 * @namespace
	 */
	var ButtonRenderer = {apiVersion: 2};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.m.Button} oButton
	 *            the button to be rendered
	 */
	ButtonRenderer.render = function(oRm, oButton) {

		// get control properties
		var sButtonId = oButton.getId();
		var sType = oButton.getType();
		var bEnabled = oButton.getEnabled();
		var sWidth = oButton.getWidth();
		var sTooltip = oButton._getTooltip();
		var sText = oButton._getText();
		var sTextDir = oButton.getTextDirection();
		// render bdi tag only if the browser is different from IE and Edge since it is not supported there
		var bRenderBDI = (sTextDir === TextDirection.Inherit);

		// get icon from icon pool
		var sBackURI = IconPool.getIconURI("nav-back");
		var sMinWidth;

		// start button tag
		oRm.openStart("button", oButton);
		oRm.class("sapMBtnBase");

		oRm.attr("data-ui5-accesskey", oButton.getProperty("accesskey"));

		// button container style class
		if (!oButton._isUnstyled()) {
			oRm.class("sapMBtn");

			// extend  minimum button size if icon is set without text for button types back and up
			if ((sType === ButtonType.Back || sType === ButtonType.Up) && oButton._getAppliedIcon() && !sText) {
				oRm.class("sapMBtnBack");
			}
		}

		//ARIA attributes
		var mAccProps = ButtonRenderer.generateAccProps(oButton);

		//descendants (e.g. ToggleButton) callback
		if (this.renderAccessibilityAttributes) {
			this.renderAccessibilityAttributes(oRm, oButton, mAccProps);
		}
		oRm.accessibilityState(oButton, mAccProps);

		// check if the button is disabled
		if (!bEnabled) {
			oRm.attr("disabled", "disabled");
			if (!oButton._isUnstyled()) {
				oRm.class("sapMBtnDisabled");
			}
		} else {
			switch (sType) {
			case ButtonType.Accept:
			case ButtonType.Reject:
			case ButtonType.Emphasized:
			case ButtonType.Attention:
				oRm.class("sapMBtnInverted");
				break;
			default: // No need to do anything for other button types
				break;
			}
		}

		// add tooltip if available
		if (sTooltip && !ShortcutHintsMixin.isDOMIDRegistered(sButtonId)) {
			oRm.attr("title", sTooltip);
		}

		// set user defined width
		if (sWidth != "" || sWidth.toLowerCase() === "auto") {
			oRm.style("width", sWidth);

			//this is a workaround until we move all button property classes to the root element
			//we need different min-width of the button in different cases
			//we may also need it different in different themes, but not possible with this workaround
			if (oButton._getAppliedIcon() && sText) {
				sMinWidth = "4rem";
			} else { //text only, icon only OR no text no icon
				sMinWidth = "2.25rem";
			}
			oRm.style("min-width", sMinWidth);
		}
		renderTabIndex(oButton, oRm);

		// close button tag
		oRm.openEnd();

		// start inner button tag
		oRm.openStart("span", sButtonId + "-inner");

		// button style class
		if (!oButton._isUnstyled()) {
			oRm.class("sapMBtnInner");
		}

		// check if button is hoverable
		if (oButton._isHoverable()) {
			oRm.class("sapMBtnHoverable");
		}

		// check if button is focusable (not disabled)
		if (bEnabled) {
			oRm.class("sapMFocusable");
		}

		if (!oButton._isUnstyled()) {
			if (sText) {
				oRm.class("sapMBtnText");
			}
			if (sType === ButtonType.Back || sType === ButtonType.Up) {
				oRm.class("sapMBtnBack");
			}
			if (oButton._getAppliedIcon()) {
				if (oButton.getIconFirst()) {
					oRm.class("sapMBtnIconFirst");
				} else {
					oRm.class("sapMBtnIconLast");
				}
			}
		}

		//get render attributes of depended buttons (e.g. ToggleButton)
		if (this.renderButtonAttributes) {
			this.renderButtonAttributes(oRm, oButton);
		}

		// set button specific styles
		if (!oButton._isUnstyled() && sType !== "") {
			// set button specific styles
			oRm.class("sapMBtn" + sType);
		}

		//apply on the inner level as well as not applying it will allow for focusing the button after a mouse click
		renderTabIndex(oButton, oRm);

		// close inner button tag
		oRm.openEnd();

		// set image for internal image control (back)
		if (sType === ButtonType.Back || sType === ButtonType.Up) {
			this.writeInternalIconPoolHtml(oRm, oButton, sBackURI);
		}

		// write icon
		if (oButton.getIconFirst() && oButton._getAppliedIcon()) {
			this.writeImgHtml(oRm, oButton);
		}

		// write button text
		if (sText) {
			oRm.openStart("span", sButtonId + "-content");
			oRm.class("sapMBtnContent");
			// check if textDirection property is not set to default "Inherit" and add "dir" attribute
			if (sTextDir !== TextDirection.Inherit) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}

			if (oButton.getProperty("highlightAccKeysRef")) {
				oRm.class(AccessKeysEnablement.CSS_CLASS);
			}

			oRm.openEnd();

			if (bRenderBDI) {
				oRm.openStart("bdi", sButtonId + "-BDI-content");
				oRm.openEnd();
			}
			oRm.text(sText);
			if (bRenderBDI) {
				oRm.close("bdi");
			}
			oRm.close("span");
		}

		// write icon
		if (!oButton.getIconFirst() && oButton._getAppliedIcon()) {
			this.writeImgHtml(oRm, oButton);
		}

		// end inner button tag
		oRm.close("span");

		// add tooltip if available
		if (sTooltip) {
			oRm.openStart("span", sButtonId + "-tooltip");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(sTooltip);
			oRm.close("span");
		}

		// end button tag
		oRm.close("button");
	};

	/**
	 * HTML for image
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.m.Button} oButton
	 *            the button to be rendered
	 * @private
	 */
	ButtonRenderer.writeImgHtml = function(oRm, oButton) {
		var sType = oButton.getType(),
			bHasExplicitIcon = oButton.getIcon(),
			bIsBackType = (sType === ButtonType.Back) || (sType === ButtonType.Up);

		// Avoid duplicated rendering of the default Back/Up icon. Due to legacy
		// reasons, those types are different than the others and can have 2 icons
		// at the same time - here we render the one that's explicitly provided.
		//
		// If such isn't provided, our button will get the default icon for its type.
		// However, because Back/Up's default icon is already rendered, two identical
		// icons will appear unless we escape this here.
		if (!bHasExplicitIcon && bIsBackType) {
			return;
		}

		oRm.renderControl(oButton._getImage(
			oButton.getId() + "-img",
			oButton._getAppliedIcon(),
			oButton.getActiveIcon(),
			oButton.getIconDensityAware()));
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm
	 *	      the RenderManager that can be used for writing to
	 *	      the Render-Output-Buffer
	 * @param {sap.m.Button} oButton
	 *	      the button to be rendered
	 * @param {sap.ui.core.URI} sURI
	 *            URI of the icon to be written
	 * HTML for internal image (icon pool)
	 */
	ButtonRenderer.writeInternalIconPoolHtml = function(oRm, oButton, sURI) {
		oRm.renderControl(oButton._getInternalIconBtn((oButton.getId() + "-iconBtn"), sURI));
	};

	/**
	 * Renders tabindex with value of "-1" if required by  <code>_bExcludeFromTabChain</code> property.
	 * @param {sap.m.Button} oButton The sap.m.Button to be rendered
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 */
	function renderTabIndex(oButton, oRm){
		if (oButton._bExcludeFromTabChain) {
			oRm.attr("tabindex", -1);
		}
	}

	var mARIATextKeys = {
		Accept: "BUTTON_ARIA_TYPE_ACCEPT",
		Reject: "BUTTON_ARIA_TYPE_REJECT",
		Attention: "BUTTON_ARIA_TYPE_ATTENTION",
		Emphasized: "BUTTON_ARIA_TYPE_EMPHASIZED",
		Critical: "BUTTON_ARIA_TYPE_CRITICAL",
		Negative: "BUTTON_ARIA_TYPE_NEGATIVE",
		Success: "BUTTON_ARIA_TYPE_SUCCESS"
	};

	ButtonRenderer.getButtonTypeAriaLabelId = function(sType) {
		return InvisibleText.getStaticId("sap.m", mARIATextKeys[sType]);
	};

	ButtonRenderer.getBadgeTextId = function(oButton) {
		return oButton._oBadgeData && oButton._oBadgeData.value !== "" && oButton._oBadgeData.state !== BadgeState.Disappear ? oButton._getBadgeInvisibleText().getId() : "";
	};

	ButtonRenderer.generateAccProps = function (oButton) {
		var sText = oButton._getText(),
			sHasPopupType = oButton.getAriaHasPopup(),
			mAccProps;

		if (sText) {
			mAccProps = ButtonRenderer.generateTextButtonAccProps(oButton);
		} else {
			mAccProps = ButtonRenderer.generateIconOnlyButtonAccProps(oButton);
		}

		// prevent rendering of aria-disabled attribute to avoid having
		// both aria-disabled and disabled at the same time
		mAccProps["disabled"] = null;

		mAccProps["haspopup"] = (sHasPopupType === AriaHasPopup.None) ? null : sHasPopupType.toLowerCase();

		return mAccProps;
	};

	ButtonRenderer.generateIconOnlyButtonAccProps = function (oButton) {
		var sTypeId = ButtonRenderer.getButtonTypeAriaLabelId(oButton.getType()),
			sBadgeTextId = this.getBadgeTextId(oButton),
			sTooltip = oButton._getTooltip(),
			sTooltipId = oButton.getId() + "-tooltip", // Icon-only buttons will always have a tooltip
			sAccessibilityType = oButton._determineAccessibilityType(),
			mAccProps = {},
			sDescription;

		switch (sAccessibilityType) {
			case ButtonAccessibilityType.Default:
				mAccProps["label"] = { value: sTooltip, append: true };
				break;
			case ButtonAccessibilityType.Described:
				mAccProps["label"] = { value: sTooltip, append: true };

				sDescription = (sTypeId + " " + sBadgeTextId).trim();
				sDescription && (mAccProps["describedby"] = { value: sDescription, append: true });
				break;
			case ButtonAccessibilityType.Labelled:
				mAccProps["describedby"] = { value: sTooltipId, append: true };
				break;
			case ButtonAccessibilityType.Combined:
				mAccProps["describedby"] = { value: (sTooltipId + " " + sTypeId + " " + sBadgeTextId).trim(), append: true };
				break;
			default:
				break;
		}

		return mAccProps;
	};

	ButtonRenderer.generateTextButtonAccProps = function (oButton) {
		var sButtonId = oButton.getId(),
			sTypeId = ButtonRenderer.getButtonTypeAriaLabelId(oButton.getType()),
			sBadgeTextId = this.getBadgeTextId(oButton),
			sTooltipId = oButton._getTooltip() ? sButtonId + "-tooltip" : "", // Don't assign if empty (to ease conditions in the switch)
			sInnerTextId = sButtonId + "-content",
			sAccessibilityType = oButton._determineAccessibilityType(),
			bPlaceSelfReference = oButton._determineSelfReferencePresence(),
			mAccProps = {},
			sDescription;

		switch (sAccessibilityType) {
			case ButtonAccessibilityType.Default:
				sTooltipId && (mAccProps["describedby"] = { value: sTooltipId, append: true });
				break;
			case ButtonAccessibilityType.Described:
				sDescription = (sTooltipId + " " + sTypeId + " " + sBadgeTextId).trim();
				sDescription && (mAccProps["describedby"] = { value: sDescription, append: true });
				break;
			case ButtonAccessibilityType.Labelled:
				bPlaceSelfReference && (mAccProps["labelledby"] = { value: sInnerTextId, append: true });
				sTooltipId && (mAccProps["describedby"] = { value: sTooltipId, append: true });
				break;
			case ButtonAccessibilityType.Combined:
				sDescription = (sTooltipId + " " + sTypeId + " " + sBadgeTextId).trim();
				sDescription && (mAccProps["describedby"] = { value: sDescription, append: true });
				bPlaceSelfReference && (mAccProps["labelledby"] = { value: sInnerTextId, append: true });
				break;
			default:
				break;
		}

		return mAccProps;
	};

	return ButtonRenderer;

}, /* bExport= */ true);