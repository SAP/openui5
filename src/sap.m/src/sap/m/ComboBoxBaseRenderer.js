/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxTextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/Core'],
	function (ComboBoxTextFieldRenderer, Renderer, Core) {
		"use strict";

		/**
		 * ComboBoxBase renderer.
		 *
		 * @namespace
		 */
		var ComboBoxBaseRenderer = Renderer.extend(ComboBoxTextFieldRenderer);
		ComboBoxBaseRenderer.apiVersion = 2;
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
		 * @returns {object} The accessibility state of the control
		 */
		ComboBoxBaseRenderer.getAccessibilityState = function (oControl) {
			var mAccessibilityState = ComboBoxTextFieldRenderer.getAccessibilityState.call(this, oControl),
				oList = oControl._getList();

			if (oList) {
				mAccessibilityState.controls = oList.getId();
			}
			return mAccessibilityState;
		};

		/**
		 * Add role combobox to the outer div.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeAccAttributes = function(oRm, oControl) {
			ComboBoxTextFieldRenderer.writeAccAttributes.apply(this, arguments);

			if (Core.getConfiguration().getAccessibility()) {
				oRm.attr("aria-expanded", oControl.isOpen());
			}
		};

		/**
		 * Add classes to the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addOuterClasses = function (oRm, oControl) {
			ComboBoxTextFieldRenderer.addOuterClasses.apply(this, arguments);

			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE;
			oRm.class(CSS_CLASS);

			if (!oControl.getEnabled()) {
				oRm.class(CSS_CLASS + "Disabled");
			}

			if (!oControl.getEditable()) {
				oRm.class(CSS_CLASS + "Readonly");
			}
		};

		/**
		 * Add CSS classes to the button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addButtonClasses = function (oRm, oControl) {
			ComboBoxTextFieldRenderer.addButtonClasses.apply(this, arguments);
			oRm.class(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Arrow");
		};

		return ComboBoxBaseRenderer;
	}, /* bExport= */ true);