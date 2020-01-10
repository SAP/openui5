/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Text control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "TEXT_NAME",
				plural: "TEXT_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/m/designtime/Text.icon.svg"
				}
			},
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
			templates: {
				create: "sap/m/designtime/Text.create.fragment.xml"
			}
		};
	});