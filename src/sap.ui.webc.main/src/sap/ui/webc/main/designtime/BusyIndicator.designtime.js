/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.BusyIndicator control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "BUSYINDICATOR_NAME",
				plural: "BUSYINDICATOR_NAME_PLURAL"
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