/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './ComboBoxTextFieldRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ComboBoxTextFieldRenderer, Renderer) {
		"use strict";

		/**
		 * ComboBoxBase renderer.
		 *
		 * @namespace
		 */
		var ComboBoxBaseRenderer = Renderer.extend(ComboBoxTextFieldRenderer);

		/**
		 * CSS class to be applied to the root element of the control.
		 *
		 * @readonly
		 * @const {string}
		 */
		ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE = "sapMComboBoxBase";

		/**
		 * Add attributes to the input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeInnerAttributes = function(oRm, oControl) {
			oRm.writeAttribute("autocomplete", "off");
			oRm.writeAttribute("autocorrect", "off");
			oRm.writeAttribute("autocapitalize", "off");
		};

		/**
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeAccessibilityState = function(oRm, oControl) {
			ComboBoxTextFieldRenderer.writeAccessibilityState.apply(this, arguments);
			oRm.writeAccessibilityState(oControl, {
				role: "combobox",
				expanded: oControl.isOpen(),
				autocomplete: "both"
			});
		};

		/**
		 * Add classes to the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addOuterClasses = function(oRm, oControl) {
			ComboBoxTextFieldRenderer.addOuterClasses.apply(this, arguments);

			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE;
			oRm.addClass(CSS_CLASS);

			if (!oControl.getEnabled()) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			if (!oControl.getEditable()) {
				oRm.addClass(CSS_CLASS + "Readonly");
			}
		};

		/**
		 * Add CSS classes to the button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addButtonClasses = function(oRm, oControl) {
			ComboBoxTextFieldRenderer.addButtonClasses.apply(this, arguments);
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Arrow");
		};

		return ComboBoxBaseRenderer;
	}, /* bExport= */ true);
