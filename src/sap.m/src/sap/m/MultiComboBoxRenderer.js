/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer','./ComboBoxTextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/Core'],
	function(ComboBoxBaseRenderer, ComboBoxTextFieldRenderer, Renderer, Core) {
	"use strict";

	/**
	 * MultiComboBox renderer.
	 * @namespace
	 */
	var MultiComboBoxRenderer = Renderer.extend(ComboBoxBaseRenderer);
	MultiComboBoxRenderer.apiVersion = 2;
	/**
	 * CSS class to be applied to the HTML root element of the MultiComboBox control.
	 *
	 * @type {string}
	 */
	MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX = "sapMMultiComboBox";

	/**
	 * Add classes to the MultiComboBox.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.addOuterClasses = function(oRm, oControl) {
		ComboBoxBaseRenderer.addOuterClasses.apply(this, arguments);
		oRm.class(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX);

		if (oControl.getProperty("hasSelection")) {
			oRm.class("sapMMultiComboBoxHasToken");
		}
	};
	/**
	 * Returns the inner aria describedby ids for the accessibility.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String|undefined}
	 */
	MultiComboBoxRenderer.getAriaDescribedBy = function (oControl) {
		var sAriaDescribedBy = ComboBoxTextFieldRenderer.getAriaDescribedBy.apply(this, arguments),
			oTokenizer = oControl.getAggregation("tokenizer"),
			oInvisibleTextId = oTokenizer && oTokenizer.getTokensInfoId();

		return (sAriaDescribedBy || "") + " " + oInvisibleTextId;
	};

	/**
	 * Retrieves the accessibility state of the control.
	 *
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 * @returns {object} The accessibility state of the control
	 */
	MultiComboBoxRenderer.getAccessibilityState = function (oControl) {
		var mAccessibilityState = ComboBoxBaseRenderer.getAccessibilityState.apply(this, arguments),
			oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		mAccessibilityState.roledescription = oResourceBundle.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION");

		return mAccessibilityState;
	};

	MultiComboBoxRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("tokenizer"));
	};

	return MultiComboBoxRenderer;

}, /* bExport= */ true);