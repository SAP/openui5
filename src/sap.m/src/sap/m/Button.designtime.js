/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Button control
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				combine: {
					changeType: "combineButtons",
					changeOnRelevantContainer : true,
					isEnabled : true
				},
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapMBtnContent")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	}, /* bExport= */ false);