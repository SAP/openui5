/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.Button
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.getDomRef().getDomRef().querySelector("span>bdi");
						},
						isEnabled: function (oControl) {
							return oControl.getText().length > 0;
						},
						validators: [
							"noEmptyText"
						]
					};
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});