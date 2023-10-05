/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Renderer',
	'./DatePickerRenderer',
	'./DateTimeFieldRenderer',
	'sap/ui/core/library',
	'sap/ui/core/date/UI5Date',
	"sap/ui/core/Lib"
],
	function(
		Renderer,
		DatePickerRenderer,
		DateTimeFieldRenderer,
		coreLibrary,
		UI5Date,
		Lib
	) {
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

		var sBaseAnnouncement = DateTimeFieldRenderer.getDescribedByAnnouncement.apply(this, arguments);
		return Lib.getResourceBundleFor("sap.m").getText("DATETIMEPICKER_TYPE") + " " + sBaseAnnouncement;

	};

	DateTimePickerRenderer.getAccessibilityState = function(oDP) {
		var mAccessibilityState = DatePickerRenderer.getAccessibilityState.apply(this, arguments);

		if (oDP.getEditable() && oDP.getEnabled()) {
			mAccessibilityState["haspopup"] = coreLibrary.aria.HasPopup.Dialog.toLowerCase();
		}

		return mAccessibilityState;
	};

	DateTimePickerRenderer.writeAdditionalContent = function(oRm, oControl) {
		var sTimezone = oControl._getTranslatedTimezone(true) || oControl._getTimezone(true);

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
		oRm.text(oControl._getFormatter(true).format(UI5Date.getInstance(2000, 10, 20, 10, 10, 10)));
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
		var sDescribedBy = DateTimeFieldRenderer.getAriaDescribedBy.apply(this, arguments);

		if (oControl._getShowTimezone()) {
			sDescribedBy += " " + oControl.getId() + "-timezoneID";
		}

		return sDescribedBy;
	};

	return DateTimePickerRenderer;

}, /* bExport= */ true);
