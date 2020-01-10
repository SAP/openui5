/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer'],
	function(Renderer, InputBaseRenderer) {
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
		if (oDP._bValid) {
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

	DatePickerRenderer.getAriaRole = function(oDP) {
		return "combobox";
	};

	DatePickerRenderer.getDescribedByAnnouncement = function(oDP) {

		var sBaseAnnouncement = InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
		//JAWS ignores the word 'Date', but reads the word 'date'
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATEPICKER_DATE_TYPE").toLowerCase() + " " + sBaseAnnouncement;

	};

	DatePickerRenderer.getAccessibilityState = function(oDP) {

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["autocomplete"] = "none";
		mAccessibilityState["haspopup"] = true;
		mAccessibilityState["expanded"] = false;
		// aria-disabled is not necessary if we already have a native 'disabled' attribute
		mAccessibilityState["disabled"] = null;

		if (oDP._bMobile && oDP.getEnabled() && oDP.getEditable()) {
			// if on mobile device readonly property is set, but should not be announced
			mAccessibilityState["readonly"] = false;
		}

		return mAccessibilityState;

	};

	return DatePickerRenderer;

}, /* bExport= */ true);
