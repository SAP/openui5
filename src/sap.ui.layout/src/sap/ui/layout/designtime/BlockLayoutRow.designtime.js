/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.BlockLayoutRow control
sap.ui.define([],
	function () {
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
			}
		};

	});