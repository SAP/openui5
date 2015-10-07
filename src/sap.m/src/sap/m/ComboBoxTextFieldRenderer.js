/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputBaseRenderer, Renderer) {
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
		};

		/**
		 * Retrieves the ARIA role for the control.
		 * To be overwritten by subclasses.
		 *
		 */
		ComboBoxTextFieldRenderer.getAriaRole = function() {
			return "combobox";
		};

		/**
		 * Retrieves the accessibility state of the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
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
		};

		/**
		 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addValueStateClasses = function(oRm, oControl) {
			InputBaseRenderer.addValueStateClasses.apply(this, arguments);
			var CSS_CLASS = ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD;
			oRm.addClass(CSS_CLASS + "State");
			oRm.addClass(CSS_CLASS + oControl.getValueState());
		};

		/**
		 * Renders the content, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.writeInnerContent = function(oRm, oControl) {
			this.renderButton(oRm, oControl);
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
				sButtonLabelId = sId + "-buttonlabel",
				oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			oRm.write('<button tabindex="-1"');
			oRm.writeAttribute("id", sButtonId);
			oRm.writeAttribute("aria-labelledby", sButtonLabelId);
			this.addButtonClasses(oRm, oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<label");
			oRm.writeAttribute("id", sButtonLabelId);
			oRm.addClass("sapUiInvisibleText");
			oRm.addClass(ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD + "ButtonLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write(oRb.getText("COMBOBOX_BUTTON"));
			oRm.write("</label>");
			oRm.write("</button>");
		};

		/**
		 * Add CSS classes to the button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addButtonClasses = function(oRm, oControl) {
			oRm.addClass(ComboBoxTextFieldRenderer.CSS_CLASS_COMBOBOXTEXTFIELD + "Arrow");
		};

		return ComboBoxTextFieldRenderer;
	}, true);