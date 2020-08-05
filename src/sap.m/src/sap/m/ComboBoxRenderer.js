/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer', 'sap/ui/core/Renderer', 'sap/ui/Device'
],
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

		/**
		 * Adds attributes to the input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.writeInnerAttributes = function(oRm, oControl) {
			var oSelectedItem = oControl.getSelectedItem(),
				oSelectedListItem = oSelectedItem && oControl.getListItem(oSelectedItem),
				bOpen = oControl.isOpen(),
				bFormattedTextHeaderFocused = oControl.getProperty("formattedTextFocused");

			ComboBoxBaseRenderer.writeInnerAttributes.apply(this, arguments);
			oRm.attr("aria-expanded", bOpen);

			// Aria-activedescendant attributed must be added only if there is selected item
			// and the visual focus is on it or the visual focus is on the formatted text value state header
			if (bFormattedTextHeaderFocused) {
				oRm.attr("aria-activedescendant", oControl._getFormattedValueStateText().getId());
			} else if (bOpen && oSelectedListItem && oSelectedListItem.hasStyleClass("sapMLIBFocused") && oControl.getFocusDomRef() === document.activeElement) {
				oRm.attr("aria-activedescendant", oSelectedListItem.getId());
			}
		};

		return ComboBoxRenderer;

	}, /* bExport= */ true);
