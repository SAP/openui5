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
		var SplitButtonRenderer = {};

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
				sTitleAttribute = oButton.getTitleAttributeValue();

			//write root DOM element
			oRm.write("<div");
			oRm.writeControlData(oButton);

			//classes
			oRm.addClass(SplitButtonRenderer.CSS_CLASS);
			if (oButton.getIcon()) {
				oRm.addClass(SplitButtonRenderer.CSS_CLASS + "HasIcon");
			}
			if (sType === ButtonType.Accept
				|| sType === ButtonType.Reject
				|| sType === ButtonType.Emphasized
				|| sType === ButtonType.Transparent) {
				oRm.addClass(SplitButtonRenderer.CSS_CLASS + sType);
			}

			oRm.writeClasses();

			this.writeAriaAttributes(oRm, oButton);
			oRm.writeAttribute("tabindex", bEnabled ? "0" : "-1");

			// add tooltip if available
			if (sTitleAttribute) {
				oRm.writeAttributeEscaped("title", sTitleAttribute);
			}

			// set user defined width
			if (sWidth != "" || sWidth.toLowerCase() === "auto") {
				oRm.addStyle("width", sWidth);
				oRm.writeStyles();
			}

			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapMSBInner");

			if (!bEnabled) {
				oRm.addClass("sapMSBInnerDisabled");
			}

			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oButton._getTextButton());
			oRm.renderControl(oButton._getArrowButton());

			oRm.write("</div>");

			if (sTitleAttribute) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oButton.getId() + "-tooltip");
				oRm.addClass("sapUiInvisibleText");
				oRm.writeClasses();
				oRm.write(">");
				oRm.text(sTitleAttribute);
				oRm.write("</span>");
			}

			oRm.write("</div>");
		};

		SplitButtonRenderer.writeAriaAttributes = function(oRm, oButton) {
			var	mAccProps = {};

			this.writeAriaRole(oButton, mAccProps);
			this.writeAriaLabelledBy(oButton, mAccProps);

			oRm.writeAccessibilityState(oButton, mAccProps);
		};

		SplitButtonRenderer.writeAriaRole = function(oButton, mAccProperties) {
			mAccProperties["role"] = "group";
		};

		SplitButtonRenderer.writeAriaLabelledBy = function(oButton, mAccProperties) {
			var sAriaLabelledByValue = "",
				oButtonTypeAriaLabelId = oButton.getButtonTypeAriaLabelId(),
				sTitleAttribute = oButton.getTitleAttributeValue();

			if (oButton.getText()) {
				sAriaLabelledByValue += oButton._getTextButton().getId() + "-content";
				sAriaLabelledByValue += " ";
			}

			if (oButtonTypeAriaLabelId) {
				sAriaLabelledByValue += oButtonTypeAriaLabelId;
				sAriaLabelledByValue += " ";
			}

			if (sTitleAttribute) {
				sAriaLabelledByValue += oButton.getId() + "-tooltip ";
			}

			sAriaLabelledByValue += InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_DESCRIPTION");

			sAriaLabelledByValue += " " + InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_KEYBOARD_HINT");

			mAccProperties["labelledby"] = {value: sAriaLabelledByValue, append: true };
		};

		return SplitButtonRenderer;
	}, /* bExport= */ true);
