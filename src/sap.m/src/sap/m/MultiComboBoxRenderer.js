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
	 * CSS class to be applied to the HTML root element of the MultiComboBox control.
	 *
	 * @type {string}
	 */
	MultiComboBoxRenderer.DOT_CSS_CLASS_MULTICOMBOBOX = ".sapMMultiComboBox";

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

	/**
	 * Add inner classes to the MultiComboBox's input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.addInnerClasses = function(oRm, oControl) {
		ComboBoxBaseRenderer.addInnerClasses.apply(this, arguments);
		oRm.addClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "InputInner");
	};

	/**
	 * Add CSS classes to the combo box arrow button, using the provided {@link sap.ui.core.RenderManager}.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.addButtonClasses = function(oRm, oControl) {
		ComboBoxBaseRenderer.addButtonClasses.apply(this, arguments);
		oRm.addClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Arrow");
	};

	MultiComboBoxRenderer.openInputTag = function(oRm, oControl) {
		oRm.write('<div class="sapMMultiComboBoxBorder"');
		oRm.writeAttribute("id", oControl.getId() + "-border");  // UI5 core expect a DIV with ID
		oRm.write(">");

		oRm.renderControl(oControl._oTokenizer);

		oRm.write("<div class=\"sapMMultiComboBoxInputContainer\">");
		ComboBoxBaseRenderer.openInputTag.call(this, oRm, oControl);
	};

	MultiComboBoxRenderer.closeInputTag = function(oRm, oControl) {
		ComboBoxBaseRenderer.closeInputTag.call(this, oRm, oControl);
		oRm.write("</div>");
		oRm.write("</div>");
	};

	return MultiComboBoxRenderer;

}, /* bExport= */ true);