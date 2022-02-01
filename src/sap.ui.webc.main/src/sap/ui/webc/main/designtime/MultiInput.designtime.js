/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.MultiInput control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name: {
			singular: "MULTIINPUT_NAME",
			plural: "MULTIINPUT_NAME_PLURAL"
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