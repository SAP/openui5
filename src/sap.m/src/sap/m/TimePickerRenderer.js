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

		var INPUT_WITH_VALUE_HELP_CLASS = "sapMInputVH",
			VALUE_HELP_ICON_INNER_CLASS = "sapMInputValHelpInner",
			VALUE_HELP_ICON_CLASS = "sapMInputValHelp";

		/**
		 * Adds <code>sap.m.TimePicker</code> control specific classes to the input.
		 *
		 * See {@link sap.m.InputBaseRenderer#addOuterClasses}.
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePicker} oControl The control that should be rendered
		 */
		TimePickerRenderer.addOuterClasses = function(oRm, oControl) {
			oRm.addClass(TimePickerRenderer.CSS_CLASS);
			if (oControl.getEnabled() && oControl.getEditable()) {
				oRm.addClass(INPUT_WITH_VALUE_HELP_CLASS); // just reuse styling of value help icon
			}
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
			var aClasses,
				mAttributes,
				oRb = oControl._oResourceBundle,
				sText = oRb.getText("TIMEPICKER_SCREENREADER_TAG");

			if (oControl.getEnabled() && oControl.getEditable()) {
				aClasses = [VALUE_HELP_ICON_INNER_CLASS];
				mAttributes = {};
				mAttributes.id = oControl.getId() + "-icon";
				mAttributes.tabindex = "-1"; // to get focus events on it, needed for popup autoclose handling
				mAttributes.title = null;

				oRm.write('<div class="' + VALUE_HELP_ICON_CLASS + '">');
				oRm.writeIcon("sap-icon://time-entry-request", aClasses, mAttributes);
				oRm.write("</div>");
			}

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
		 * Write the id of the inner input
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.writeInnerId = function(oRm, oControl) {
			oRm.writeAttribute("id", oControl.getId() + "-" + this.getInnerSuffix());
		};

		/**
		 * Define own inner ID suffix.
		 * @returns {string} The own inner ID suffix
		 */
		TimePickerRenderer.getInnerSuffix = function() {
			return "inner";
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
