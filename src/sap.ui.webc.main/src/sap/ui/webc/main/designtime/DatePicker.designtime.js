/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.DatePicker control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "DATEPICKER_NAME",
				plural: "DATEPICKER_NAME_PLURAL"
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