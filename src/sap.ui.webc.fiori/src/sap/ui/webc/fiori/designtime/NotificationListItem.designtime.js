/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.fiori.NotificationListItem control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "NOTIFICATION_LIST_ITEM_NAME",
				plural: "NOTIFICATION_LIST_ITEM_PLURAL"
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