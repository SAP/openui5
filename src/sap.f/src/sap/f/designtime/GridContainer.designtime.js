/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.GridContainer control
sap.ui.define([], function () {
	"use strict";

	return {
		name: {
			singular: "GRID_CONTAINER_CONTROL_NAME",
			plural: "GRID_CONTAINER_CONTROL_NAME_PLURAL"
		},
		actions: {
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl"
			}
		},
		aggregations: {
			items: {
				domRef: ":sap-domref",
				actions: {
					move: "moveControls"
				}
			}
		}
	};
});