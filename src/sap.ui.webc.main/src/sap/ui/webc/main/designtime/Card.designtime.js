/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.Card control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "CARD_NAME",
				plural: "CARD_NAME_PLURAL"
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