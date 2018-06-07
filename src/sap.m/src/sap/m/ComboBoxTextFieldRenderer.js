/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/LabelEnablement'],
	function(jQuery, InputBaseRenderer, Renderer, LabelEnablement) {
		"use strict";

		/**
		 * ComboBoxTextFiel renderer.
		 *
		 * @namespace
		 */
		var ComboBoxTextFieldRenderer = Renderer.extend(InputBaseRenderer);

		/**
		 * CSS class to be applied to the root element of the control.
		 *
		 * @readonly
		 * @const {string}
		 */
		ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD = "sapMComboBoxTextField";

		/**
		 * Add attributes to the input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.writeInnerAttributes = function(oRm, oControl) {
			oRm.writeAttribute("autocomplete", "off");
			oRm.writeAttribute("autocorrect", "off");
			oRm.writeAttribute("autocapitalize", "off");
			oRm.writeAttribute("type", "text");
		};

		/**
		 * Add role combobox to the outer div.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.writeOuterAttributes = function(oRm, oControl) {
			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				oRm.writeAttribute("role", "combobox");
			}
		};

		/**
		 * Retrieves the ARIA role for the control.
		 * To be overwritten by subclasses.
		 *
		 */
		ComboBoxTextFieldRenderer.getAriaRole = function() {};

		/**
		 * Retrieves the accessibility state of the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 * @returns {object} The accessibility state of the control
		 */
		ComboBoxTextFieldRenderer.getAccessibilityState = function(oControl) {
			var mAccessibilityState = InputBaseRenderer.getAccessibilityState.call(this, oControl);
			mAccessibilityState.autocomplete = "both";
			return mAccessibilityState;
		};

		/**
		 * Add extra styles for input container.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addOuterStyles = function(oRm, oControl) {
			oRm.addStyle("max-width", oControl.getMaxWidth());
		};

		/**
		 * Add classes to the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addOuterClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD;

			oRm.addClass(CSS_CLASS);

			if (!oControl.getEnabled()) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			if (!oControl.getEditable()) {
				oRm.addClass(CSS_CLASS + "Readonly");
			}
		};

		/**
		 * Add padding class to input container.
		 * May be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addPaddingClass = jQuery.noop;

		/**
		 * Add inner classes to the control's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addInnerClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD;
			oRm.addClass(CSS_CLASS + "Inner");

			if (!oControl.getEditable()) {
				oRm.addClass(CSS_CLASS + "InnerReadonly");
			}

			if (oControl.getShowButton()) {
				oRm.addClass(CSS_CLASS + "InnerWidthExtraPadding");
			}
		};

		/**
		 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addValueStateClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD;
			oRm.addClass(CSS_CLASS + "State");
			oRm.addClass(CSS_CLASS + oControl.getValueState());
		};

		/**
		 * Write the decorations of the input.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.writeDecorations = function(oRm, oControl) {
			if (oControl.getShowButton()) {
				this.renderButton(oRm, oControl);
			}
		};

		/**
		 * Renders the control button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.renderButton = function(oRm, oControl) {
			var sId = oControl.getId(),
				sButtonId = sId + "-arrow",
				bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility(),
				oArrowDownInvisibleLabel = oControl.getAggregation("_buttonLabelText"),
				sArrowLabel,
				sReferenceLabelsToAdd,
				sLabelsToWrite;

			oRm.write('<span tabindex="-1" ');
			oRm.writeAttribute("id", sButtonId);

			if (bAccessibilityOn) {
				oRm.writeAttribute("role", "button");
				sArrowLabel = oArrowDownInvisibleLabel.getId();
				sReferenceLabelsToAdd = LabelEnablement.getReferencingLabels(oControl).join(" ");
				sLabelsToWrite = sArrowLabel;
				if (sReferenceLabelsToAdd) {
					sLabelsToWrite = [sArrowLabel, sReferenceLabelsToAdd].join(" ");
				}

				oRm.writeAttribute("aria-labelledby", sLabelsToWrite);
			}

			this.addButtonClasses(oRm, oControl);
			oRm.writeClasses();
			oRm.write(">");
			bAccessibilityOn && oRm.renderControl(oArrowDownInvisibleLabel);
			oRm.write("</span>");
		};

		/**
		 * Add CSS classes to the button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addButtonClasses = function(oRm, oControl) {
			var CLASS = ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD + "Arrow";
			oRm.addClass(CLASS);

			if (!oControl.getEnabled()) {
				oRm.addClass(CLASS + "Disabled");
			}
		};

		return ComboBoxTextFieldRenderer;
	}, true);