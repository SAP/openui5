/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.DatePicker
sap.ui.define(['./TextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/ValueStateSupport', 'sap/ui/core/library'],
	function(TextFieldRenderer, Renderer, ValueStateSupport, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * DatePicker renderer.
	 * @namespace
	 * For a common look&feel, the DatePicker extends the TextField control,
	 * just like the ComboBox does.
	 */
	var DatePickerRenderer = Renderer.extend(TextFieldRenderer);

	/**
	 * Hint: "renderOuterAttributes" is a reserved/hard-coded TextField extending function!
	 *       It is used to allow extensions to display help icons.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager currently rendering this control
	 * @param {sap.ui.commons.DatePicker}
	 *            oControl the DatePicker whose "value help" should be rendered
	 * @private
	 */
	DatePickerRenderer.renderOuterAttributes = function(rm, oControl) {
		// To share the overall ComboBox styling:
		// Note: Would be best if a more generic className had been used for this, like
		//       "sapUiTfIconContainer", as ComboBox and DatePicker and F4Help are likely
		//       to always share a common container look. (Only icon should differ.)
		//       Then, in the unlikely case where one of them would want to differ from the
		//       others, then this one would only need to add its own className on top of
		//       the generic one, e.g. "sapUiTfDateContainer" for the DatePicker.
		// Referencing "sapUiTfCombo" for now.
		rm.addClass("sapUiTfCombo");
		this.renderDatePickerARIAInfo(rm, oControl);
	};

	/**
	 * Renders additional HTML for the DatePicker to the TextField (sets the icon)
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for
	 *                                                 writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should
	 *                                     be rendered.
	 */
	DatePickerRenderer.renderOuterContentBefore = function(rm, oControl){

		rm.write("<div");
		rm.writeAttribute('id', oControl.getId() + '-icon');
		rm.writeAttribute('tabindex', '-1'); // to do not close popup by click on it
		// As mentioned above, a more generic "sapUiTfIcon" className could have been used...
		// One would just have had to add its own icon className!
		// Using "sapUiTfDateIcon" for now, as it proved easier to define instead of overwriting
		// the ComboBox image sources and backgrounds.
		rm.addClass("sapUiTfDateIcon");
		rm.writeClasses();
		rm.write("></div>"); //No Symbol for HCB Theme, as done by ComboBox.

		// invisible span with description for keyboard navigation
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
			// ResourceBundle always returns the key if the text is not found
		var sText = rb.getText("DATEPICKER_DATE_TYPE");

		var sTooltip = ValueStateSupport.enrichTooltip(oControl, oControl.getTooltip_AsString());
		if (sTooltip) {
			// add tooltip to description because it is not read by JAWS from title-attribute if a label is assigned
			sText = sText + ". " + sTooltip;
		}
		rm.write('<span id="' + oControl.getId() + '-Descr" style="visibility: hidden; display: none;">');
		rm.writeEscaped(sText);
		rm.write('</span>');

	};

	/*
	 * Renders the inner attributes for the input element of the DatePicker
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDatePicker an object representation of the control that should be rendered
	 */
	DatePickerRenderer.renderInnerAttributes = function(rm, oDatePicker) {

		if (oDatePicker._bMobile) {
			rm.writeAttribute('type', 'date');
			rm.addStyle('position', 'absolute'); // to lay input field over expander icon
		}

	};

	/*
	 * Renders ARIA information for the outer DIV
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for
	 *                                                 writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should
	 *                                     be rendered
	 */
	DatePickerRenderer.renderDatePickerARIAInfo = function(rm, oControl) {

		// no ARIA on outer DIV because focus is only on the input field
		// so no ARIA necessary here -> if there it brings some conufing reading by JAWS

		// IMPORTANT: According to jQuery forums, DatePicker Accessibility is to be delivered in a
		//            future release. No release mentionned.
		// So there is not much point about doing more about this at the moment.

	};

	DatePickerRenderer.renderARIAInfo = function(rm, oDatePicker) {

		var mProps = {
			role: oDatePicker.getAccessibleRole().toLowerCase(),
			multiline: false,
			autocomplete: "none",
			haspopup: true,
			describedby: {value: oDatePicker.getId() + "-Descr", append: true}};

		if (oDatePicker.getValueState() == ValueState.Error) {
			mProps["invalid"] = true;
		}

		rm.writeAccessibilityState(oDatePicker, mProps);

	};

	DatePickerRenderer.convertPlaceholder = function(oDatePicker) {

		var sPlaceholder = oDatePicker.getPlaceholder();

		if (sPlaceholder.length == 8 && !isNaN(sPlaceholder)) {
			var oDate = oDatePicker._oFormatYyyymmdd.parse(sPlaceholder);
			if (oDate) {
				sPlaceholder = oDatePicker._formatValue(oDate);
			}
		}

		return sPlaceholder;

	};

	return DatePickerRenderer;

}, /* bExport= */ true);
