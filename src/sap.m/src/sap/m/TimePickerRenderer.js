/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.TimePicker
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/core/ValueStateSupport', 'sap/ui/core/LabelEnablement' ],
	function(jQuery, Renderer, InputBaseRenderer, ValueStateSupport, LabelEnablement) {
		"use strict";

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
				oRb,
				sText = "",
				sTooltip;

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

			oRb = oControl._oResourceBundle;

			if (!oControl.getProperty("placeholder") && this._hasLabelReferencing(oControl)) {
				/* Default (timeformat) placeholder in conjunction with timepicker labelled by other control -
				 add the time format to the aria-desc text, because the placeholder won't be read */
				sText = oRb.getText("TIMEPICKER_WITH_PH_SCREENREADER_TAG", oControl._getFormat());
			} else {
				sText = oRb.getText("TIMEPICKER_SCREENREADER_TAG");
			}

			sTooltip = ValueStateSupport.enrichTooltip(oControl, oControl.getTooltip_AsString());
			if (sTooltip) {
				// add tooltip to description because it is not read by JAWS from title-attribute if a label is assigned
				sText = sTooltip + ". " + sText;
			}

			// invisible span with description for keyboard navigation
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
		 * Writes the accessibility properties for the control.
		 *
		 * See {@link sap.m.InputBase#writeAccessibilityState}.
		 * @override
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered
		 */
		TimePickerRenderer.writeAccessibilityState = function (oRm, oControl) {
			var sAriaLabelledBy = this.getAriaLabelledBy(oControl),
				mProps = {
					role: "combobox",
					multiline: false,
					autocomplete: "none",
					expanded: false,
					haspopup: true,
					owns: oControl.getId() + "-sliders",
					describedby: {
						value: oControl.getId() + "-descr",
						append: true
					}
				};

			//When time picker is labelled, the placeholder is not read by AT, so connect additional hidden element
			if (sAriaLabelledBy && this._hasLabelReferencing(oControl) && oControl.getProperty("placeholder")) {
				mProps.labelledby = {
					value: sAriaLabelledBy.trim(),
					append: true
				};
			}

			if (oControl.getValueState() == sap.ui.core.ValueState.Error) {
				mProps.invalid = true;
			}

			oRm.writeAccessibilityState(oControl, mProps);
		};

		/**
		 * Overrides rendering of aria-labelledby.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.renderAriaLabelledBy = function (oRm, oControl) {
			//When time picker is labelled, the placeholder is not read by AT, so render additional hidden element
			if (this._hasLabelReferencing(oControl) && oControl.getProperty("placeholder")) {
				InputBaseRenderer.renderAriaLabelledBy(oRm, oControl);
			}
		};

		/**
		 * Determines if the given control is labelled by another
		 * @param oControl the control to check
		 * @returns {boolean} true if there is at least one other control that labels <code>oControl</control>, false otherwise
		 * @private
		 */
		TimePickerRenderer._hasLabelReferencing = function(oControl) {
			return LabelEnablement.getReferencingLabels(oControl).length > 0;
		};

		return TimePickerRenderer;

	}, /* bExport= */ true);
