/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.RadioButton control
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
						return oControl.$().find(".sapMRbBLabel")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "RADIOBUTTON_NAME",
				plural: "RADIOBUTTON_NAME_PLURAL"
			}
		};
	}, /* bExport= */ false);