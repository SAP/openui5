/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.BlockLayout control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "LAYOUT",
				icons: {
					svg: "sap/ui/layout/designtime/BlockLayout.icon.svg"
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref",
					actions: {
						move: "moveControls"
					}
				}
			}
		};

	});