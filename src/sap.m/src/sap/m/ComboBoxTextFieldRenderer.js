/*!
 * ${copyright}
 */
sap.ui.define([
	'./InputBaseRenderer',
	'sap/ui/core/Renderer',
	'sap/ui/core/LabelEnablement',
	'sap/ui/Device'
],
	function(InputBaseRenderer, Renderer, LabelEnablement, Device) {
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
			if (Device.browser.internet_explorer) {
				mAccessibilityState.describedby = oControl.oInvisibleText.getId();
			}
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

		return ComboBoxTextFieldRenderer;
	}, true);