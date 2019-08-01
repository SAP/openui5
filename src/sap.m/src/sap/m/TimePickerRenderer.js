/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.TimePicker
sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/core/library'],
	function(Renderer, InputBaseRenderer, coreLibrary) {
		"use strict";

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		/**
		 * TimePicker renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var TimePickerRenderer = Renderer.extend(InputBaseRenderer);

		TimePickerRenderer.CSS_CLASS = "sapMTimePicker";

		/**
		 * Adds <code>sap.m.TimePicker</code> control specific classes to the input.
		 *
		 * See {@link sap.m.InputBaseRenderer#addOuterClasses}.
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl The control that should be rendered
		 */
		TimePickerRenderer.addOuterClasses = function(oRm, oControl) {
			oRm.addClass(TimePickerRenderer.CSS_CLASS);
		};

		/**
		 * Adds extra content to the input.
		 *
		 * See {@link sap.m.InputBaseRenderer#writeDecorations}.
		 * @override
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl The control that should be rendered
		 */
		TimePickerRenderer.writeDecorations = function(oRm, oControl) {
			var oRb = oControl._oResourceBundle,
				sText = oRb.getText("TIMEPICKER_SCREENREADER_TAG");

			// invisible span with custom role
			oRm.write('<span id="' + oControl.getId() + '-descr" style="visibility: hidden; display: none;">');
			oRm.writeEscaped(sText);
			oRm.write('</span>');
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
			oRm.writeAttributeEscaped("value", oControl._formatValue(oControl.getDateValue()));
		};

		/**
		 * Returns aria accessibility role for the control.
		 *
		 * @override
		 * @returns {String}
		 */
		TimePickerRenderer.getAriaRole = function () {
			return "combobox";
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
			var sAriaLabelledBy = this.getAriaLabelledBy(oControl),
				sAriaDescribedBy = this.getAriaDescribedBy(oControl),
				mAccessibilityState = oControl.getAccessibilityInfo();

			if (oControl.getValueState() === ValueState.Error) {
				mAccessibilityState.invalid = true;
			}

			if (sAriaLabelledBy) {
				mAccessibilityState.labelledby = {
					value: sAriaLabelledBy.trim(),
					append: true
				};
			}

			if (sAriaDescribedBy) {
				mAccessibilityState.describedby = {
					value: sAriaDescribedBy.trim(),
					append: true
				};
			}

			return mAccessibilityState;
		};

		/**
		 * Returns the inner aria describedby ids for the accessibility.
		 *
		 * @override
		 * @param {sap.ui.core.Control} oControl an object representation of the control.
		 * @returns {String}
		 */
		TimePickerRenderer.getAriaDescribedBy = function (oControl) {
			var oCustomRoleHiddenTextId = oControl.getId() + "-descr ";
			if (this.getDescribedByAnnouncement(oControl)) {
				oCustomRoleHiddenTextId += oControl.getId() + "-describedby";
			}
			return oCustomRoleHiddenTextId;
		};

		return TimePickerRenderer;
	}, /* bExport= */ true);
