/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Title control
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
						return oControl.$().find("span")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "TITLE_NAME",
				plural: "TITLE_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);