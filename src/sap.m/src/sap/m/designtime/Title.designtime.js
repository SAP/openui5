/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Title control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "TITLE_NAME",
				plural: "TITLE_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/m/designtime/Title.icon.svg"
				}
			},
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
			templates: {
				create: "sap/m/designtime/Title.create.fragment.xml"
			}
		};
	});