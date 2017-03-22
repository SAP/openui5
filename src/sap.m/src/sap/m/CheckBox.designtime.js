/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.CheckBox control
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
						return oControl.$().find(".sapMCbLabel")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "CHECKBOX_NAME",
				plural: "CHECKBOX_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);