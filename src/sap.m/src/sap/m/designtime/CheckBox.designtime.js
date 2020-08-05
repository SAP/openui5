/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.CheckBox control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "CHECKBOX_NAME",
				plural: "CHECKBOX_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/CheckBox.icon.svg"
				}
			},
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
			templates: {
				create: "sap/m/designtime/CheckBox.create.fragment.xml"
			}
		};
	});