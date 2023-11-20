/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer', 'sap/ui/core/Renderer', 'sap/m/inputUtils/ListHelpers'
],
	function(ComboBoxBaseRenderer, Renderer, ListHelpers) {
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
		 * @param {sap.m.ComboBox} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addOuterClasses = function(oRm, oControl) {
			ComboBoxBaseRenderer.addOuterClasses.apply(this, arguments);
			oRm.class(ComboBoxRenderer.CSS_CLASS_COMBOBOX);
		};

		/**
		 * Add inner classes to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.ComboBox} oControl An object representation of the control that should be rendered.
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
		 * @param {sap.m.ComboBox} oControl An object representation of the control that should be rendered.
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
		 * @param {sap.m.ComboBox} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.writeInnerAttributes = function(oRm, oControl) {
			var bOpen = oControl.isOpen(), bIsGroupHeader, oSelectedItem, oListItem;
			var oSuggestionPopover = oControl._getSuggestionsPopover();

			ComboBoxBaseRenderer.writeInnerAttributes.apply(this, arguments);
			oRm.attr("aria-expanded", bOpen);

			if (!oSuggestionPopover) {
				return;
			}

			var oFocusedItem = oSuggestionPopover.getFocusedListItem();
			var bValueStateFocused = oSuggestionPopover.getValueStateActiveState();

			// If the picker is not opened, no active descendant should be set
			// If there is no focused element in the picker, no active descendant should be set
			if (!bOpen || (!oFocusedItem && !bValueStateFocused)) {
				return;
			}

			// If the value state is focused, set the active descendant in order to read out the value state header
			if (bValueStateFocused) {
				oRm.attr("aria-activedescendant", oControl._getFormattedValueStateText().getId());
				return;
			}

			// Active descendant should be set only when there is a selected item or a group header is set
			bIsGroupHeader = (oFocusedItem.isA("sap.m.GroupHeaderListItem") || oFocusedItem.isA("sap.ui.core.SeparatorItem"));
			oSelectedItem = oControl.getSelectedItem();
			oListItem = oSelectedItem && ListHelpers.getListItem(oSelectedItem);
			oFocusedItem = bIsGroupHeader ? oFocusedItem : oListItem;

			if (oFocusedItem) {
				oRm.attr("aria-activedescendant", oFocusedItem.getId());
			}
		};

		return ComboBoxRenderer;

	}, /* bExport= */ true);
