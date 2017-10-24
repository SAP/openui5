/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Text control
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$()[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "TEXT_NAME",
				plural: "TEXT_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);