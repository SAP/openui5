/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.TimePicker
sap.ui.define(['sap/ui/core/Renderer', './DateTimeFieldRenderer', 'sap/ui/core/library'], function(Renderer, DateTimeFieldRenderer, coreLibrary) {
	"use strict";

	/**
	 * TimePicker renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var TimePickerRenderer = Renderer.extend(DateTimeFieldRenderer);
	TimePickerRenderer.apiVersion = 2;

	TimePickerRenderer.CSS_CLASS = "sapMTimePicker";

	/**
	 * Adds <code>sap.m.TimePicker</code> control specific classes to the input.
	 *
	 * See {@link sap.m.DateTimeFieldRenderer#addOuterClasses}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePicker} oControl The control that should be rendered
	 */
	TimePickerRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.class(TimePickerRenderer.CSS_CLASS);
		if (oControl.getHideInput()) {
			oRm.class("sapMTimePickerHiddenInput");
		}
		DateTimeFieldRenderer.addOuterClasses.apply(this, arguments);
	};

	/**
	 * Writes the value of the input.
	 *
	 * See {@link sap.m.DateTimeFieldRenderer#writeInnerValue}.
	 * @override
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePicker} oControl An object representation of the control that should be rendered
	 */
	TimePickerRenderer.writeInnerValue = function(oRm, oControl) {
		if (oControl._inPreferredUserInteraction()) {
			oRm.attr("value", oControl._$input.val());
		} else {
			oRm.attr("value", oControl._formatValue(oControl.getDateValue()));
		}
	};

	/**
	 * Collects the accessibility properties for the control.
	 *
	 * See {@link sap.m.InputBase#getAccessibilityState}.
	 * @override
	 * @param {sap.m.TimePicker} oControl THe time picker control
	 */
	TimePickerRenderer.getAccessibilityState = function (oControl) {
		var mAccessibilityState = DateTimeFieldRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["roledescription"] = oControl._oResourceBundle.getText("ACC_CTR_TYPE_TIMEINPUT");
		if (oControl.getEditable() && oControl.getEnabled()) {
			mAccessibilityState["haspopup"] = coreLibrary.aria.HasPopup.Dialog.toLowerCase();
		}
		mAccessibilityState["disabled"] = null; // aria-disabled not needed if there's already a native 'disabled' attribute
		if (oControl._isMobileDevice()) {
			mAccessibilityState["describedby"] = oControl._oResourceBundle.getText("ACC_CTR_TYPE_TIMEINPUT_MOBILE_DESCRIBEDBY");
		}

		return mAccessibilityState;
	};

	/**
	 * add extra attributes to TimePicker's Input
	 *
	 * @overrides sap.m.DateTimeFieldRenderer.writeInnerAttributes
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePicker} oControl an object representation of the control that should be rendered
	 */
	TimePickerRenderer.writeInnerAttributes = function (oRm, oControl) {
		if (oControl._isMobileDevice()) {
			oRm.attr("readonly", "readonly"); // readonly for mobile devices
		}
		if (oControl.getShowValueStateMessage()) {
			oRm.attr("autocomplete", "off"); // autocomplete="off" needed so the native browser autocomplete is not shown?
		}
	};

	return TimePickerRenderer;
});
