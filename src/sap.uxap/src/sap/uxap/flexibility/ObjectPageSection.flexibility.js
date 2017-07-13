/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "title",
			translationTextType: "XGRP"
		}),
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
