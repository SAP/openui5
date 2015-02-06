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
		var sTooltip = oButton.getTooltip_AsString();
		var sTextDir = oButton.getTextDirection();

		// get icon from icon pool
		var sBackURI = sap.ui.core.IconPool.getIconURI("nav-back");

		// start button tag
		oRm.write("<button type=\"button\"");
		oRm.writeControlData(oButton);

		// button container style class
		if (!oButton._isUnstyled()) {
			oRm.addClass("sapMBtn");

			// extend  minimum button size if icon is set without text for button types back and up
			if ((sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) && oButton.getIcon() && !oButton.getText()) {
				oRm.addClass("sapMBtnBack");
			}
		}

		//ARIA attributes
		oRm.writeAccessibilityState(oButton, {
			disabled: !oButton.getEnabled()
		});

		//descendants (e.g. ToggleButton) callback
		if (this.renderAccessibilityAttributes) {
			this.renderAccessibilityAttributes(oRm, oButton);
		}

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

		// close button tag
		oRm.write(">");

		// start inner button tag
		oRm.write("<div");
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
		}

		//get render attributes of depended buttons (e.g. ToggleButton)
		if (this.renderButtonAttributes) {
			this.renderButtonAttributes(oRm, oButton);
		}

		// set padding depending on icons left or right or none
		if (!oButton._isUnstyled()) {
			if (!oButton.getIcon()) {
				if (sType != sap.m.ButtonType.Back && sType != sap.m.ButtonType.Up) {
					oRm.addClass("sapMBtnPaddingLeft");
				}
				if (oButton.getText()) {
					oRm.addClass("sapMBtnPaddingRight");
				}
			} else {
				if (oButton.getIcon() && oButton.getText() && oButton.getIconFirst()) {
					oRm.addClass("sapMBtnPaddingRight");
				}
				if (oButton.getIcon() && oButton.getText() && !oButton.getIconFirst()) {
					if (sType != sap.m.ButtonType.Back && sType != sap.m.ButtonType.Up) {
						oRm.addClass("sapMBtnPaddingLeft");
					}
				}
			}
		}

		// set button specific styles
		if (!oButton._isUnstyled() && sType !== "") {
			// set button specific styles
			oRm.addClass("sapMBtn" + jQuery.sap.escapeHTML(sType));
		}

		// add all classes to inner button tag
		oRm.writeClasses();

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
		if (oButton.getText()) {
			oRm.write("<span");
			oRm.addClass("sapMBtnContent");
			// check if textDirection property is not set to default "Inherit" and add "dir" attribute
			if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
				oRm.writeAttribute("dir", sTextDir.toLowerCase());
			}
			// Check and add padding between icon and text
			if (oButton.getIcon()) {
				if (oButton.getIconFirst()) {
					if (sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) {
						oRm.addClass("sapMBtnBackContentRight");
					} else {
						oRm.addClass("sapMBtnContentRight");
					}
				} else {
					if (sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) {
						oRm.addClass("sapMBtnContentRight");
					}
					oRm.addClass("sapMBtnContentLeft");
				}
			} else if (sType === sap.m.ButtonType.Back || sType === sap.m.ButtonType.Up) {
				oRm.addClass("sapMBtnContentRight");
			}
			oRm.writeClasses();
			oRm.writeAttribute("id", oButton.getId() + "-content");
			oRm.write(">");
			oRm.writeEscaped(oButton.getText());
			oRm.write("</span>");
		}

		// end inner button tag
		oRm.write("</div>");

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

	return ButtonRenderer;

}, /* bExport= */ true);
