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
		ComboBoxTextFieldRenderer.apiVersion = 2;
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
			oRm.attr("autocomplete", "off");
			oRm.attr("autocorrect", "off");
			oRm.attr("autocapitalize", "off");
			oRm.attr("type", "text");
		};

		/**
		 * Add role combobox to the outer div.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.writeAccAttributes = function(oRm, oControl) {
			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				oRm.attr("aria-haspopup", "listbox");
				oRm.attr("aria-autocomplete", "inline");
				oRm.attr("role", "combobox");
			}
		};

		/**
		 * Retrieves the ARIA role for the control.
		 * To be overwritten by subclasses.
		 *
		 */
		ComboBoxTextFieldRenderer.getAriaRole = function() {};


		/**
		 * Returns the inner aria describedby ids for the accessibility.
		 *
		 * @param {sap.ui.core.Control} oControl an object representation of the control.
		 * @returns {String|undefined}
		 */
		ComboBoxTextFieldRenderer.getAriaDescribedBy = function(oControl) {
			var sAriaDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);
			if (Device.browser.msie) {
				return (sAriaDescribedBy || "") + " " + oControl.oInvisibleText.getId();
			}
			return sAriaDescribedBy;
		};

		/**
		 * Add extra styles for input container.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxTextFieldRenderer.addOuterStyles = function(oRm, oControl) {
			oRm.style("max-width", oControl.getMaxWidth());
		};

		return ComboBoxTextFieldRenderer;
	}, true);