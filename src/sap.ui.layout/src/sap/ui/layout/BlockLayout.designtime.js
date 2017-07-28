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
			}
		};

	}, /* bExport= */ false);