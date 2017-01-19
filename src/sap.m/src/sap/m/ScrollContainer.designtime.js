/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ScrollContainer control
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
				singular: "SCROLL_CONTAINER_CONTROL_NAME",
				plural: "SCROLL_CONTAINER_CONTROL_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);