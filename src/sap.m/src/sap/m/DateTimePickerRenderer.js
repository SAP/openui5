/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './DatePickerRenderer', './InputBaseRenderer'],
	function(Renderer, DatePickerRenderer, InputBaseRenderer) {
	"use strict";

	/**
	 * DateTimePicker renderer.
	 * @namespace
	 */
	var DateTimePickerRenderer = Renderer.extend(DatePickerRenderer);

	DateTimePickerRenderer.apiVersion = 2;

	DateTimePickerRenderer.getDescribedByAnnouncement = function(oDP) {

		var sBaseAnnouncement = InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATETIMEPICKER_TYPE") + " " + sBaseAnnouncement;

	};

	return DateTimePickerRenderer;

}, /* bExport= */ true);
