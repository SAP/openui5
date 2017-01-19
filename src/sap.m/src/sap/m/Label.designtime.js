/*!
 * ${copyright}
 */

// Provide the Design Time Metadata for the sap.m.Label control
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$()[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "LABEL_NAME",
				plural: "LABEL_NAME_PLURAL"
			}
		};
	}, /*bExport= */ false);