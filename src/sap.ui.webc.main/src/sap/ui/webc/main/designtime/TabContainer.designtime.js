/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.TabContainer control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "TABCONTAINER_NAME",
				plural: "TABCONTAINER_NAME_PLURAL"
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