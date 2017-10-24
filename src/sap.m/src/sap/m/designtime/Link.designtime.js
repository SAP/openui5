/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Link control
sap.ui.define([],
		function () {
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
					singular: "LINK_NAME",
					plural: "LINK_NAME_PLURAL"
				}
			};
		}, /* bExport= */ false);
