/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.unified.CalendarLegend control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "CALENDARLEGEND_NAME",
				plural: "CALENDARLEGEND_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY"
				// TODO: uncoment icons when it is ready
				// icons: {
				// 	svg: "sap/ui/unified/designtime/CalendarLegend.icon.svg"
				// }
			},
			templates: {
				create: "sap/ui/unified/designtime/CalendarLegend.create.fragment.xml"
			}
		};

	});