/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/uxap/changeHandler/RenameObjectPageSection',
	'sap/uxap/changeHandler/UnstashObjectPageSection'
], function (
	RenameObjectPageSection,
	UnstashObjectPageSection
) {
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
			"changeHandler": UnstashObjectPageSection,
			"layers": {
				"USER": true
			}
		}
	};
}, /* bExport= */ true);
