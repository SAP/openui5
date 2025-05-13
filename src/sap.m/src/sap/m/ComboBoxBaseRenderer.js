/*!
 * ${copyright}
 */
sap.ui.define(['./ComboBoxTextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/library'], function (ComboBoxTextFieldRenderer, Renderer, coreLibrary) {
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

	ComboBoxBaseRenderer.getAriaDescribedBy = function(oControl) {
		let sAriaDescribedBy = ComboBoxTextFieldRenderer.getAriaDescribedBy.apply(this, arguments);

		if (oControl.getValueStateLinksForAcc().length) {
			sAriaDescribedBy =  sAriaDescribedBy
				? `${sAriaDescribedBy} ${oControl.getValueStateLinksShortcutsId()}`
				: oControl.getValueStateLinksShortcutsId();
		}

		return sAriaDescribedBy;
	};

	/**
	 * Retrieves the accessibility state of the control.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.m.ComboBoxBase} oControl An object representation of the control that should be rendered.
	 * @returns {object} The accessibility state of the control
	 */
	ComboBoxBaseRenderer.getAccessibilityState = function (oControl) {
		var mAccessibilityState = ComboBoxTextFieldRenderer.getAccessibilityState.call(this, oControl),
			oPicker = oControl.getPicker();

		if (oPicker) {
			mAccessibilityState.controls = oPicker.getId();
		}

		return mAccessibilityState;
	};

	/**
	 * Add classes to the control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.ComboBoxBase} oControl An object representation of the control that should be rendered.
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
});