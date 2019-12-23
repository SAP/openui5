/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.OverflowToolbarButton control
sap.ui.define([], function () {
	"use strict";

	return {
		actions: {
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl"
			}
		},
		templates: {
			create: "sap/m/designtime/OverflowToolbarButton.create.fragment.xml"
		}
	};
}, /* bExport= */ false);