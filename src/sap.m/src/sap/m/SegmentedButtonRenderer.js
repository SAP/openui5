/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleRenderer"],
	function(coreLibrary, InvisibleRenderer) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Segmented renderer.
	 * @namespace
	 */
	var SegmentedButtonRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	SegmentedButtonRenderer.render = function(oRM, oControl){
		var aButtons = oControl.getButtons(),
			aVisibleButtons = aButtons.filter(function(oButton) { return oButton.getVisible(); }),
			iVisibleButtonPos = 0,
			sSelectedButton = oControl.getSelectedButton(),
			oButton,
			sTooltip,
			sButtonWidth,
			sButtonTextDirection;

		if (aVisibleButtons.length) {
			aVisibleButtons[aVisibleButtons.length - 1].addStyleClass("sapMSegBtnLastVisibleButton");
		}

		// Select representation mockup
		if (oControl._bInOverflow) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_select"));
			oRM.write("</div>");
			return;
		}

		// write the HTML into the render manager
		oRM.write("<ul");


		if (SegmentedButtonRenderer._addAllIconsClass(aButtons)) {
			oRM.addClass("sapMSegBIcons");
		}
		oRM.addClass("sapMSegB");
		oRM.writeClasses();
		if (oControl.getWidth() && oControl.getWidth() !== '') {
			oRM.addStyle('width', oControl.getWidth());
		}
		oRM.writeStyles();
		oRM.writeControlData(oControl);
		sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRM.writeAttributeEscaped("title", sTooltip);
		}

		// ARIA
		oRM.writeAccessibilityState(oControl, {
			role : "radiogroup"
		});

		oRM.write(">");

		for (var i = 0; i < aButtons.length; i++) {
			oButton = aButtons[i];

			if (oButton.getVisible()) {
				var sButtonText = oButton.getText(),
					oButtonIcon = oButton.getIcon(),
					sIconAriaLabel = "",
					oImage;

				++iVisibleButtonPos;

				if (oButtonIcon) {
					oImage = oButton._getImage((oButton.getId() + "-img"), oButtonIcon);
					if (oImage instanceof sap.m.Image) {
						oControl._overwriteImageOnload(oImage);
					} else if (!oButton.getTooltip()) { //BCP: 1670076777- Put aria-label only for icon or icon+text
						sIconAriaLabel = oControl._getIconAriaLabel(oImage);
					}
				}

				// instead of the button API we render a li element but with the id of the button
				// only the button properties enabled, width, icon, text, and tooltip are evaluated here
				oRM.write("<li");
				oRM.writeControlData(oButton);
				oRM.writeAttribute("aria-posinset", iVisibleButtonPos);
				oRM.writeAttribute("aria-setsize", aVisibleButtons.length);
				oRM.addClass("sapMSegBBtn");
				if (oButton.aCustomStyleClasses !== undefined && oButton.aCustomStyleClasses instanceof Array) {
					for (var j = 0; j < oButton.aCustomStyleClasses.length; j++) {
						oRM.addClass(oButton.aCustomStyleClasses[j]);
					}
				}
				if (oButton.getEnabled()) {
					oRM.addClass("sapMSegBBtnFocusable");
				} else {
					oRM.addClass("sapMSegBBtnDis");
				}
				if (sSelectedButton === oButton.getId()) {
					oRM.addClass("sapMSegBBtnSel");
				}
				if (oButtonIcon && sButtonText !== '') {
					oRM.addClass("sapMSegBBtnMixed");
				}
				oRM.writeClasses();
				sButtonWidth = oButton.getWidth();
				if (sButtonWidth) {
					oRM.addStyle('width', sButtonWidth);
					oRM.writeStyles();
				}

				sTooltip = oButton.getTooltip_AsString();
				if (sTooltip) {
					oRM.writeAttributeEscaped("title", sTooltip);
				}
				oRM.writeAttribute("tabindex", oButton.getEnabled() ? "0" : "-1");

				sButtonTextDirection = oButton.getTextDirection();
				if (sButtonTextDirection !== TextDirection.Inherit) {
					oRM.writeAttribute("dir", sButtonTextDirection.toLowerCase());
				}

				// ARIA
				oRM.writeAccessibilityState(oButton, {
					role : "radio",
					checked : sSelectedButton === oButton.getId()
				});

				// BCP:1570027826 If button has an icon add ARIA label containing the generic icon name
				if (oImage && sIconAriaLabel !== "") {
					// If there is text inside the button add it in the aria-label
					if (sButtonText !== "") {
						sIconAriaLabel += " " + sButtonText;
					} else {
						// if we have no text for the button set tooltip the name of the Icon
						oRM.writeAttributeEscaped("title", sIconAriaLabel);
					}
					oRM.writeAttributeEscaped("aria-label", sIconAriaLabel);
				}

				oRM.write('>');
				oRM.write("<div");
				oRM.addClass("sapMSegBBtnInner");
				oRM.writeClasses();
				oRM.write('>');

				if (oButtonIcon && oImage) {
					oRM.renderControl(oImage);
				}

				// render text
				if (sButtonText !== '') {
					oRM.writeEscaped(sButtonText, false);
				}
				oRM.write("</div>");
				oRM.write("</li>");
			} else {
				InvisibleRenderer.render(oRM, oButton, "li");
			}
		}
		oRM.write("</ul>");
	};

	SegmentedButtonRenderer._addAllIconsClass = function (aButtons) {
		for (var i = 0; i < aButtons.length; i++) {
			if (!aButtons[i].getIcon()) {
				return false;
			}
		}
		return true;
	};

	return SegmentedButtonRenderer;

}, /* bExport= */ true);
