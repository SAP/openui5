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
				singular: "FLEX_BOX_NAME",
				plural: "FLEX_BOX_NAME_PLURAL"
			},
			templates: {
				create: "sap/m/designtime/FlexBox.create.fragment.xml"
			}
		};
	});