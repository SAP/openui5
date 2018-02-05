/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.PlanningCalendarLegend control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "PLANNINGCALENDARLEGEND_NAME",
				plural: "PLANNINGCALENDARLEGEND_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY"
				// TODO: uncomment this when icon is avaiable
				// icons: {
				// 	svg: "sap/m/designtime/PlanningCalendarLegend.icon.svg"
				// }
			},
			templates: {
				create: "sap/m/designtime/PlanningCalendarLegend.create.fragment.xml"
			}
		};

	}, /* bExport= */ false);
