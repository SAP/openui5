/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],

	function(jQuery) {
		"use strict";

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
				sTitleAttribute = oButton.getTitleAttributeValue();

			//write root DOM element
			oRm.write("<div");
			oRm.writeControlData(oButton);

			//classes
			oRm.addClass(SplitButtonRenderer.CSS_CLASS);
			if (oButton.getIcon()) {
				oRm.addClass(SplitButtonRenderer.CSS_CLASS + "HasIcon");
			}
			if (sType === sap.m.ButtonType.Accept
				|| sType === sap.m.ButtonType.Reject
				|| sType === sap.m.ButtonType.Emphasized
				|| sType === sap.m.ButtonType.Transparent) {
				oRm.addClass(SplitButtonRenderer.CSS_CLASS + sType);
			}

			oRm.writeClasses();

			this.writeAriaAttributes(oRm, oButton);
			oRm.writeAttribute("tabindex", "0");

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
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oButton._getTextButton());
			oRm.renderControl(oButton._getArrowButton());

			oRm.write("</div>");
			oRm.write("</div>");
		};

		SplitButtonRenderer.writeAriaAttributes = function(oRm, oButton) {
			var	mAccProps = {};

			this.writeAriaRole(oButton, mAccProps);
			this.writeAriaLabelledBy(oButton, mAccProps);
			this.writeAriaDescribedBy(oButton, mAccProps);

			oRm.writeAccessibilityState(oButton, mAccProps);
		};

		SplitButtonRenderer.writeAriaRole = function(oButton, mAccProperties) {
			mAccProperties["role"] = "group";
		};

		SplitButtonRenderer.writeAriaLabelledBy = function(oButton, mAccProperties) {
			var sAriaLabelledByValue = "",
				sTitleAttribute = oButton.getTitleAttributeValue();

			if (sTitleAttribute) {
				sAriaLabelledByValue += oButton.getTooltipInfoLabel(sTitleAttribute).getId();
				sAriaLabelledByValue += " ";
			}

			if (oButton.getText()) {
				sAriaLabelledByValue += oButton._getTextButton().getId() + "-content";
				sAriaLabelledByValue += " ";
			}

			sAriaLabelledByValue += oButton.getSplitButtonAriaLabel().getId();

			mAccProperties["labelledby"] = {value: sAriaLabelledByValue, append: true };
		};

		SplitButtonRenderer.writeAriaDescribedBy = function(oButton, mAccProperties) {
			var sAriaDescribedByValue = "",
				oButtonTypeAriaLabel = oButton.getButtonTypeAriaLabel();
			if (oButtonTypeAriaLabel) {
				sAriaDescribedByValue += oButtonTypeAriaLabel.getId();
				sAriaDescribedByValue += " ";
			}
			sAriaDescribedByValue += oButton.getKeyboardDescriptionAriaLabel().getId();

			mAccProperties["describedby"] = {value: sAriaDescribedByValue, append: true };
		};

		return SplitButtonRenderer;

	}, /* bExport= */ true);
