/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.RadioButton control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "RADIOBUTTON_NAME",
				plural: "RADIOBUTTON_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/RadioButton.icon.svg"
				}
			},
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
			templates: {
				create: "sap/m/designtime/RadioButton.create.fragment.xml"
			}
		};
	});