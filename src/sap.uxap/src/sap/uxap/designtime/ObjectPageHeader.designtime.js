/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageHeader control
sap.ui.define([],
	function() {
		"use strict";

		return {
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/uxap/designtime/ObjectPageHeader.icon.svg"
				}
			},
			aggregations: {
				actions: {
					domRef : ":sap-domref .sapUxAPObjectPageHeaderIdentifierActions",
					actions : {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};

	}, /* bExport= */ false);