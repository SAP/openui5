/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.InputBase control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "INPUT_BASE_NAME",
				plural: "INPUT_BASE_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/InputBase.icon.svg"
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			templates: {
				create: "sap/m/designtime/Input.create.fragment.xml"
			}
		};
	});