/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.DateTimePicker control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "DATETIMEPICKER_NAME",
				plural: "DATETIMEPICKER_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/DateTimePicker.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/DateTimePicker.create.fragment.xml"
			}
		};

	});