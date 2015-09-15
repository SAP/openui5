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
		 * Retrieves the accessibility state of the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.getAccessibilityState = function(oControl) {
			var mAccessibilityState = ComboBoxTextFieldRenderer.getAccessibilityState.call(this, oControl);
			mAccessibilityState.expanded = oControl.isOpen();
			return mAccessibilityState;
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