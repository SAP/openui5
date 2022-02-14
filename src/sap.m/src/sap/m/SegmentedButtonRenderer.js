/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleRenderer", "sap/ui/core/InvisibleText"],
	function(coreLibrary, InvisibleRenderer, InvisibleText) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

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
	 * @param {sap.m.SegmentedButton} oControl an object representation of the control that should be rendered
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
		oRM.style('width', oControl.getWidth());

		sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		// Root's ARIA
		oRM.accessibilityState(oControl, {
			role : "listbox",
			multiselectable: true,	// Still, only one item at a time can be selected. Set to 'true', as JAWS won't announce selection and root's descriptions otherwise.
			roledescription: oResourceBundle.getText("SEGMENTEDBUTTON_NAME"),
			describedby: { value: InvisibleText.getStaticId("sap.m", "SEGMENTEDBUTTON_SELECTION"), append: true }
		});

		oRM.openEnd();

		for (var i = 0; i < aButtons.length; i++) {
			oButton = aButtons[i];

			if (oButton.getVisible()) {
				var sButtonText = oButton.getText(),
					oButtonIcon = oButton.getIcon(),
					sButtonTooltip = oButton.getTooltip_AsString(),
					sIconAriaLabel = "",
					oImage;

				++iVisibleButtonPos;
				if (oButtonIcon) {
					oImage = oButton._getImage((oButton.getId() + "-img"), oButtonIcon);

					if (oImage && oImage.isA("sap.m.Image")) {
						oControl._overwriteImageOnload(oImage);
					}
				}

				// instead of the button API we render a li element but with the id of the button
				// only the button properties enabled, width, icon, text, and tooltip are evaluated here
				oRM.openStart("li", oButton);
				oRM.class("sapMSegBBtn");

				if (oButton.getId() === aVisibleButtons[aVisibleButtons.length - 1].getId()) {
					oRM.class("sapMSegBtnLastVisibleButton");
				}
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
				oRM.style('width', sButtonWidth);

				oRM.attr("tabindex", oButton.getEnabled() ? "0" : "-1");

				sButtonTextDirection = oButton.getTextDirection();
				if (sButtonTextDirection !== TextDirection.Inherit) {
					oRM.attr("dir", sButtonTextDirection.toLowerCase());
				}

				if (oImage && !sButtonText) {
					sIconAriaLabel = oControl._getIconAriaLabel(oImage);
					sButtonTooltip = sButtonTooltip || sIconAriaLabel; // Prefer user-provided tooltips, as they bring better semantics
				}

				if (sButtonTooltip) {
					oRM.attr("title", sButtonTooltip);
				}

				// Inner buttons' ARIA
				oRM.accessibilityState(oButton, {
					role : "option",
					roledescription: oResourceBundle.getText("SEGMENTEDBUTTON_BUTTONS_NAME"),
					label: sButtonText ? "" : sButtonTooltip,
					posinset: iVisibleButtonPos,
					setsize: aVisibleButtons.length,
					selected: sSelectedButton === oButton.getId()
				});

				oRM.openEnd();

				oRM.openStart("div");
				oRM.class("sapMSegBBtnInnerWrapper");
				oRM.openEnd();

				oRM.openStart("div");
				oRM.class("sapMSegBBtnInner");
				oRM.openEnd();

				if (oButtonIcon && oImage) {
					oRM.renderControl(oImage);
				}

				// render text
				if (sButtonText !== '') {
					oRM.text(sButtonText);
				}
				oRM.close("div");
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
