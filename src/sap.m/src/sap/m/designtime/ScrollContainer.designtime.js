/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ScrollContainer control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/m/designtime/ScrollContainer.icon.svg"
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
			aggregations: {
				content: {
					domRef: ":sap-domref",
					actions: {
						move: "moveControls"
					}
				}
			},
			name: {
				singular: "SCROLL_CONTAINER_CONTROL_NAME",
				plural: "SCROLL_CONTAINER_CONTROL_NAME_PLURAL"
			}
		};
	});