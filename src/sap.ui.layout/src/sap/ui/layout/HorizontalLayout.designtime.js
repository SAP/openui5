/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.HorizontalLayout control
sap.ui.define([],
	function() {
	"use strict";

	return {
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
		},
		name: {
			singular: "HORIZONTAL_LAYOUT_CONTROL_NAME",
			plural: "HORIZONTAL_LAYOUT_CONTROL_NAME_PLURAL"
		}
	};

}, /* bExport= */ false);
