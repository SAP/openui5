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
	 * Returns the accessibility state of the control.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {Object}
	 */
	MultiComboBoxRenderer.getAccessibilityState = function (oControl) {
		var mAccessibilityState = ComboBoxTextFieldRenderer.getAccessibilityState.call(this, oControl),
			oInvisibleTextId = oControl._oTokenizer && oControl._oTokenizer.getTokensInfoId();

		mAccessibilityState.expanded = oControl.isOpen();

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			if (Device.browser.internet_explorer && mAccessibilityState.describedby) {
				mAccessibilityState.describedby = {
					value: (mAccessibilityState.describedby + " " + oInvisibleTextId).trim(),
					append: true
				};
			}else {
				mAccessibilityState.describedby = {
					value: oInvisibleTextId.trim(),
					append: true
				};
			}
		}

		return mAccessibilityState;
	};

	MultiComboBoxRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._oTokenizer);
	};

	return MultiComboBoxRenderer;

}, /* bExport= */ true);