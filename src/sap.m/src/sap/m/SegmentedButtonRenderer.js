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
		apiVersion: 2
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
			oRM.openStart("div", oControl);
			oRM.openEnd();
			oRM.renderControl(oControl.getAggregation("_select"));
			oRM.close("div");
			return;
		}

		// write the HTML into the render manager
		oRM.openStart("ul", oControl);

		if (SegmentedButtonRenderer._addAllIconsClass(aButtons)) {
			oRM.class("sapMSegBIcons");
		}
		oRM.class("sapMSegB");
		if (oControl.getWidth() && oControl.getWidth() !== '') {
			oRM.style('width', oControl.getWidth());
		}
		sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		// ARIA
		oRM.accessibilityState(oControl, {
			role : "radiogroup"
		});

		oRM.openEnd();

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
				oRM.openStart("li", oButton);
				oRM.attr("aria-posinset", iVisibleButtonPos);
				oRM.attr("aria-setsize", aVisibleButtons.length);
				oRM.class("sapMSegBBtn");
				if (oButton.aCustomStyleClasses !== undefined && oButton.aCustomStyleClasses instanceof Array) {
					for (var j = 0; j < oButton.aCustomStyleClasses.length; j++) {
						oRM.class(oButton.aCustomStyleClasses[j]);
					}
				}
				if (oButton.getEnabled()) {
					oRM.class("sapMSegBBtnFocusable");
				} else {
					oRM.class("sapMSegBBtnDis");
				}
				if (sSelectedButton === oButton.getId()) {
					oRM.class("sapMSegBBtnSel");
				}
				if (oButtonIcon && sButtonText !== '') {
					oRM.class("sapMSegBBtnMixed");
				}
				sButtonWidth = oButton.getWidth();
				if (sButtonWidth) {
					oRM.style('width', sButtonWidth);
				}

				sTooltip = oButton.getTooltip_AsString();
				if (sTooltip) {
					oRM.attr("title", sTooltip);
				}
				oRM.attr("tabindex", oButton.getEnabled() ? "0" : "-1");

				sButtonTextDirection = oButton.getTextDirection();
				if (sButtonTextDirection !== TextDirection.Inherit) {
					oRM.attr("dir", sButtonTextDirection.toLowerCase());
				}

				// ARIA
				oRM.accessibilityState(oButton, {
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
						oRM.attr("title", sIconAriaLabel);
					}
					oRM.attr("aria-label", sIconAriaLabel);
				}

				oRM.openEnd();
				oRM.openStart("div");
				oRM.class("sapMSegBBtnInner");
				oRM.openEnd();

				if (oButtonIcon && oImage) {
					oRM.renderControl(oImage);
				}

				// render text
				if (sButtonText !== '') {
					oRM.text(sButtonText, false);
				}
				oRM.close("div");
				oRM.close("li");
			} else {
				InvisibleRenderer.render(oRM, oButton, "li");
			}
		}
		oRM.close("ul");
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
