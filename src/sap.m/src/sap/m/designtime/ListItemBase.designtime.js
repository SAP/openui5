/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ListItemBase control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "LIST_ITEM_BASE_NAME",
				plural: "LIST_ITEM_BASE_NAME_PLURAL"
			},
			palette: {
				group: "LIST",
				icons: {
					svg: "sap/m/designtime/ListItemBase.icon.svg"
				}
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