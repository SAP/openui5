/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],

	function(jQuery) {
	"use strict";

	/**
	 * Button renderer.
	 * @namespace
	 */
	var ButtonRenderer = {};

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
		var bIE_Edge = sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.edge;
		// render bdi tag only if the browser is different from IE and Edge since it is not supported there
		var bRenderBDI = (sTextDir === sap.ui.core.TextDirection.Inherit) && !bIE_Edge;

		// get icon from icon pool
		var sBackURI = sap.ui.core.IconPool.getIconURI("nav-back");

		// start button tag
		oRm.write("<button");
		oRm.writeControlData(oButton);
		oRm.addClass("sapMBtnBase");

		// button container style class
		if (!oButton._isUnstyled()) {
			oRm.addClass("sapMBtn");

			// extend  minimum button size if icon is set without text for button types back and up
			if ((sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) && oButton.getIcon() && !sText) {
				oRm.addClass("sapMBtnBack");
			}
		}

		//ARIA attributes
		var mAccProps = {};
		var sTextId = "";

		switch (sType) {
		case sap.m.ButtonType.Accept:
			sTextId = sap.m.Button._oStaticAcceptText.getId();
			break;
		case sap.m.ButtonType.Reject:
			sTextId = sap.m.Button._oStaticRejectText.getId();
			break;
		case sap.m.ButtonType.Emphasized:
			sTextId = sap.m.Button._oStaticEmphasizedText.getId();
			break;
		default: // No need to do anything for other button types
			break;
		}
		if (sTextId) {
			mAccProps["describedby"] = {value: sTextId, append: true};
		}

		if (oButton.getAriaLabelledBy() && oButton.getAriaLabelledBy().length > 0) {
			mAccProps["labelledby"] = {value: oButton.getId(), append: true };
		}

		//descendants (e.g. ToggleButton) callback
		if (this.renderAccessibilityAttributes) {
			this.renderAccessibilityAttributes(oRm, oButton, mAccProps);
		}
		oRm.writeAccessibilityState(oButton, mAccProps);

		// check if the button is disabled
		if (!bEnabled) {
			oRm.writeAttribute("disabled", "disabled");
			if (!oButton._isUnstyled()) {
				oRm.addClass("sapMBtnDisabled");
			}
		} else {
			switch (sType) {
			case sap.m.ButtonType.Accept:
			case sap.m.ButtonType.Reject:
			case sap.m.ButtonType.Emphasized:
				oRm.addClass("sapMBtnInverted");
				break;
			default: // No need to do anything for other button types
				break;
			}
		}

		// add tooltip if available
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.writeClasses();

		// set user defined width
		if (sWidth != "" || sWidth.toLowerCase() === "auto") {
			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
		}
		renderTabIndex(oButton, oRm);

		// close button tag
		oRm.write(">");

		// start inner button tag
		oRm.write("<span");
		oRm.writeAttribute("id", oButton.getId() + "-inner");

		// button style class
		if (!oButton._isUnstyled()) {
			oRm.addClass("sapMBtnInner");
		}

		// check if button is hoverable
		if (oButton._isHoverable()) {
			oRm.addClass("sapMBtnHoverable");
		}

		// check if button is focusable (not disabled)
		if (bEnabled) {
			oRm.addClass("sapMFocusable");
			// special focus handling for IE
			if (bIE_Edge) {
				oRm.addClass("sapMIE");
			}
		}

		if (!oButton._isUnstyled()) {
			if (sText) {
				oRm.addClass("sapMBtnText");
			}
			if (sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) {
				oRm.addClass("sapMBtnBack");
			}
			if (oButton.getIcon()) {
				if (oButton.getIconFirst()) {
					oRm.addClass("sapMBtnIconFirst");
				} else {
					oRm.addClass("sapMBtnIconLast");
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
			oRm.addClass("sapMBtn" + jQuery.sap.encodeHTML(sType));
		}

		// add all classes to inner button tag
		oRm.writeClasses();

		//apply on the inner level as well as not applying it will allow for focusing the button after a mouse click
		renderTabIndex(oButton, oRm);

		// close inner button tag
		oRm.write(">");

		// set image for internal image control (back)
		if (sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) {
			this.writeInternalIconPoolHtml(oRm, oButton, sBackURI);
		}

		// write icon
		if (oButton.getIcon()) {
			this.writeImgHtml(oRm, oButton);
		}

		// write button text
		if (sText) {
			oRm.write("<span");
			oRm.addClass("sapMBtnContent");
			// check if textDirection property is not set to default "Inherit" and add "dir" attribute
			if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
				oRm.writeAttribute("dir", sTextDir.toLowerCase());
			}
			oRm.writeClasses();
			oRm.writeAttribute("id", oButton.getId() + "-content");
			oRm.write(">");

			if (bRenderBDI) {
				oRm.write("<bdi>");
			}
			oRm.writeEscaped(sText);
			if (bRenderBDI) {
				oRm.write("</bdi>");
			}
			oRm.write("</span>");
		}

		// special handling for IE focus outline
		if (bIE_Edge && bEnabled) {
			oRm.write('<span class="sapMBtnFocusDiv"></span>');
		}

		// end inner button tag
		oRm.write("</span>");

		// end button tag
		oRm.write("</button>");
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
		oRm.renderControl(oButton._getImage((oButton.getId() + "-img"), oButton.getIcon(), oButton.getActiveIcon(), oButton.getIconDensityAware()));
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
	 * @param oButton
	 * @param oRm
	 */
	function renderTabIndex(oButton, oRm){
		if (oButton._bExcludeFromTabChain) {
			oRm.writeAttribute("tabindex", -1);
		}
	}

	return ButtonRenderer;

}, /* bExport= */ true);
