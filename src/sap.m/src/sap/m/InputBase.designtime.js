/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.InputBase control
sap.ui.define([],
	function () {
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
			name: {
				singular: "INPUT_BASE_NAME",
				plural: "INPUT_BASE_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);