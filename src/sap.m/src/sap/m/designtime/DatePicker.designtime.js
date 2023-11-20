/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.DatePicker control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "DATEPICKER_NAME",
				plural: "DATEPICKER_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/DatePicker.icon.svg"
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
				create: "sap/m/designtime/DatePicker.create.fragment.xml"
			}
		};

	});