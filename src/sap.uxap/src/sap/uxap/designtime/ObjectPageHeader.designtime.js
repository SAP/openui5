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
					},
					name: {
						singular: "OBJECT_PAGE_HEADER_NAME",
						plural: "OBJECT_PAGE_HEADER_NAME_PLURAL"
					}
				}
			}
		};

	});