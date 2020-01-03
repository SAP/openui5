/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.BlockLayout control
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
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapUiBlockCellTitle")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};

	});