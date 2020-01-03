/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.Grid control
sap.ui.define([],
	function () {
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
			aggregations: {
				content: {
					domRef: ":sap-domref",
					actions: {
						move: "moveControls"
					}
				}
			},
			name: {
				singular: "GRID_CONTROL_NAME",
				plural: "GRID_CONTROL_NAME_PLURAL"
			}
		};
	});