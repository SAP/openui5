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

	};

	/**
	 * add extra content to Input
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.DatePicker} oDP an object representation of the control that should be rendered
	 */
	DatePickerRenderer.writeDecorations = function(oRm, oDP) {

		if (oDP.getEnabled() && oDP.getEditable()) {
			var aClasses = ["sapMInputValHelpInner"];
			var mAttributes = {};

			mAttributes["id"] = oDP.getId() + "-icon";
			mAttributes["tabindex"] = "-1"; // to get focus events on it, needed for popup autoclose handling
			mAttributes["title"] = null;
			oRm.write('<div class="sapMInputValHelp">');
			oRm.writeIcon(this._getIcon(), aClasses, mAttributes);
			oRm.write("</div>");
		}

	};

	DatePickerRenderer._getIcon = function() {

		return "sap-icon://appointment-2";

	};

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerValue = function(oRm, oDP) {

		if (oDP._bValid) {
			oRm.writeAttributeEscaped("value", oDP._formatValue(oDP.getDateValue()));
		} else {
			oRm.writeAttributeEscaped("value", oDP.getValue());
		}

	};

	/**
	 * This method is reserved for derived classes to add extra attributes for the input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.DatePicker} oDP An object representation of the control that should be rendered.
	 */
	DatePickerRenderer.writeInnerAttributes = function(oRm, oDP) {
		oRm.writeAttribute("type", "text");
		if (oDP._bMobile) {
			// prevent keyboard in mobile devices
			oRm.writeAttribute("readonly", "readonly");
		}

	};

	DatePickerRenderer.getAriaRole = function(oDP) {

		return "combobox";

	};

	DatePickerRenderer.getDescribedByAnnouncement = function(oDP) {

		var sBaseAnnouncement = InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATEPICKER_DATE_TYPE") + " " + sBaseAnnouncement;

	};

	DatePickerRenderer.getAccessibilityState = function(oDP) {

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["autocomplete"] = "none";
		mAccessibilityState["haspopup"] = true;
		mAccessibilityState["expanded"] = false;

		if (oDP._bMobile && oDP.getEnabled() && oDP.getEditable()) {
			// if on mobile device readonly property is set, but should not be announced
			mAccessibilityState["readonly"] = false;
		}

		return mAccessibilityState;

	};

	return DatePickerRenderer;

}, /* bExport= */ true);
