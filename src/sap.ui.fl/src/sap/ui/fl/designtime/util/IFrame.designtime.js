/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/designtime/util/editIFrame"
], function(
	editIFrame
) {
	"use strict";

	return {
		actions: {
			settings() {
				return {
					icon: "sap-icon://write-new",
					name: "CTX_EDIT_IFRAME",
					isEnabled: true,
					handler: editIFrame
				};
			},
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl"
			}
		},
		properties: {
			url: {
				ignore: true
			},
			width: {
				ignore: true
			},
			height: {
				ignore: true
			},
			title: {
				ignore: true
			},
			asContainer: {
				ignore: true
			},
			renameInfo: {
				ignore: true
			},
			advancedSettings: {
				ignore: true
			},
			_settings: {
				ignore: true
			}
		}
	};
});