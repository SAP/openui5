/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ExpandableText control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "EXPANDABLE_TEXT_NAME",
				plural: "EXPANDABLE_TEXT_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/m/designtime/ExpandableText.icon.svg"
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
				create: "sap/m/designtime/ExpandableText.create.fragment.xml"
			}
		};
	});