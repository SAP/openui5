/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer','./ComboBoxTextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/Device'],
	function(ComboBoxBaseRenderer, ComboBoxTextFieldRenderer, Renderer, Device) {
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

		if (oControl._hasTokens()) {
			oRm.class("sapMMultiComboBoxHasToken");
		}
	};
	/**
	 * Returns the inner aria describedby ids for the accessibility.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String|undefined}
	 */
	MultiComboBoxRenderer.getAriaDescribedBy = function(oControl) {
		var sAriaDescribedBy = ComboBoxTextFieldRenderer.getAriaDescribedBy.apply(this, arguments),
		oInvisibleTextId = oControl._oTokenizer && oControl._oTokenizer.getTokensInfoId();

		return (sAriaDescribedBy || "") + " " + oInvisibleTextId;
	};

	MultiComboBoxRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._oTokenizer);
	};

	return MultiComboBoxRenderer;

}, /* bExport= */ true);