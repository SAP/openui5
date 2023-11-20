/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.fiori.SideNavigation control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "SIDE_NAVIGATION_NAME",
				plural: "SIDE_NAVIGATION_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});