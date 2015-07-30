/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.TimePicker
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/core/ValueStateSupport' ],
	function(jQuery, Renderer, InputBaseRenderer, ValueStateSupport) {
		"use strict";

		/**
		 * Time picker renderer
		 * @author SAP SE
		 * @namespace
		 */
		var TimePickerRenderer = Renderer.extend(InputBaseRenderer);

		TimePickerRenderer.CSS_CLASS = "sapMTimePicker";

		var INPUT_WITH_VALUE_HELP_CLASS = "sapMInputVH",
			INPUT_IE9_CLASS = "sapMInputIE9",
			VALUE_HELP_ICON_INNER_CLASS = "sapMInputValHelpInner",
			VALUE_HELP_ICON_CLASS = "sapMInputValHelp";

		/**
		 * Adds control specific class
		 *
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.addOuterClasses = function(oRm, oControl) {
			oRm.addClass(TimePickerRenderer.CSS_CLASS);
			oRm.addClass(INPUT_WITH_VALUE_HELP_CLASS); // just reuse styling of value help icon

			if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 11) {
				oRm.addClass(INPUT_IE9_CLASS);
			}
		};

		/**
		 * Adds extra content to Input.
		 *
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered
		 */
		TimePickerRenderer.writeInnerContent = function(oRm, oControl) {
			var aClasses,
				mAttributes,
				oRb,
				sText,
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
			sText = oRb.getText("TIMEPICKER_SCREENREADER_TAG"); //that's the only thing that differs it from a regular input

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
		 * Writes the value of the input
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.writeInnerValue = function(oRm, oControl) {
			oRm.writeAttributeEscaped("value", oControl._formatValue(oControl.getDateValue()));
		};

		/**
		 * This method is reserved for derived classes to add extra attributes for the input element.
		 *
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.writeInnerAttributes = function(oRm, oControl) {
			if (sap.ui.Device.browser.mobile) {
				// prevent keyboard in mobile devices
				oRm.writeAttribute("readonly", "readonly");
			}
		};

		/**
		 * Writes the accessibility properties for the control.
		 * @override sap.m.InputBase.writeAccessibilityState
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
		 * @param oControl {sap.m.TimePicker} An object representation of the control that should be rendered.
		 */
		TimePickerRenderer.writeAccessibilityState = function(oRm, oControl) {
			var mProps = {
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

			if (oControl.getValueState() == sap.ui.core.ValueState.Error) {
				mProps.invalid = true;
			}

			oRm.writeAccessibilityState(oControl, mProps);
		};

		return TimePickerRenderer;

	}, /* bExport= */ true);
