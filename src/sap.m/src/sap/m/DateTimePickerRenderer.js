/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './DatePickerRenderer', './InputBaseRenderer', 'sap/ui/core/library'],
	function(Renderer, DatePickerRenderer, InputBaseRenderer, coreLibrary) {
	"use strict";

	/**
	 * DateTimePicker renderer.
	 * @namespace
	 */
	var DateTimePickerRenderer = Renderer.extend(DatePickerRenderer);

	DateTimePickerRenderer.apiVersion = 2;

	DateTimePickerRenderer.writeInnerValue = function(oRm, oControl) {
		if (!oControl.getDateValue() && typeof oControl._prefferedValue === "string") {
			oRm.attr("value", oControl._prefferedValue);
		} else {
			DatePickerRenderer.writeInnerValue.apply(this, arguments);
		}
	};

	DateTimePickerRenderer.getDescribedByAnnouncement = function(oDP) {

		var sBaseAnnouncement = InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATETIMEPICKER_TYPE") + " " + sBaseAnnouncement;

	};

	DateTimePickerRenderer.getAccessibilityState = function(oDP) {
		var mAccessibilityState = DatePickerRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["haspopup"] = coreLibrary.aria.HasPopup.Dialog.toLowerCase();

		return mAccessibilityState;
	};

	DateTimePickerRenderer.writeAdditionalContent = function(oRm, oControl) {
		var sTimezone = oControl._getTranslatedTimezone(true);

		if (!oControl._getShowTimezone()) {
			return;
		}

		oRm.openStart("div", oControl.getId() + "-timezoneLabel");
		oRm.class("sapMDTPTimezoneLabel");
		oRm.openEnd();

		oRm.openStart("span", oControl.getId() + "-timezoneID");
		oRm.openEnd();
		oRm.text(sTimezone);
		oRm.close("span");

		oRm.close("div");

		oRm.openStart("span");
		oRm.class("sapMDummyContent");
		oRm.openEnd();

		// try to choose the date that is the longest when formatted
		oRm.text(oControl._getFormatter(true).format(
			new Date(Date.UTC(2000, 10, 20, 10, 10, 10)),
			"UTC"));
		oRm.close("span");
	};

	DateTimePickerRenderer.addOuterClasses = function(oRm, oControl) {
		DatePickerRenderer.addOuterClasses(oRm, oControl);

		oRm.class("sapMDTP");

		if (oControl._getShowTimezone()) {
			oRm.class("sapMDTPWithTimezone");
		}
	};

	DateTimePickerRenderer.getAriaDescribedBy = function(oControl) {
		var sDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);

		if (oControl._getShowTimezone()) {
			sDescribedBy += " " + oControl.getId() + "-timezoneID";
		}

		return sDescribedBy;
	};

	return DateTimePickerRenderer;

}, /* bExport= */ true);
