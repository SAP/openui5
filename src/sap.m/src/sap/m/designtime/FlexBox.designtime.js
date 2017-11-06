/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.FlexBox control
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
				items: {
					domRef: ":sap-domref",
					actions: {
						move: "moveControls"
					}
				}
			},
			name: {
				singular: "FLEXBOX_CONTROL_NAME",
				plural: "FLEXBOX_CONTROL_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);