/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/uxap/changeHandler/RenameObjectPageSection'
], function (RenameObjectPageSection) {
	"use strict";

	return {
		"rename": RenameObjectPageSection,
		"moveControls": "default",
		"hideControl": {
			"changeHandler": "default",
			"layers": {
				"USER": true
			}
		},
		"unhideControl": {
			"changeHandler": "default",
			"layers": {
				"USER": true
			}
		},
		"stashControl": {
			"changeHandler": "default",
			"layers": {
				"USER": true
			}
		},
		"unstashControl": {
			"changeHandler": "default",
			"layers": {
				"USER": true
			}
		}
	};
}, /* bExport= */ true);
