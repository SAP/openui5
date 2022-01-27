/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.Input control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "INPUT_NAME",
				plural: "INPUT_NAME_PLURAL"
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