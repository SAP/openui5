/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Button control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "ACTION",
				icons: {
					svg: "sap/m/designtime/Button.icon.svg"
				}
			},
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
			},
			templates: {
				create: "sap/m/designtime/Button.create.fragment.xml"
			}
		};
	});