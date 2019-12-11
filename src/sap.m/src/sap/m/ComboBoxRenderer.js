/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer', 'sap/ui/core/Renderer'],
	function(ComboBoxBaseRenderer, Renderer) {
		"use strict";

		/**
		 * ComboBox renderer.
		 *
		 * @namespace
		 */
		var ComboBoxRenderer = Renderer.extend(ComboBoxBaseRenderer);
		    ComboBoxRenderer.apiVersion = 2;
		/**
		 * CSS class to be applied to the root element of the ComboBox.
		 *
		 * @readonly
		 * @const {string}
		 */
		ComboBoxRenderer.CSS_CLASS_COMBOBOX = "sapMComboBox";

		/**
		 * Add classes to the ComboBox.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addOuterClasses = function(oRm, oControl) {
			ComboBoxBaseRenderer.addOuterClasses.apply(this, arguments);
			oRm.class(ComboBoxRenderer.CSS_CLASS_COMBOBOX);
		};

		/**
		 * Add inner classes to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addInnerClasses = function(oRm, oControl) {
			ComboBoxBaseRenderer.addInnerClasses.apply(this, arguments);
			oRm.class(ComboBoxRenderer.CSS_CLASS_COMBOBOX + "Inner");
		};

		/**
		 * Add CSS classes to the combo box arrow button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addButtonClasses = function(oRm, oControl) {
			ComboBoxBaseRenderer.addButtonClasses.apply(this, arguments);
			oRm.class(ComboBoxRenderer.CSS_CLASS_COMBOBOX + "Arrow");
		};

		ComboBoxRenderer.addPlaceholderClasses = function(oRm, oControl) {
			ComboBoxBaseRenderer.addPlaceholderClasses.apply(this, arguments);
			oRm.class(ComboBoxRenderer.CSS_CLASS_COMBOBOX + "Placeholder");
		};

		return ComboBoxRenderer;

	}, /* bExport= */ true);
