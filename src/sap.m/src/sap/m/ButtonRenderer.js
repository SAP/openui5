/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/library',
	'sap/ui/core/IconPool',
	'sap/m/library',
	'sap/ui/core/InvisibleText'
],

	function(Device, coreLibrary, IconPool, library, InvisibleText) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

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
	 * @param {sap.ui.core.Control} oButton
	 *            the button to be rendered
	 */
	ButtonRenderer.render = function(oRm, oButton) {

		// get control properties
		var sType = oButton.getType();
		var bEnabled = oButton.getEnabled();
		var sWidth = oButton.getWidth();
		var sTooltip = oButton._getTooltip();
		var sText = oButton._getText();
		var sTextDir = oButton.getTextDirection();
		var bIE_Edge = Device.browser.internet_explorer || Device.browser.edge;
		// render bdi tag only if the browser is different from IE and Edge since it is not supported there
		var bRenderBDI = (sTextDir === TextDirection.Inherit) && !bIE_Edge;

		// get icon from icon pool
		var sBackURI = IconPool.getIconURI("nav-back");

		// start button tag
		oRm.openStart("button", oButton);
		oRm.class("sapMBtnBase");

		// button container style class
		if (!oButton._isUnstyled()) {
			oRm.class("sapMBtn");

			// extend  minimum button size if icon is set without text for button types back and up
			if ((sType === ButtonType.Back || sType === ButtonType.Up) && oButton._getAppliedIcon() && !sText) {
				oRm.class("sapMBtnBack");
			}
		}

		//ARIA attributes
		var mAccProps = {};

		var sTooltipId = oButton.getId() + "-tooltip";

		var sTextId = ButtonRenderer.getButtonTypeAriaLabelId(sType);
		if (sTextId && sTooltip) {
			mAccProps["describedby"] = {value: sTooltipId + " " + sTextId, append: true};
		} else if (sTextId) {
			mAccProps["describedby"] = {value: sTextId, append: true};
		} else if (sTooltip) {
			mAccProps["describedby"] = {value: sTooltipId, append: true};
		}

		// add reference only to the text content of the button
		// so it can be read otherwise it causes the issue reported in BCP: 168022332, 1970225991
		if (oButton._determineSelfReferencePresence()) {
			mAccProps["labelledby"] = { value: oButton.getId() + "-content", append: true };
		}

		// prevent rendering of aria-disabled attribute
		// no matter what state we have in the control
		mAccProps["disabled"] = null;

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
				oRm.class("sapMBtnInverted");
				break;
			default: // No need to do anything for other button types
				break;
			}
		}

		// add tooltip if available
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		// set user defined width
		if (sWidth != "" || sWidth.toLowerCase() === "auto") {
			oRm.style("width", sWidth);
		}
		renderTabIndex(oButton, oRm);

		// close button tag
		oRm.openEnd();

		// start inner button tag
		oRm.openStart("span", oButton.getId() + "-inner");

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
			// special focus handling for IE
			if (bIE_Edge) {
				oRm.class("sapMIE");
			}
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
		if (oButton._getAppliedIcon()) {
			this.writeImgHtml(oRm, oButton);
		}

		// write button text
		if (sText) {
			oRm.openStart("span", oButton.getId() + "-content");
			oRm.class("sapMBtnContent");
			// check if textDirection property is not set to default "Inherit" and add "dir" attribute
			if (sTextDir !== TextDirection.Inherit) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}
			oRm.openEnd();

			if (bRenderBDI) {
				oRm.openStart("bdi", oButton.getId() + "-BDI-content");
				oRm.openEnd();
			}
			oRm.text(sText);
			if (bRenderBDI) {
				oRm.close("bdi");
			}
			oRm.close("span");
		}

		// special handling for IE focus outline
		if (bIE_Edge && bEnabled) {
			oRm.openStart("span");
			oRm.class("sapMBtnFocusDiv");
			oRm.openEnd();
			oRm.close("span");
		}

		// end inner button tag
		oRm.close("span");

		// add tooltip if available
		if (sTooltip) {
			oRm.openStart("span", sTooltipId);
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
	 * @param {sap.ui.core.Control} oButton
	 *            the button to be rendered
	 * @private
	 */
	ButtonRenderer.writeImgHtml = function(oRm, oButton) {
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
	 * @param {sap.ui.core.Control} oButton
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
		Emphasized: "BUTTON_ARIA_TYPE_EMPHASIZED"
	};

	ButtonRenderer.getButtonTypeAriaLabelId = function(sType) {
		return InvisibleText.getStaticId("sap.m", mARIATextKeys[sType]);
	};

	return ButtonRenderer;

}, /* bExport= */ true);