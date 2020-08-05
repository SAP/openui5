/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Avatar control
sap.ui.define([],
	function () {
		"use strict";

		return {
			templates: {
				create: "sap/m/designtime/Avatar.create.fragment.xml"
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