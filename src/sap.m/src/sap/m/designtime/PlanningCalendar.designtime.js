/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.PlanningCalendar control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "PLANNINGCALENDAR_NAME",
				plural: "PLANNINGCALENDAR_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY"
				// TODO: uncomment this when icon is avaiable
				// icons: {
				// 	svg: "sap/m/designtime/PlanningCalendar.icon.svg"
				// }
			},
			templates: {
				create: "sap/m/designtime/PlanningCalendar.create.fragment.xml"
			}
		};

	}, /* bExport= */ false);
