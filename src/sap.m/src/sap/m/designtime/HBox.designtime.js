/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.HBox control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "HBOX_NAME",
				plural: "HBOX_NAME_PLURAL"
			},
			palette: {
				group: "LAYOUT",
				icons: {
					svg: "sap/m/designtime/HBox.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/HBox.create.fragment.xml"
			}
		};
	});