/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/Renderer',
		'sap/m/PlanningCalendarRenderer'
	],
	function(Renderer, PlanningCalendarRenderer) {
	"use strict";

	/**
	 * PlanningCalendar renderer.
	 * @namespace
	 */
	var PlanningCalendarInCardRenderer = Renderer.extend(PlanningCalendarRenderer);

	/**
	 * Includes additional class, specific for the control.
	 *
	 * @private
	 * @override
	 * @param {Object} oRm The render manager object.
	 */
	PlanningCalendarInCardRenderer.addAdditionalClasses = function (oRm) {
		oRm.class("sapMPlanCalInCard");
	};

	return PlanningCalendarInCardRenderer;

}, /* bExport= */ true);
