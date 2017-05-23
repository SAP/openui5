/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageHeader control
sap.ui.define([],
	function() {
		"use strict";

		return {
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