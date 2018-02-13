/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.unified.CalendarDateInterval control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "CALENDARDATEINTERVAL_NAME",
				plural: "CALENDARDATEINTERVAL_NAME_PLURAL"
			},
			palette: {
				group: "INPUT"
				// TODO: uncoment icons when it is ready
				// icons: {
				// 	svg: "sap/ui/unified/designtime/CalendarDateInterval.icon.svg"
				// }
			},
			templates: {
				create: "sap/ui/unified/designtime/CalendarDateInterval.create.fragment.xml"
			}
		};

	}, /* bExport= */ false);
