/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.CustomListItem control
sap.ui.define([],
	function() {
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
			content: {
				actions: {
					move: {
						changeType: "moveControls"
					}
				}
			}
		}
	};

});