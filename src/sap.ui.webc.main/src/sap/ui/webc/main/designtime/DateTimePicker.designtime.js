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
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});