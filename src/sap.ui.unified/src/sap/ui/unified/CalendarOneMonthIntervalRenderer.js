/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './CalendarDateIntervalRenderer'],
	function(Renderer, CalendarDateIntervalRenderer) {
	"use strict";


	/**
	 * CalendarOneMonthInterval renderer.
	 * @namespace
	 */
	var CalendarOneMonthIntervalRenderer = Renderer.extend(CalendarDateIntervalRenderer);
	CalendarOneMonthIntervalRenderer.apiVersion = 2;

	CalendarOneMonthIntervalRenderer.addAttributes = function(oRm, oCal) {

		CalendarDateIntervalRenderer.addAttributes.apply(this, arguments);
		oRm.class("sapUiCalOneMonthInt");
	};

	return CalendarOneMonthIntervalRenderer;

}, /* bExport= */ true);
