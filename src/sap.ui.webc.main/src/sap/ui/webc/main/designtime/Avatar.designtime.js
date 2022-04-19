/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.Avatar control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "AVATAR_NAME",
				plural: "AVATAR_NAME_PLURAL"
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