/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.TimePicker
sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/core/library'],
	function(Renderer, InputBaseRenderer, coreLibrary) {
		"use strict";

		/**
		 * TimePicker renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var TimePickerRenderer = Renderer.extend(InputBaseRenderer);
		TimePickerRenderer.apiVersion = 2;

		TimePickerRenderer.CSS_CLASS = "sapMTimePicker";

		/**
		 * Adds <code>sap.m.TimePicker</code> control specific classes to the input.
		 *
		 * See {@link sap.m.InputBaseRenderer#addOuterClasses}.
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl The control that should be rendered
		 */
		TimePickerRenderer.addOuterClasses = function(oRm, oControl) {
			oRm.class(TimePickerRenderer.CSS_CLASS);
		};

		/**
		 * Writes the value of the input.
		 *
		 * See {@link sap.m.InputBaseRenderer#writeInnerValue}.
		 * @override
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl An object representation of the control that should be rendered
		 */
		TimePickerRenderer.writeInnerValue = function(oRm, oControl) {
			oRm.attr("value", oControl._formatValue(oControl.getDateValue()));
		};

		/**
		 * Returns the inner aria labelledby announcement texts for the accessibility.
		 *
		 * @overrides sap.m.InputBaseRenderer.getLabelledByAnnouncement
		 * @param {sap.ui.core.Control} oControl an object representation of the control.
		 * @returns {String}
		 */
		TimePickerRenderer.getLabelledByAnnouncement = function(oControl) {
			// In the TimePicker we need to render the placeholder should be placed as
			// hidden aria labelledby node for the accessibility
			return oControl._getPlaceholder() || "";
		};

		/**
		 * Writes the accessibility properties for the control.
		 *
		 * See {@link sap.m.InputBase#getAccessibilityState}.
		 * @override
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl An object representation of the control that should be rendered
		 */
		TimePickerRenderer.getAccessibilityState = function (oControl) {
			var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

			mAccessibilityState["roledescription"] = oControl._oResourceBundle.getText("ACC_CTR_TYPE_TIMEINPUT");
			mAccessibilityState["autocomplete"] = "none";
			mAccessibilityState["haspopup"] = coreLibrary.aria.HasPopup.Dialog.toLowerCase();
			mAccessibilityState["disabled"] = null; // aria-disabled not needed if there's already a native 'disabled' attribute
			mAccessibilityState["owns"] = oControl.getId() + "-sliders";

			return mAccessibilityState;
		};

		return TimePickerRenderer;
	}, /* bExport= */ true);
