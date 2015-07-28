/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './InputBaseRenderer'],
	function(jQuery, Renderer, InputBaseRenderer) {
	"use strict";


	/**
	 * DatePicker renderer.
	 * @namespace
	 */
	var DatePickerRenderer = Renderer.extend(InputBaseRenderer);

	/**
	 * Adds control specific class
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.DatePicker} oDP an object representation of the control that should be rendered
	 */
	DatePickerRenderer.addOuterClasses = function(oRm, oDP) {

		oRm.addClass("sapMDP");
		if (oDP.getEnabled() && oDP.getEditable()) {
			oRm.addClass("sapMInputVH"); // just reuse styling of value help icon
		}

		if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 11) {
			oRm.addClass("sapMInputIE9");
		}

	};

	/**
	 * add extra content to Input
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.DatePicker} oDP an object representation of the control that should be rendered
	 */
	DatePickerRenderer.writeInnerContent = function(oRm, oDP) {

		if (oDP.getEnabled() && oDP.getEditable()) {
			var aClasses = ["sapMInputValHelpInner"];
			var mAttributes = {};

			mAttributes["id"] = oDP.getId() + "-icon";
			mAttributes["tabindex"] = "-1"; // to get focus events on it, needed for popup autoclose handling
			oRm.write('<div class="sapMInputValHelp">');
			oRm.writeIcon("sap-icon://appointment-2", aClasses, mAttributes);
			oRm.write("</div>");
		}

		// invisible span with description for keyboard navigation
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
			// ResourceBundle always returns the key if the text is not found
		// ResourceBundle always returns the key if the text is not found
		var sText = rb.getText("DATEPICKER_DATE_TYPE");

		var sTooltip = sap.ui.core.ValueStateSupport.enrichTooltip(oDP, oDP.getTooltip_AsString());
		if (sTooltip) {
			// add tooltip to description because it is not read by JAWS from title-attribute if a label is assigned
			sText = sText + ". " + sTooltip;
		}
		oRm.write('<SPAN id="' + oDP.getId() + '-Descr" style="visibility: hidden; display: none;">');
		oRm.writeEscaped(sText);
		oRm.write('</SPAN>');

	};

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerValue = function(oRm, oDP) {

		oRm.writeAttributeEscaped("value", oDP._formatValue(oDP.getDateValue()));

	};

	/**
	 * This method is reserved for derived classes to add extra attributes for the input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerAttributes = function(oRm, oDP) {

		if (oDP._bMobile) {
			// prevent keyboard in mobile devices
			oRm.writeAttribute("readonly", "readonly");
		}

	};

	DatePickerRenderer.writeAccessibilityState = function(oRm, oDP) {

		var mProps = {
			role: "combobox",
			multiline: false,
			autocomplete: "none",
			haspopup: true,
			owns: oDP.getId() + "-cal",
			describedby: {value: oDP.getId() + "-Descr", append: true}};

		if (oDP.getValueState() == sap.ui.core.ValueState.Error) {
			mProps["invalid"] = true;
		}

		oRm.writeAccessibilityState(oDP, mProps);

	};

	return DatePickerRenderer;

}, /* bExport= */ true);
