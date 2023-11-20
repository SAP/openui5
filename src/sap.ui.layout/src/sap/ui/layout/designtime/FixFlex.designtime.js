/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.FixFlex control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				fixContent: {
					domRef: ":sap-domref > .sapUiFixFlexFixed",
					actions: {
						move: "moveControls"
					}
				},
				flexContent: {
					domRef: ":sap-domref > .sapUiFixFlexFlexible"
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