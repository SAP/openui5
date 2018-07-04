/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxBaseRenderer', 'sap/ui/core/Renderer'],
	function(ComboBoxBaseRenderer, Renderer) {
	"use strict";

	/**
	 * MultiComboBox renderer.
	 * @namespace
	 */
	var MultiComboBoxRenderer = Renderer.extend(ComboBoxBaseRenderer);

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
		oRm.addClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX);

		if (oControl._hasTokens()) {
			oRm.addClass("sapMMultiComboBoxHasToken");
		}
	};

	/**
	 * Add attributes to the element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.writeInnerAttributes = function(oRm, oControl) {
		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			var oInvisibleTextId = oControl._oTokenizer && oControl._oTokenizer.getTokensInfoId();
			oRm.writeAttribute("aria-describedby", oInvisibleTextId);
		}

		ComboBoxBaseRenderer.writeInnerAttributes.apply(this, arguments);
	};

	MultiComboBoxRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._oTokenizer);
	};

	return MultiComboBoxRenderer;

}, /* bExport= */ true);