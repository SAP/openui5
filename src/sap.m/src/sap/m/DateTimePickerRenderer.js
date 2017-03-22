/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './DatePickerRenderer', './InputBaseRenderer'],
	function(jQuery, Renderer, DatePickerRenderer, InputBaseRenderer) {
	"use strict";

	/**
	 * DateTimePicker renderer.
	 * @namespace
	 */
	var DateTimePickerRenderer = Renderer.extend(DatePickerRenderer);

	DateTimePickerRenderer._getIcon = function() {

		return "sap-icon://date-time";

	};

	DateTimePickerRenderer.getDescribedByAnnouncement = function(oDP) {

		var sBaseAnnouncement = InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATETIMEPICKER_TYPE") + " " + sBaseAnnouncement;

	};

	return DateTimePickerRenderer;

}, /* bExport= */ true);
