/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.Avatar control
sap.ui.define([],
	function () {
		"use strict";

		return {
			templates: {
				create: "sap/f/designtime/Avatar.create.fragment.xml"
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
	}, /* bExport= */ false);