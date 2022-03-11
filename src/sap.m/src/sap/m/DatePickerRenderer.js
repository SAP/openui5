/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/core/library'],
	function(Renderer, InputBaseRenderer, coreLibrary) {
	"use strict";

	/**
	 * DatePicker renderer.
	 * @namespace
	 */
	var DatePickerRenderer = Renderer.extend(InputBaseRenderer);
	DatePickerRenderer.apiVersion = 2;

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerValue = function(oRm, oDP) {
		if (oDP._bValid || oDP._bOutOfAllowedRange) {
			oRm.attr("value", oDP._formatValue(oDP.getDateValue()));
		} else {
			oRm.attr("value", oDP.getValue());
		}
	};

	/**
	 * This method is reserved for derived classes to add extra attributes for the input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerAttributes = function(oRm, oDP) {
		oRm.attr("type", "text");

		if (oDP._bMobile) {
			// prevent keyboard in mobile devices
			oRm.attr("readonly", "readonly");
		}
	};

	DatePickerRenderer.getAccessibilityState = function(oDP) {
		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["roledescription"] = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATEINPUT");
		mAccessibilityState["autocomplete"] = "none";
		mAccessibilityState["haspopup"] = coreLibrary.aria.HasPopup.Grid.toLowerCase();
		// aria-disabled is not necessary if we already have a native 'disabled' attribute
		mAccessibilityState["disabled"] = null;

		if (oDP._bMobile && oDP.getEnabled() && oDP.getEditable()) {
			// if on mobile device readonly property is set, but should not be announced
			mAccessibilityState["readonly"] = false;
		}

		return mAccessibilityState;
	};

	/**
	 * Adds specific class to hide the <code>DatePicker</code> input field when the <code>hideInput</code> property is set to <code>true</code>.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oControl An object representation of the control that should be rendered.
	 */
	 DatePickerRenderer.addOuterClasses = function(oRm, oControl) {
		if (oControl.getHideInput()) {
			oRm.class("sapMDatePickerHiddenInput");
		}
		InputBaseRenderer.addOuterClasses.apply(this, arguments);
	};

	return DatePickerRenderer;

}, /* bExport= */ true);
