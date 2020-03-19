/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/ui/core/InvisibleText"],

	function(library, InvisibleText) {
		"use strict";

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		/**
		 * <code>SplitButton</code> renderer.
		 * @namespace
		 */
		var SplitButtonRenderer = {
			apiVersion: 2
		};

		SplitButtonRenderer.CSS_CLASS = "sapMSB";

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
		SplitButtonRenderer.render = function(oRm, oButton) {
			var sWidth = oButton.getWidth(),
				sType = oButton.getType(),
				bEnabled = oButton.getEnabled(),
				sTitleAttribute = oButton.getTitleAttributeValue(),
				sTooltipId;

			//write root DOM element
			oRm.openStart("div", oButton)
				.class(SplitButtonRenderer.CSS_CLASS);

			if (oButton.getIcon()) {
				oRm.class(SplitButtonRenderer.CSS_CLASS + "HasIcon");
			}
			if (sType === ButtonType.Accept
				|| sType === ButtonType.Reject
				|| sType === ButtonType.Emphasized
				|| sType === ButtonType.Transparent
				|| sType === ButtonType.Attention) {
				oRm.class(SplitButtonRenderer.CSS_CLASS + sType);
			}

			this.writeAriaAttributes(oRm, oButton);
			oRm.attr("tabindex", bEnabled ? "0" : "-1");

			// add tooltip if available
			if (sTitleAttribute) {
				oRm.attr("title", sTitleAttribute);
			}

			// set user defined width
			if (sWidth != "" || sWidth.toLowerCase() === "auto") {
				oRm.style("width", sWidth);
			}

			oRm.openEnd();

			oRm.openStart("div")
				.class("sapMSBInner");

			if (!bEnabled) {
				oRm.class("sapMSBInnerDisabled");
			}

			oRm.openEnd();

			oRm.renderControl(oButton._getTextButton());
			oRm.renderControl(oButton._getArrowButton());

			oRm.close("div");

			if (sTitleAttribute) {
				sTooltipId = oButton.getId() + "-tooltip";
				oRm.openStart("span");
				oRm.attr("id", sTooltipId);
				oRm.class("sapUiInvisibleText");
				oRm.openEnd();
				oRm.text(sTitleAttribute);
				oRm.close("span");
			}

			oRm.close("div");
		};

		SplitButtonRenderer.writeAriaAttributes = function(oRm, oButton) {
			var	mAccProps = {};

			this.writeAriaRole(oButton, mAccProps);
			this.writeAriaLabelledBy(oButton, mAccProps);

			oRm.accessibilityState(oButton, mAccProps);
		};

		SplitButtonRenderer.writeAriaRole = function(oButton, mAccProperties) {
			mAccProperties["role"] = "group";
		};

		SplitButtonRenderer.writeAriaLabelledBy = function(oButton, mAccProperties) {
			var sAriaLabelledByValue = "",
				oButtonTypeAriaLabelId = oButton.getButtonTypeAriaLabelId(),
				sTitleAttribute = oButton.getTitleAttributeValue(),
				sTooltipId;

			if (oButton.getText()) {
				sAriaLabelledByValue += oButton._getTextButton().getId() + "-content";
				sAriaLabelledByValue += " ";
			}

			if (oButtonTypeAriaLabelId) {
				sAriaLabelledByValue += oButtonTypeAriaLabelId;
				sAriaLabelledByValue += " ";
			}

			if (sTitleAttribute) {
				sTooltipId = oButton.getId() + "-tooltip";
				sAriaLabelledByValue += sTooltipId + " ";
			}

			sAriaLabelledByValue += InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_DESCRIPTION") + " ";

			sAriaLabelledByValue += InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_KEYBOARD_HINT");

			mAccProperties["labelledby"] = {value: sAriaLabelledByValue, append: true };
		};

		return SplitButtonRenderer;
	}, /* bExport= */ true);
