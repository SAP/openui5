/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.VBox control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "VBOX_NAME",
				plural: "VBOX_NAME_PLURAL"
			},
			palette: {
				group: "LAYOUT",
				icons: {
					svg: "sap/m/designtime/VBox.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/VBox.create.fragment.xml"
			}
		};
	});