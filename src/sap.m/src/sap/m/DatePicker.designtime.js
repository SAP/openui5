/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.DatePicker control
sap.ui.define([],
	function() {
		"use strict";

		return {
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "DATEPICKER_NAME",
				plural: "DATEPICKER_NAME_PLURAL"
			}
		};

	}, /* bExport= */ false);
