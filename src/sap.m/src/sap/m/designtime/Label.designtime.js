/*!
 * ${copyright}
 */

// Provide the Design Time Metadata for the sap.m.Label control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "LABEL_NAME",
				plural: "LABEL_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/m/designtime/Label.icon.svg"
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
				create: "sap/m/designtime/Label.create.fragment.xml"
			}
		};
	});