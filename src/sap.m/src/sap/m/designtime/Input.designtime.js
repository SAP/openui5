/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.InputBase control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "INPUT_NAME",
				plural: "INPUT_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/Input.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/Input.create.fragment.xml"
			}
		};
	});