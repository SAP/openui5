/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.HorizontalLayout control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name: {
			singular: "HORIZONTAL_LAYOUT_CONTROL_NAME",
			plural: "HORIZONTAL_LAYOUT_CONTROL_NAME_PLURAL"
		},
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/ui/layout/designtime/HorizontalLayout.icon.svg"
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